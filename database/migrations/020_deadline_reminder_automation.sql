-- Set up automated deadline reminder system using pg_cron
-- Runs every hour to check for upcoming deadlines

-- First, ensure we have the necessary extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;

-- Set configuration values (replace with actual values in production)
-- These should be set via Supabase dashboard or environment variables
ALTER DATABASE postgres SET app.settings.service_role_key = 'your-service-role-key-here';
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://your-project.supabase.co';

-- Create a more robust trigger function that handles the HTTP call
CREATE OR REPLACE FUNCTION trigger_deadline_reminders_http()
RETURNS JSONB AS $$
DECLARE
    service_key TEXT;
    supabase_url TEXT;
    response http_response;
    result JSONB;
BEGIN
    -- Get configuration values
    service_key := current_setting('app.settings.service_role_key', true);
    supabase_url := current_setting('app.settings.supabase_url', true);
    
    IF service_key IS NULL OR service_key = '' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Service role key not configured'
        );
    END IF;
    
    IF supabase_url IS NULL OR supabase_url = '' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Supabase URL not configured'
        );
    END IF;

    -- Make HTTP request to Edge Function
    SELECT * INTO response
    FROM http((
        'POST',
        supabase_url || '/functions/v1/sendDeadlineReminders',
        ARRAY[
            http_header('Authorization', 'Bearer ' || service_key),
            http_header('Content-Type', 'application/json')
        ],
        'application/json',
        '{}'
    ));
    
    -- Parse the response
    IF response.status = 200 THEN
        result := response.content::jsonb;
    ELSE
        result := jsonb_build_object(
            'success', false,
            'error', 'HTTP request failed',
            'status', response.status,
            'response', response.content
        );
    END IF;
    
    -- Log the result
    INSERT INTO notification_log (
        user_id,
        notification_type,
        reminder_type,
        recipient_email,
        subject,
        delivery_status,
        delivery_error
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', -- System user
        'deadline_reminder',
        'system',
        'system@threativator.com',
        'Deadline Reminder Batch Process',
        CASE WHEN result->>'success' = 'true' THEN 'sent' ELSE 'failed' END,
        CASE WHEN result->>'success' = 'false' THEN result->>'error' ELSE NULL END
    );
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    -- Log any errors
    INSERT INTO notification_log (
        user_id,
        notification_type,
        reminder_type,
        recipient_email,
        subject,
        delivery_status,
        delivery_error
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', -- System user
        'deadline_reminder',
        'system',
        'system@threativator.com',
        'Deadline Reminder Batch Process - ERROR',
        'failed',
        SQLERRM
    );
    
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Failed to trigger deadline reminders',
        'details', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION trigger_deadline_reminders_http() TO service_role;

-- Remove any existing deadline reminder cron jobs
SELECT cron.unschedule('deadline-reminders-hourly');
SELECT cron.unschedule('deadline-reminders');

-- Create new cron job that runs every hour at minute 0
-- This will check for deadlines that need 24h or 1h reminders
SELECT cron.schedule(
    'deadline-reminders-hourly',
    '0 * * * *',  -- Every hour at minute 0
    'SELECT trigger_deadline_reminders_http();'
);

-- Create a more frequent check for 1h reminders (every 15 minutes)
-- This ensures we don't miss critical 1h reminders
SELECT cron.schedule(
    'deadline-reminders-frequent',
    '*/15 * * * *',  -- Every 15 minutes
    'SELECT trigger_deadline_reminders_http();'
);

-- Create a test function for manual testing
CREATE OR REPLACE FUNCTION test_deadline_reminders()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT trigger_deadline_reminders_http() INTO result;
    
    RAISE NOTICE 'Deadline reminder test result: %', result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions for test function
GRANT EXECUTE ON FUNCTION test_deadline_reminders() TO authenticated;
GRANT EXECUTE ON FUNCTION test_deadline_reminders() TO service_role;

