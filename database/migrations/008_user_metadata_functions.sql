-- Schema Redux: User metadata management functions
-- Phase 5: Functions to manage auth.users.raw_user_meta_data

-- Function to update user's holding cell balance in metadata
CREATE OR REPLACE FUNCTION increment_balance(user_id UUID, amount DECIMAL)
RETURNS void AS $$
DECLARE
    current_metadata JSONB;
    current_balance DECIMAL;
    new_balance DECIMAL;
    updated_metadata JSONB;
BEGIN
    -- Get current metadata
    SELECT raw_user_meta_data INTO current_metadata
    FROM auth.users
    WHERE id = user_id;
    
    -- Extract current balance or default to 0
    current_balance := COALESCE((current_metadata->>'holding_cell_balance')::DECIMAL, 0);
    new_balance := current_balance + amount;
    
    -- Update metadata with new balance
    updated_metadata := COALESCE(current_metadata, '{}'::JSONB) || 
                       jsonb_build_object('holding_cell_balance', new_balance);
    
    -- Update the user's metadata
    UPDATE auth.users 
    SET raw_user_meta_data = updated_metadata
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set onboarding status in metadata
CREATE OR REPLACE FUNCTION set_onboarding_completed(user_id UUID, completed BOOLEAN)
RETURNS void AS $$
DECLARE
    current_metadata JSONB;
    updated_metadata JSONB;
BEGIN
    -- Get current metadata
    SELECT raw_user_meta_data INTO current_metadata
    FROM auth.users
    WHERE id = user_id;
    
    -- Update metadata with onboarding status
    updated_metadata := COALESCE(current_metadata, '{}'::JSONB) || 
                       jsonb_build_object('onboarding_completed', completed);
    
    -- Update the user's metadata
    UPDATE auth.users 
    SET raw_user_meta_data = updated_metadata
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update social tokens in metadata
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
    -- Get current metadata
    SELECT raw_user_meta_data INTO current_metadata
    FROM auth.users
    WHERE id = user_id;
    
    -- Build social data object
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
    
    -- Update metadata with social tokens
    updated_metadata := COALESCE(current_metadata, '{}'::JSONB) || social_data;
    
    -- Update the user's metadata
    UPDATE auth.users 
    SET raw_user_meta_data = updated_metadata
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;