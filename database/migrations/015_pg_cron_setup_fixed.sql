-- Migration 015 (Fixed): pg_cron Setup for Consequence Processing
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

-- Create function to check if cron job is running (simplified version)
CREATE OR REPLACE FUNCTION check_cron_job_status()
RETURNS TABLE (
  jobname TEXT,
  schedule TEXT,
  active BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    jobname::TEXT,
    schedule::TEXT,
    active
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

-- Create function to check recent job runs (works with different pg_cron versions)
CREATE OR REPLACE FUNCTION check_recent_cron_runs()
RETURNS TABLE (
  jobname TEXT,
  status TEXT,
  start_time TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Try to get run details, handle if columns don't exist
  BEGIN
    RETURN QUERY
    SELECT 
      j.jobname::TEXT,
      CASE WHEN d.status IS NOT NULL THEN d.status::TEXT ELSE 'unknown' END,
      COALESCE(d.start_time, NOW() - INTERVAL '1 minute') as start_time
    FROM cron.job j
    LEFT JOIN cron.job_run_details d ON j.jobid = d.jobid
    WHERE j.jobname LIKE 'consequence-%'
    ORDER BY start_time DESC LIMIT 10;
  EXCEPTION WHEN OTHERS THEN
    -- Fallback if job_run_details doesn't have expected columns
    RETURN QUERY
    SELECT 
      j.jobname::TEXT,
      'scheduled'::TEXT as status,
      NOW() as start_time
    FROM cron.job j
    WHERE j.jobname LIKE 'consequence-%';
  END;
END;
$$;

GRANT EXECUTE ON FUNCTION check_recent_cron_runs() TO authenticated;

-- Instructions for managing the cron job:
-- 
-- To view all cron jobs:
-- SELECT * FROM cron.job;
--
-- To remove the consequence processor job:
-- SELECT cron.unschedule('consequence-processor');
--
-- To check if job is scheduled:
-- SELECT * FROM check_cron_job_status();
--
-- To check recent runs:
-- SELECT * FROM check_recent_cron_runs();