-- Create a function to check cron job status
CREATE OR REPLACE FUNCTION get_deadline_reminder_status()
RETURNS TABLE(
    jobname TEXT,
    schedule TEXT,
    active BOOLEAN,
    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.jobname::TEXT,
        j.schedule::TEXT,
        j.active,
        j.last_run,
        j.next_run
    FROM cron.job j
    WHERE j.jobname LIKE '%deadline-reminder%'
    ORDER BY j.jobname;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions for status function
GRANT EXECUTE ON FUNCTION get_deadline_reminder_status() TO authenticated;
GRANT EXECUTE ON FUNCTION get_deadline_reminder_status() TO service_role;

-- Create a function to get recent notification logs
CREATE OR REPLACE FUNCTION get_recent_notifications(hours_back INTEGER DEFAULT 24)
RETURNS TABLE(
    id UUID,
    notification_type TEXT,
    reminder_type TEXT,
    recipient_email TEXT,
    subject TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivery_status TEXT,
    delivery_error TEXT,
    hours_until_deadline INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.notification_type,
        n.reminder_type,
        n.recipient_email,
        n.subject,
        n.sent_at,
        n.delivery_status,
        n.delivery_error,
        n.hours_until_deadline
    FROM notification_log n
    WHERE n.sent_at >= NOW() - INTERVAL '1 hour' * hours_back
    ORDER BY n.sent_at DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions for recent notifications function
GRANT EXECUTE ON FUNCTION get_recent_notifications(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_notifications(INTEGER) TO service_role;

-- Add a comment explaining the system
COMMENT ON FUNCTION trigger_deadline_reminders_http() IS 
'Triggers deadline reminder emails by calling the sendDeadlineReminders Edge Function. Runs automatically via pg_cron every hour and every 15 minutes for critical reminders.';

COMMENT ON FUNCTION test_deadline_reminders() IS 
'Test function to manually trigger deadline reminders and check system status. Use: SELECT test_deadline_reminders();';

COMMENT ON FUNCTION get_deadline_reminder_status() IS 
'Returns status of all deadline reminder cron jobs. Use: SELECT * FROM get_deadline_reminder_status();';

COMMENT ON FUNCTION get_recent_notifications(INTEGER) IS 
'Returns recent notification logs for monitoring. Use: SELECT * FROM get_recent_notifications(24);';

-- Create a view for easier monitoring
CREATE OR REPLACE VIEW deadline_reminder_monitoring AS
SELECT 
    'System Status' as category,
    'Cron Jobs' as metric,
    (
        SELECT COUNT(*)::TEXT || ' active jobs'
        FROM cron.job 
        WHERE jobname LIKE '%deadline-reminder%' AND active = true
    ) as value,
    NOW() as checked_at

UNION ALL

SELECT 
    'Recent Activity' as category,
    'Last 24h Notifications' as metric,
    (
        SELECT COUNT(*)::TEXT || ' notifications sent'
        FROM notification_log 
        WHERE sent_at >= NOW() - INTERVAL '24 hours'
        AND notification_type = 'deadline_reminder'
        AND delivery_status = 'sent'
    ) as value,
    NOW() as checked_at

UNION ALL

SELECT 
    'Error Rate' as category,
    'Failed Notifications' as metric,
    (
        SELECT COUNT(*)::TEXT || ' failures in last 24h'
        FROM notification_log 
        WHERE sent_at >= NOW() - INTERVAL '24 hours'
        AND notification_type = 'deadline_reminder'
        AND delivery_status = 'failed'
    ) as value,
    NOW() as checked_at

UNION ALL

SELECT 
    'Next Deadline' as category,
    'Upcoming Reminder' as metric,
    (
        SELECT COALESCE(
            EXTRACT(EPOCH FROM MIN(deadline_date) - NOW()) / 3600::NUMERIC || ' hours until next deadline',
            'No upcoming deadlines'
        )
        FROM (
            SELECT deadline as deadline_date FROM checkpoints WHERE status = 'pending' AND deadline > NOW()
            UNION ALL
            SELECT final_deadline as deadline_date FROM goals WHERE status = 'active' AND final_deadline > NOW()
        ) upcoming
    ) as value,
    NOW() as checked_at;

-- Grant access to the monitoring view
GRANT SELECT ON deadline_reminder_monitoring TO authenticated;
GRANT SELECT ON deadline_reminder_monitoring TO service_role;