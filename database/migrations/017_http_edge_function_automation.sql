-- Migration 017: Connect pg_cron to Edge Function via HTTP
-- This enables full automation of the consequence processing system

-- Step 1: Enable the http extension for making HTTP requests from database
-- Note: This may need to be enabled via Supabase Dashboard if SQL fails
CREATE EXTENSION IF NOT EXISTS http;

-- Step 2: Create function to call Edge Function via HTTP
CREATE OR REPLACE FUNCTION trigger_edge_function_http()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  http_response http_response;
  response_status INTEGER;
  response_body TEXT;
  overdue_count INTEGER;
  supabase_url TEXT;
  service_key TEXT;
BEGIN
  -- Get configuration from environment or use defaults
  supabase_url := current_setting('app.supabase_url', true);
  service_key := current_setting('app.service_role_key', true);
  
  -- Fallback to hardcoded values if environment variables not set
  IF supabase_url IS NULL THEN
    supabase_url := 'https://ksbbgnrphqhwixwnjdri.supabase.co';
  END IF;
  
  -- Log start of HTTP call
  RAISE NOTICE 'Starting automated consequence processing via HTTP at %', NOW();
  
  -- Check if there are any overdue items to process
  SELECT COUNT(*) INTO overdue_count FROM check_overdue_checkpoints();
  
  IF overdue_count = 0 THEN
    RAISE NOTICE 'No overdue items found, skipping HTTP call';
    RETURN 'No overdue items - HTTP call skipped';
  END IF;
  
  RAISE NOTICE 'Found % overdue item(s), calling Edge Function', overdue_count;
  
  -- Make HTTP POST request to Edge Function
  -- Note: We use a placeholder auth header since Edge Function will use service role key
  SELECT * INTO http_response FROM http((
    'POST',
    supabase_url || '/functions/v1/triggerConsequence',
    ARRAY[
      http_header('Content-Type', 'application/json'),
      http_header('Authorization', 'Bearer ' || COALESCE(service_key, 'placeholder'))
    ],
    'application/json',
    '{"source": "pg_cron_automation", "timestamp": "' || NOW()::TEXT || '"}'
  ));
  
  -- Extract response details
  response_status := http_response.status;
  response_body := http_response.content;
  
  -- Log results
  RAISE NOTICE 'Edge Function HTTP response: status %, body: %', response_status, response_body;
  
  -- Return result summary
  IF response_status BETWEEN 200 AND 299 THEN
    RETURN 'Edge Function called successfully at ' || NOW()::TEXT || '. Status: ' || response_status;
  ELSE
    RAISE WARNING 'Edge Function HTTP call failed with status %: %', response_status, response_body;
    RETURN 'Edge Function call failed at ' || NOW()::TEXT || '. Status: ' || response_status;
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  -- Log any errors but don't fail the cron job
  RAISE WARNING 'Error calling Edge Function: %', SQLERRM;
  RETURN 'Error calling Edge Function: ' || SQLERRM;
END;
$$;

GRANT EXECUTE ON FUNCTION trigger_edge_function_http() TO service_role;

-- Step 3: Remove old cron job and create new one that calls Edge Function
SELECT cron.unschedule('consequence-processor');

SELECT cron.schedule(
  'consequence-processor-automated',
  '*/5 * * * *',  -- Every 5 minutes
  'SELECT trigger_edge_function_http();'
);

-- Step 4: Create function to test HTTP connection without cron
CREATE OR REPLACE FUNCTION test_edge_function_http()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result TEXT;
BEGIN
  SELECT trigger_edge_function_http() INTO result;
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION test_edge_function_http() TO authenticated;

-- Step 5: Create function to check new cron job status
CREATE OR REPLACE FUNCTION check_automated_cron_status()
RETURNS TABLE (
  jobname TEXT,
  schedule TEXT,
  active BOOLEAN,
  command TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    jobname::TEXT,
    schedule::TEXT,
    active,
    command::TEXT
  FROM cron.job 
  WHERE jobname = 'consequence-processor-automated';
$$;

GRANT EXECUTE ON FUNCTION check_automated_cron_status() TO authenticated;

-- Instructions:
--
-- 1. If http extension fails to install via SQL, enable it manually:
--    Supabase Dashboard > Database > Extensions > Enable "http"
--
-- 2. To test HTTP connection manually:
--    SELECT test_edge_function_http();
--
-- 3. To check if automated cron job is running:
--    SELECT * FROM check_automated_cron_status();
--
-- 4. To view cron execution logs:
--    SELECT * FROM cron.job_run_details 
--    WHERE jobname = 'consequence-processor-automated' 
--    ORDER BY start_time DESC LIMIT 5;
--
-- 5. To temporarily disable automation:
--    SELECT cron.unschedule('consequence-processor-automated');
--
-- 6. Environment variables needed for production:
--    SET app.supabase_url = 'https://your-project.supabase.co';
--    SET app.service_role_key = 'your-service-role-key';