-- Create deadline reminder tracking system
-- Prevents duplicate reminders and tracks notification history

-- Add reminder tracking to existing tables
ALTER TABLE checkpoints ADD COLUMN IF NOT EXISTS reminder_24h_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE checkpoints ADD COLUMN IF NOT EXISTS reminder_1h_sent_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE goals ADD COLUMN IF NOT EXISTS reminder_24h_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS reminder_1h_sent_at TIMESTAMP WITH TIME ZONE;

-- Create notification log table for comprehensive tracking
CREATE TABLE IF NOT EXISTS notification_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
    checkpoint_id UUID REFERENCES checkpoints(id) ON DELETE CASCADE,
    
    -- Notification details
    notification_type TEXT NOT NULL,
    reminder_type TEXT, -- '24h', '1h', etc.
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    
    -- Delivery tracking
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sendgrid_message_id TEXT,
    delivery_status TEXT DEFAULT 'sent',
    delivery_error TEXT,
    
    -- Context data
    deadline_date TIMESTAMP WITH TIME ZONE,
    hours_until_deadline INTEGER,
    
    CONSTRAINT notification_log_type_check CHECK (
        notification_type IN ('deadline_reminder', 'submission_result', 'consequence', 'goal_completion', 'test')
    ),
    CONSTRAINT notification_log_reminder_type_check CHECK (
        reminder_type IS NULL OR reminder_type IN ('24h', '1h', 'immediate')
    )
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_notification_log_user_id ON notification_log(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_goal_id ON notification_log(goal_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_checkpoint_id ON notification_log(checkpoint_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_type ON notification_log(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_log_sent_at ON notification_log(sent_at);

-- Create function to find upcoming deadlines needing reminders
CREATE OR REPLACE FUNCTION find_upcoming_deadlines()
RETURNS TABLE(
    item_type TEXT,
    item_id UUID,
    user_id UUID,
    user_email TEXT,
    user_display_name TEXT,
    title TEXT,
    goal_title TEXT,
    deadline_date TIMESTAMP WITH TIME ZONE,
    hours_until_deadline INTEGER,
    reminder_type TEXT,
    submission_url TEXT
) AS $$
BEGIN
    -- Find checkpoints needing 24h reminders
    RETURN QUERY
    SELECT 
        'checkpoint'::TEXT as item_type,
        c.id as item_id,
        c.user_id,
        COALESCE(u.email, '') as user_email,
        COALESCE(u.raw_user_meta_data->>'display_name', 'Comrade') as user_display_name,
        c.title,
        g.title as goal_title,
        c.deadline as deadline_date,
        EXTRACT(EPOCH FROM (c.deadline - NOW())) / 3600 as hours_until_deadline,
        '24h'::TEXT as reminder_type,
        CONCAT('https://threativator.com/dashboard?submit=checkpoint-', c.id) as submission_url
    FROM checkpoints c
    JOIN goals g ON c.goal_id = g.id
    JOIN auth.users u ON c.user_id = u.id
    WHERE 
        c.status = 'pending'
        AND c.deadline > NOW()
        AND c.deadline <= NOW() + INTERVAL '24 hours 30 minutes'
        AND c.deadline > NOW() + INTERVAL '23 hours 30 minutes'
        AND c.reminder_24h_sent_at IS NULL
        AND g.status = 'active'
    
    UNION ALL
    
    -- Find checkpoints needing 1h reminders
    SELECT 
        'checkpoint'::TEXT as item_type,
        c.id as item_id,
        c.user_id,
        COALESCE(u.email, '') as user_email,
        COALESCE(u.raw_user_meta_data->>'display_name', 'Comrade') as user_display_name,
        c.title,
        g.title as goal_title,
        c.deadline as deadline_date,
        EXTRACT(EPOCH FROM (c.deadline - NOW())) / 3600 as hours_until_deadline,
        '1h'::TEXT as reminder_type,
        CONCAT('https://threativator.com/dashboard?submit=checkpoint-', c.id) as submission_url
    FROM checkpoints c
    JOIN goals g ON c.goal_id = g.id
    JOIN auth.users u ON c.user_id = u.id
    WHERE 
        c.status = 'pending'
        AND c.deadline > NOW()
        AND c.deadline <= NOW() + INTERVAL '1 hour 30 minutes'
        AND c.deadline > NOW() + INTERVAL '30 minutes'
        AND c.reminder_1h_sent_at IS NULL
        AND g.status = 'active'
    
    UNION ALL
    
    -- Find goals needing 24h reminders
    SELECT 
        'goal'::TEXT as item_type,
        g.id as item_id,
        g.user_id,
        COALESCE(u.email, '') as user_email,
        COALESCE(u.raw_user_meta_data->>'display_name', 'Comrade') as user_display_name,
        g.title,
        g.title as goal_title,
        g.final_deadline as deadline_date,
        EXTRACT(EPOCH FROM (g.final_deadline - NOW())) / 3600 as hours_until_deadline,
        '24h'::TEXT as reminder_type,
        CONCAT('https://threativator.com/dashboard?submit=goal-', g.id) as submission_url
    FROM goals g
    JOIN auth.users u ON g.user_id = u.id
    WHERE 
        g.status = 'active'
        AND g.final_deadline > NOW()
        AND g.final_deadline <= NOW() + INTERVAL '24 hours 30 minutes'
        AND g.final_deadline > NOW() + INTERVAL '23 hours 30 minutes'
        AND g.reminder_24h_sent_at IS NULL
    
    UNION ALL
    
    -- Find goals needing 1h reminders
    SELECT 
        'goal'::TEXT as item_type,
        g.id as item_id,
        g.user_id,
        COALESCE(u.email, '') as user_email,
        COALESCE(u.raw_user_meta_data->>'display_name', 'Comrade') as user_display_name,
        g.title,
        g.title as goal_title,
        g.final_deadline as deadline_date,
        EXTRACT(EPOCH FROM (g.final_deadline - NOW())) / 3600 as hours_until_deadline,
        '1h'::TEXT as reminder_type,
        CONCAT('https://threativator.com/dashboard?submit=goal-', g.id) as submission_url
    FROM goals g
    JOIN auth.users u ON g.user_id = u.id
    WHERE 
        g.status = 'active'
        AND g.final_deadline > NOW()
        AND g.final_deadline <= NOW() + INTERVAL '1 hour 30 minutes'
        AND g.final_deadline > NOW() + INTERVAL '30 minutes'
        AND g.reminder_1h_sent_at IS NULL
    
    ORDER BY hours_until_deadline ASC;
END;
$$ LANGUAGE plpgsql;

-- Create function to mark reminders as sent
CREATE OR REPLACE FUNCTION mark_reminder_sent(
    p_item_type TEXT,
    p_item_id UUID,
    p_reminder_type TEXT
)
RETURNS VOID AS $$
BEGIN
    IF p_item_type = 'checkpoint' THEN
        IF p_reminder_type = '24h' THEN
            UPDATE checkpoints SET reminder_24h_sent_at = NOW() WHERE id = p_item_id;
        ELSIF p_reminder_type = '1h' THEN
            UPDATE checkpoints SET reminder_1h_sent_at = NOW() WHERE id = p_item_id;
        END IF;
    ELSIF p_item_type = 'goal' THEN
        IF p_reminder_type = '24h' THEN
            UPDATE goals SET reminder_24h_sent_at = NOW() WHERE id = p_item_id;
        ELSIF p_reminder_type = '1h' THEN
            UPDATE goals SET reminder_1h_sent_at = NOW() WHERE id = p_item_id;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to log notifications
CREATE OR REPLACE FUNCTION log_notification(
    p_user_id UUID,
    p_goal_id UUID,
    p_checkpoint_id UUID,
    p_notification_type TEXT,
    p_reminder_type TEXT,
    p_recipient_email TEXT,
    p_subject TEXT,
    p_sendgrid_message_id TEXT,
    p_deadline_date TIMESTAMP WITH TIME ZONE,
    p_hours_until_deadline INTEGER
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notification_log (
        user_id,
        goal_id,
        checkpoint_id,
        notification_type,
        reminder_type,
        recipient_email,
        subject,
        sendgrid_message_id,
        deadline_date,
        hours_until_deadline
    ) VALUES (
        p_user_id,
        p_goal_id,
        p_checkpoint_id,
        p_notification_type,
        p_reminder_type,
        p_recipient_email,
        p_subject,
        p_sendgrid_message_id,
        p_deadline_date,
        p_hours_until_deadline
    )
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to trigger deadline reminder notifications via HTTP
CREATE OR REPLACE FUNCTION trigger_deadline_reminders()
RETURNS JSONB AS $$
DECLARE
    service_key TEXT;
    result JSONB;
    response JSONB;
BEGIN
    -- Get service role key from environment
    service_key := current_setting('app.settings.service_role_key', true);
    
    IF service_key IS NULL OR service_key = '' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Service role key not configured'
        );
    END IF;

    -- Make HTTP request to Edge Function
    SELECT content::jsonb INTO response
    FROM http((
        'POST',
        current_setting('app.settings.supabase_url', true) || '/functions/v1/sendDeadlineReminders',
        ARRAY[
            http_header('Authorization', 'Bearer ' || service_key),
            http_header('Content-Type', 'application/json')
        ],
        'application/json',
        '{}'
    ));
    
    -- Return the response from the Edge Function
    RETURN COALESCE(response, jsonb_build_object('success', false, 'error', 'No response from Edge Function'));
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Failed to trigger deadline reminders',
        'details', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION find_upcoming_deadlines() TO service_role;
GRANT EXECUTE ON FUNCTION mark_reminder_sent(TEXT, UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION log_notification(UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TIMESTAMP WITH TIME ZONE, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION trigger_deadline_reminders() TO service_role;

-- Grant table access
GRANT ALL ON notification_log TO service_role;
GRANT SELECT, UPDATE ON checkpoints TO service_role;
GRANT SELECT, UPDATE ON goals TO service_role;