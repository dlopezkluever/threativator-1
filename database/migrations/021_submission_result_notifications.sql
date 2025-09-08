-- Add submission result notification triggers
-- This handles both AI grading and human witness grading result notifications

-- Function to send submission result notification via HTTP
CREATE OR REPLACE FUNCTION trigger_submission_result_notification()
RETURNS TRIGGER AS $$
DECLARE
    service_key TEXT;
    supabase_url TEXT;
    response JSONB;
BEGIN
    -- Only trigger for status changes to 'passed' or 'failed'
    IF OLD.status != NEW.status AND NEW.status IN ('passed', 'failed') THEN
        -- Get configuration values
        service_key := current_setting('app.settings.service_role_key', true);
        supabase_url := current_setting('app.settings.supabase_url', true);
        
        -- Skip if not configured
        IF service_key IS NULL OR service_key = '' OR supabase_url IS NULL OR supabase_url = '' THEN
            RAISE NOTICE 'Submission notification skipped: service configuration missing';
            RETURN NEW;
        END IF;

        -- Make HTTP request to send notification (async, non-blocking)
        PERFORM
            net.http_post(
                url := supabase_url || '/functions/v1/sendSubmissionResultNotification',
                headers := jsonb_build_object(
                    'Content-Type', 'application/json',
                    'Authorization', 'Bearer ' || service_key
                ),
                body := jsonb_build_object(
                    'submission_id', NEW.id::text,
                    'old_status', OLD.status,
                    'new_status', NEW.status,
                    'graded_at', NEW.graded_at
                )
            );
            
        RAISE NOTICE 'Submission result notification triggered for submission %', NEW.id;
    END IF;
    
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't break the submission update
    RAISE NOTICE 'Error triggering submission notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for submission status changes
DROP TRIGGER IF EXISTS submission_result_notification_trigger ON submissions;
CREATE TRIGGER submission_result_notification_trigger
    AFTER UPDATE OF status ON submissions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_submission_result_notification();

-- Grant permissions
GRANT EXECUTE ON FUNCTION trigger_submission_result_notification() TO service_role;

-- Create a manual trigger function for testing
CREATE OR REPLACE FUNCTION test_submission_notification(submission_id_param UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    service_key TEXT;
    supabase_url TEXT;
    response http_response;
BEGIN
    -- Get configuration
    service_key := current_setting('app.settings.service_role_key', true);
    supabase_url := current_setting('app.settings.supabase_url', true);
    
    IF service_key IS NULL OR supabase_url IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Configuration missing'
        );
    END IF;

    -- Make test HTTP request
    SELECT * INTO response
    FROM http((
        'POST',
        supabase_url || '/functions/v1/sendSubmissionResultNotification',
        ARRAY[
            http_header('Authorization', 'Bearer ' || service_key),
            http_header('Content-Type', 'application/json')
        ],
        'application/json',
        jsonb_build_object(
            'submission_id', submission_id_param::text,
            'test_mode', true
        )::text
    ));
    
    RETURN jsonb_build_object(
        'success', response.status = 200,
        'status', response.status,
        'response', response.content::jsonb
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- Grant test function permissions
GRANT EXECUTE ON FUNCTION test_submission_notification(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION test_submission_notification(UUID) TO service_role;

-- Add notification preferences to user metadata (default enabled)
-- This is a helper function for Task 9.4
CREATE OR REPLACE FUNCTION get_user_notification_preferences(user_id_param UUID)
RETURNS JSONB AS $$
DECLARE
    user_record RECORD;
    preferences JSONB;
BEGIN
    -- Try to get from dedicated notification_preferences table first (Task 9.4)
    SELECT notification_preferences INTO preferences
    FROM notification_preferences
    WHERE user_id = user_id_param;
    
    -- If no dedicated preferences, use defaults
    IF preferences IS NULL THEN
        preferences := jsonb_build_object(
            'deadline_reminders', true,
            'submission_results', true,
            'consequence_notifications', true,
            'goal_completion', true
        );
    END IF;
    
    RETURN preferences;
    
EXCEPTION WHEN OTHERS THEN
    -- Return defaults if table doesn't exist
    RETURN jsonb_build_object(
        'deadline_reminders', true,
        'submission_results', true,
        'consequence_notifications', true,
        'goal_completion', true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_notification_preferences(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION get_user_notification_preferences(UUID) TO authenticated;

COMMENT ON FUNCTION trigger_submission_result_notification() IS 
'Triggers submission result notifications when status changes to passed/failed';

COMMENT ON FUNCTION test_submission_notification(UUID) IS 
'Test function to manually trigger submission result notifications';

COMMENT ON FUNCTION get_user_notification_preferences(UUID) IS 
'Returns user notification preferences with defaults if not set';