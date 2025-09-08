-- Create notification preferences system
-- Allows users to control which types of email notifications they receive

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    
    -- Notification type preferences
    deadline_reminders BOOLEAN DEFAULT TRUE,
    submission_results BOOLEAN DEFAULT TRUE,
    consequence_notifications BOOLEAN DEFAULT TRUE,
    goal_completion BOOLEAN DEFAULT TRUE,
    
    -- Frequency preferences
    digest_frequency TEXT DEFAULT 'immediate' CHECK (digest_frequency IN ('immediate', 'daily', 'weekly', 'disabled')),
    reminder_frequency TEXT DEFAULT 'both' CHECK (reminder_frequency IN ('24h_only', '1h_only', 'both', 'disabled')),
    
    -- Contact preferences
    email_enabled BOOLEAN DEFAULT TRUE,
    unsubscribe_token UUID DEFAULT uuid_generate_v4() UNIQUE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per user
    CONSTRAINT notification_preferences_user_unique UNIQUE (user_id)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_unsubscribe_token ON notification_preferences(unsubscribe_token);

-- Function to get or create user notification preferences
CREATE OR REPLACE FUNCTION get_or_create_notification_preferences(p_user_id UUID)
RETURNS notification_preferences AS $$
DECLARE
    preferences notification_preferences;
BEGIN
    -- Try to get existing preferences
    SELECT * INTO preferences
    FROM notification_preferences
    WHERE user_id = p_user_id;
    
    -- If not found, create with defaults
    IF NOT FOUND THEN
        INSERT INTO notification_preferences (
            user_id,
            deadline_reminders,
            submission_results,
            consequence_notifications,
            goal_completion,
            digest_frequency,
            reminder_frequency,
            email_enabled
        ) VALUES (
            p_user_id,
            TRUE,  -- deadline_reminders
            TRUE,  -- submission_results
            TRUE,  -- consequence_notifications
            TRUE,  -- goal_completion
            'immediate',  -- digest_frequency
            'both',  -- reminder_frequency
            TRUE   -- email_enabled
        )
        RETURNING * INTO preferences;
    END IF;
    
    RETURN preferences;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update notification preferences
CREATE OR REPLACE FUNCTION update_notification_preferences(
    p_user_id UUID,
    p_deadline_reminders BOOLEAN DEFAULT NULL,
    p_submission_results BOOLEAN DEFAULT NULL,
    p_consequence_notifications BOOLEAN DEFAULT NULL,
    p_goal_completion BOOLEAN DEFAULT NULL,
    p_digest_frequency TEXT DEFAULT NULL,
    p_reminder_frequency TEXT DEFAULT NULL,
    p_email_enabled BOOLEAN DEFAULT NULL
)
RETURNS notification_preferences AS $$
DECLARE
    preferences notification_preferences;
    update_data JSONB := '{}'::JSONB;
BEGIN
    -- Build dynamic update object
    IF p_deadline_reminders IS NOT NULL THEN
        update_data = update_data || jsonb_build_object('deadline_reminders', p_deadline_reminders);
    END IF;
    
    IF p_submission_results IS NOT NULL THEN
        update_data = update_data || jsonb_build_object('submission_results', p_submission_results);
    END IF;
    
    IF p_consequence_notifications IS NOT NULL THEN
        update_data = update_data || jsonb_build_object('consequence_notifications', p_consequence_notifications);
    END IF;
    
    IF p_goal_completion IS NOT NULL THEN
        update_data = update_data || jsonb_build_object('goal_completion', p_goal_completion);
    END IF;
    
    IF p_digest_frequency IS NOT NULL THEN
        update_data = update_data || jsonb_build_object('digest_frequency', p_digest_frequency);
    END IF;
    
    IF p_reminder_frequency IS NOT NULL THEN
        update_data = update_data || jsonb_build_object('reminder_frequency', p_reminder_frequency);
    END IF;
    
    IF p_email_enabled IS NOT NULL THEN
        update_data = update_data || jsonb_build_object('email_enabled', p_email_enabled);
    END IF;
    
    -- Ensure preferences exist first
    PERFORM get_or_create_notification_preferences(p_user_id);
    
    -- Update preferences with dynamic data
    UPDATE notification_preferences
    SET 
        deadline_reminders = COALESCE((update_data->>'deadline_reminders')::BOOLEAN, deadline_reminders),
        submission_results = COALESCE((update_data->>'submission_results')::BOOLEAN, submission_results),
        consequence_notifications = COALESCE((update_data->>'consequence_notifications')::BOOLEAN, consequence_notifications),
        goal_completion = COALESCE((update_data->>'goal_completion')::BOOLEAN, goal_completion),
        digest_frequency = COALESCE(update_data->>'digest_frequency', digest_frequency),
        reminder_frequency = COALESCE(update_data->>'reminder_frequency', reminder_frequency),
        email_enabled = COALESCE((update_data->>'email_enabled')::BOOLEAN, email_enabled),
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING * INTO preferences;
    
    RETURN preferences;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for unsubscribe functionality
CREATE OR REPLACE FUNCTION unsubscribe_user(p_unsubscribe_token UUID)
RETURNS JSONB AS $$
DECLARE
    affected_rows INTEGER;
    user_email TEXT;
