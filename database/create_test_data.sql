-- Create test data for consequence system testing
-- Replace 'your-actual-user-id-here' with your real user ID from the dashboard

-- First, let's see what users exist
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Create a test user ID if needed (use a real one from above, or create test data)
-- REPLACE THIS WITH YOUR ACTUAL USER ID FROM THE QUERY ABOVE:
DO $$
DECLARE
    test_user_id UUID := '2fe3fc11-ea6c-4511-b260-156092ac5ff9'; -- CHANGE THIS!
    test_goal_id UUID;
BEGIN
    -- Insert test goal with overdue final deadline
    INSERT INTO goals (
        user_id, 
        title, 
        description, 
        final_deadline, 
        grading_rubric, 
        monetary_stake, 
        charity_destination, 
        status
    ) VALUES (
        test_user_id,
        'TEST: Russian Roulette Goal',
        'Test goal to trigger consequence system',
        NOW() + INTERVAL '7 days',  -- Final deadline in 7 days
        'Complete the test task successfully',
        25.00,
        'doctors_without_borders',
        'active'
    ) RETURNING id INTO test_goal_id;

    -- Insert test checkpoint that's already overdue
    INSERT INTO checkpoints (
        goal_id, 
        title, 
        description, 
        deadline, 
        order_position, 
        status
    ) VALUES (
        test_goal_id,
        'TEST: Overdue Checkpoint',
        'This checkpoint is overdue and should trigger consequences',
        NOW() - INTERVAL '2 hours',  -- 2 hours ago (OVERDUE!)
        1,
        'pending'
    );

    RAISE NOTICE 'Test data created successfully!';
    RAISE NOTICE 'Goal ID: %', test_goal_id;
    RAISE NOTICE 'User ID: %', test_user_id;
END
$$;