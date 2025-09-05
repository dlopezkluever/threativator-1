-- Migration 015: pg_cron Setup for Consequence Processing
-- PREREQUISITES:
-- 1. pg_cron extension must be enabled in Supabase Dashboard: Database > Extensions > pg_cron
-- 2. Previous migration 014_consequence_engine_setup.sql must be applied

-- Schedule consequence processing to run every 5 minutes
-- Note: This creates a permanent cron job that will persist until manually removed
SELECT cron.schedule(
  'consequence-processor',           -- job name
  '*/5 * * * *',                    -- every 5 minutes
  'SELECT trigger_consequence_processing();'  -- SQL to execute
);

-- Optional: Create a more frequent job for testing (every minute)
-- Uncomment this for development/testing, comment out for production
-- SELECT cron.schedule(
--   'consequence-processor-test',
--   '* * * * *',
--   'SELECT trigger_consequence_processing();'
-- );

-- Create function to check if cron job is running
CREATE OR REPLACE FUNCTION check_cron_job_status()
RETURNS TABLE (
  jobname TEXT,
  schedule TEXT,
  active BOOLEAN,
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    jobname::TEXT,
    schedule::TEXT,
    active,
    last_run,
    next_run
  FROM cron.job 
  WHERE jobname LIKE 'consequence-%';
$$;

GRANT EXECUTE ON FUNCTION check_cron_job_status() TO authenticated;

-- Create function to manually trigger consequence processing (for testing)
CREATE OR REPLACE FUNCTION manual_consequence_trigger()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result TEXT;
BEGIN
  PERFORM trigger_consequence_processing();
  result := 'Consequence processing triggered manually at ' || NOW()::TEXT;
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION manual_consequence_trigger() TO authenticated;

-- Instructions for managing the cron job:
-- 
-- To view all cron jobs:
-- SELECT * FROM cron.job;
--
-- To remove the consequence processor job:
-- SELECT cron.unschedule('consequence-processor');
--
-- To check job execution history:
-- SELECT * FROM cron.job_run_details 
-- WHERE jobname = 'consequence-processor' 
-- ORDER BY start_time DESC LIMIT 10;