BEGIN
    -- Update preferences to disable all notifications
    UPDATE notification_preferences
    SET 
        deadline_reminders = FALSE,
        submission_results = FALSE,
        consequence_notifications = FALSE,
        goal_completion = FALSE,
        email_enabled = FALSE,
        digest_frequency = 'disabled',
        updated_at = NOW()
    WHERE unsubscribe_token = p_unsubscribe_token;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    IF affected_rows = 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid unsubscribe token'
        );
    END IF;
    
    -- Get user email for confirmation
    SELECT u.email INTO user_email
    FROM notification_preferences np
    JOIN auth.users u ON u.id = np.user_id
    WHERE np.unsubscribe_token = p_unsubscribe_token;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Successfully unsubscribed from all notifications',
        'email', COALESCE(user_email, 'unknown')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user should receive specific notification type
CREATE OR REPLACE FUNCTION should_receive_notification(
    p_user_id UUID,
    p_notification_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    preferences notification_preferences;
    should_receive BOOLEAN := TRUE;
BEGIN
    -- Get user preferences
    SELECT * INTO preferences
    FROM notification_preferences
    WHERE user_id = p_user_id;
    
    -- If no preferences found, default to TRUE (enabled)
    IF NOT FOUND THEN
        RETURN TRUE;
    END IF;
    
    -- Check if email is globally disabled
    IF NOT preferences.email_enabled THEN
        RETURN FALSE;
    END IF;
    
    -- Check specific notification type
    CASE p_notification_type
        WHEN 'deadline_reminders', 'deadline_reminder' THEN
            should_receive := preferences.deadline_reminders AND preferences.reminder_frequency != 'disabled';
        WHEN 'submission_results', 'submission_result' THEN
            should_receive := preferences.submission_results;
        WHEN 'consequence_notifications', 'consequence' THEN
            should_receive := preferences.consequence_notifications;
        WHEN 'goal_completion' THEN
            should_receive := preferences.goal_completion;
        ELSE
            -- Unknown notification type, default to enabled
            should_receive := TRUE;
    END CASE;
    
    RETURN should_receive;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate unsubscribe URL for emails
CREATE OR REPLACE FUNCTION get_unsubscribe_url(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    unsubscribe_token UUID;
    base_url TEXT := 'https://threativator.com';
BEGIN
    -- Get or create preferences to ensure token exists
    SELECT notification_preferences.unsubscribe_token INTO unsubscribe_token
    FROM get_or_create_notification_preferences(p_user_id);
    
    RETURN base_url || '/unsubscribe?token=' || unsubscribe_token::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing notification functions to use preferences
CREATE OR REPLACE FUNCTION get_user_notification_preferences_v2(user_id_param UUID)
RETURNS JSONB AS $$
DECLARE
    preferences notification_preferences;
BEGIN
    -- Get preferences from dedicated table
    SELECT * INTO preferences
    FROM get_or_create_notification_preferences(user_id_param);
    
    RETURN jsonb_build_object(
        'deadline_reminders', preferences.deadline_reminders,
        'submission_results', preferences.submission_results,
        'consequence_notifications', preferences.consequence_notifications,
        'goal_completion', preferences.goal_completion,
        'digest_frequency', preferences.digest_frequency,
        'reminder_frequency', preferences.reminder_frequency,
        'email_enabled', preferences.email_enabled
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON notification_preferences TO authenticated;
GRANT ALL ON notification_preferences TO service_role;

GRANT EXECUTE ON FUNCTION get_or_create_notification_preferences(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_notification_preferences(UUID) TO service_role;

GRANT EXECUTE ON FUNCTION update_notification_preferences(UUID, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, TEXT, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_notification_preferences(UUID, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, TEXT, TEXT, BOOLEAN) TO service_role;

GRANT EXECUTE ON FUNCTION unsubscribe_user(UUID) TO anon;
GRANT EXECUTE ON FUNCTION unsubscribe_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION unsubscribe_user(UUID) TO service_role;

GRANT EXECUTE ON FUNCTION should_receive_notification(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION get_unsubscribe_url(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION get_user_notification_preferences_v2(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_notification_preferences_v2(UUID) TO service_role;

-- Enable Row Level Security
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notification preferences" ON notification_preferences
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notification preferences" ON notification_preferences
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own notification preferences" ON notification_preferences
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role has full access" ON notification_preferences
    FOR ALL USING (auth.role() = 'service_role');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notification_preferences_updated_at_trigger ON notification_preferences;
CREATE TRIGGER notification_preferences_updated_at_trigger
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Comments for documentation
COMMENT ON TABLE notification_preferences IS 'Stores user email notification preferences';
COMMENT ON FUNCTION get_or_create_notification_preferences(UUID) IS 'Gets existing preferences or creates defaults';
COMMENT ON FUNCTION update_notification_preferences(UUID, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, TEXT, TEXT, BOOLEAN) IS 'Updates user notification preferences';
COMMENT ON FUNCTION unsubscribe_user(UUID) IS 'Unsubscribes user from all notifications via token';
COMMENT ON FUNCTION should_receive_notification(UUID, TEXT) IS 'Checks if user should receive specific notification type';
COMMENT ON FUNCTION get_unsubscribe_url(UUID) IS 'Generates unsubscribe URL for email footers';