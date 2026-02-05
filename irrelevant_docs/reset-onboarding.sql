-- Reset onboarding status for testing
-- Run this in your Supabase SQL Editor to reset a user's onboarding

-- Option 1: Reset specific user (replace with your email)
UPDATE users 
SET onboarding_completed = false 
WHERE email = 'your-email@example.com';

-- Option 2: Reset all users (for testing)
-- UPDATE users SET onboarding_completed = false;

-- Option 3: Check current user status
SELECT id, email, onboarding_completed, stripe_customer_id, twitter_username 
FROM users 
ORDER BY created_at DESC; 

