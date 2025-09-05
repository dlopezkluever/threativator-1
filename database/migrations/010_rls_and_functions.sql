-- RLS Policies and User Metadata Functions
-- Run this after migration 009

-- Enable RLS on all tables
ALTER TABLE kompromat ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consequences ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies using auth.uid() patterns
CREATE POLICY "Users can manage own kompromat" ON kompromat
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own contacts" ON contacts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own goals" ON goals
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage checkpoints for own goals" ON checkpoints
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM goals 
            WHERE goals.id = checkpoints.goal_id 
            AND goals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own submissions" ON submissions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own consequences" ON consequences
    FOR SELECT USING (auth.uid() = user_id);

-- Service role policies for system operations
CREATE POLICY "Service role can manage consequences" ON consequences
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can update submission status" ON submissions
    FOR UPDATE TO service_role USING (true);

CREATE POLICY "Service role can update checkpoint status" ON checkpoints
    FOR UPDATE TO service_role USING (true);

CREATE POLICY "Service role can update goal status" ON goals
    FOR UPDATE TO service_role USING (true);

-- User metadata management functions
CREATE OR REPLACE FUNCTION increment_balance(user_id UUID, amount DECIMAL)
RETURNS void AS $$
DECLARE
    current_metadata JSONB;
    current_balance DECIMAL;
    new_balance DECIMAL;
    updated_metadata JSONB;
BEGIN
    SELECT raw_user_meta_data INTO current_metadata
    FROM auth.users
    WHERE id = user_id;
    
    current_balance := COALESCE((current_metadata->>'holding_cell_balance')::DECIMAL, 0);
    new_balance := current_balance + amount;
    
    updated_metadata := COALESCE(current_metadata, '{}'::JSONB) || 
                       jsonb_build_object('holding_cell_balance', new_balance);
    
    UPDATE auth.users 
    SET raw_user_meta_data = updated_metadata
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION set_onboarding_completed(user_id UUID, completed BOOLEAN)
RETURNS void AS $$
DECLARE
    current_metadata JSONB;
    updated_metadata JSONB;
BEGIN
    SELECT raw_user_meta_data INTO current_metadata
    FROM auth.users
    WHERE id = user_id;
    
    updated_metadata := COALESCE(current_metadata, '{}'::JSONB) || 
                       jsonb_build_object('onboarding_completed', completed);
    
    UPDATE auth.users 
    SET raw_user_meta_data = updated_metadata
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_social_tokens(
    user_id UUID, 
    twitter_access_token TEXT DEFAULT NULL,
    twitter_refresh_token TEXT DEFAULT NULL,
    twitter_username TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
    current_metadata JSONB;
    updated_metadata JSONB;
    social_data JSONB;
BEGIN
    SELECT raw_user_meta_data INTO current_metadata
    FROM auth.users
    WHEknoRE id = user_id;
    
    social_data := '{}'::JSONB;
    IF twitter_access_token IS NOT NULL THEN
        social_data := social_data || jsonb_build_object('twitter_access_token', twitter_access_token);
    END IF;
    IF twitter_refresh_token IS NOT NULL THEN
        social_data := social_data || jsonb_build_object('twitter_refresh_token', twitter_refresh_token);
    END IF;
    IF twitter_username IS NOT NULL THEN
        social_data := social_data || jsonb_build_object('twitter_username', twitter_username);
    END IF;
    
    updated_metadata := COALESCE(current_metadata, '{}'::JSONB) || social_data;
    
    UPDATE auth.users 
    SET raw_user_meta_data = updated_metadata
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;