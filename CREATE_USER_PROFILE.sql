-- ========================================
-- CREATE USER PROFILE SCRIPT
-- ========================================
-- This script creates a user profile in the users table
-- Replace 'your-user-email@example.com' with your actual email

-- Create user profile (run this after you have an auth user)
-- First, check what your user ID is:
SELECT id, email FROM auth.users;

-- Then insert your profile into the users table
-- REPLACE 'your-email@example.com' with your actual email from the query above
INSERT INTO users (id, email, holding_cell_balance) 
SELECT id, email, 0.00 
FROM auth.users 
WHERE email = 'your-email@example.com'  -- CHANGE THIS TO YOUR EMAIL
ON CONFLICT (id) DO NOTHING;

-- Verify the user was created
SELECT id, email, holding_cell_balance, created_at 
FROM users;

-- Test that you can now query kompromat for your user
SELECT COUNT(*) as kompromat_files 
FROM kompromat 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');  -- CHANGE THIS TO YOUR EMAIL