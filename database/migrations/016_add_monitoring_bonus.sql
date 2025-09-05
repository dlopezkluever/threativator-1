-- Add these bonus functions to your database
-- (Copy from the _fixed.sql file)

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