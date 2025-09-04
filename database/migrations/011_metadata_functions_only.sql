-- User metadata management functions only
-- Run this since you already ran 007 for RLS policies

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
    WHERE id = user_id;
    
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