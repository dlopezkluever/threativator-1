-- Comprehensive Consequence System Test
-- This creates realistic overdue scenarios to test the complete system

-- Step 1: Create test goal with both monetary stake and kompromat
INSERT INTO goals (
    user_id, 
    title, 
    description, 
    final_deadline, 
    grading_rubric, 
    monetary_stake, 
    charity_destination,
    minor_kompromat_id,  -- You'll need to upload kompromat first or set this to NULL
    major_kompromat_id,  -- You'll need to upload kompromat first or set this to NULL
    status
) VALUES (
    '2fe3fc11-ea6c-4511-b260-156092ac5ff9',  -- Your user ID
    'REAL TEST: Learn TypeScript',
    'Complete TypeScript course with checkpoint milestones',
    NOW() + INTERVAL '10 days',  -- Final deadline in 10 days
    'Submit proof of TypeScript project completion',
    50.00,  -- $50 monetary stake
    'doctors_without_borders',
    NULL,  -- Set to actual kompromat ID if you have one
    NULL,  -- Set to actual kompromat ID if you have one
    'active'
) RETURNING id;

-- Step 2: Create multiple checkpoints - some overdue, some future
-- Replace 'GOAL_ID_FROM_ABOVE' with the actual ID returned above

-- Checkpoint 1: Already overdue (2 hours ago)
INSERT INTO checkpoints (
    goal_id, 
    title, 
    description, 
    deadline, 
    order_position, 
    status
) VALUES (
    'GOAL_ID_FROM_ABOVE',  -- Replace with actual goal ID
    'Complete Basic Types Chapter',
    'Read and understand basic TypeScript types',
    NOW() - INTERVAL '2 hours',  -- 2 HOURS AGO (OVERDUE!)
    1,
    'pending'
);

-- Checkpoint 2: Overdue yesterday 
INSERT INTO checkpoints (
    goal_id, 
    title, 
    description, 
    deadline, 
    order_position, 
    status
) VALUES (
    'GOAL_ID_FROM_ABOVE',  -- Replace with actual goal ID
    'Practice Advanced Types',
    'Complete advanced types exercises',
    NOW() - INTERVAL '1 day',  -- YESTERDAY (OVERDUE!)
    2,
    'pending'
);

-- Checkpoint 3: Due in 2 days (not overdue)
INSERT INTO checkpoints (
    goal_id, 
    title, 
    description, 
    deadline, 
    order_position, 
    status
) VALUES (
    'GOAL_ID_FROM_ABOVE',  -- Replace with actual goal ID
    'Build Small Project',
    'Create a small TypeScript project',
    NOW() + INTERVAL '2 days',  -- Future deadline
    3,
    'pending'
);

-- Step 3: Test the overdue detection
SELECT 'Testing overdue detection...' as test_step;
SELECT * FROM check_overdue_checkpoints();

-- Step 4: Manually trigger consequence processing
SELECT 'Triggering consequence processing...' as test_step;
SELECT manual_consequence_trigger();

-- Step 5: Check what consequences were created
SELECT 'Checking consequences created...' as test_step;
SELECT 
    c.id,
    c.consequence_type,
    c.triggered_at,
    c.execution_status,
    c.execution_details->>'triggered' as was_triggered,
    c.acknowledged_at,
    c.notification_shown,
    ch.title as checkpoint_title,
    g.title as goal_title
FROM consequences c
LEFT JOIN checkpoints ch ON c.checkpoint_id = ch.id
LEFT JOIN goals g ON c.goal_id = g.id
WHERE c.user_id = '2fe3fc11-ea6c-4511-b260-156092ac5ff9'
ORDER BY c.triggered_at DESC;

-- Step 6: Check unacknowledged consequences (what the modal system will show)
SELECT 'Checking unacknowledged consequences...' as test_step;
SELECT * FROM get_unacknowledged_consequences('2fe3fc11-ea6c-4511-b260-156092ac5ff9');

-- Instructions for manual testing:
-- 1. Run this script in SQL Editor
-- 2. Replace 'GOAL_ID_FROM_ABOVE' with the actual goal ID from step 1
-- 3. Go to your dashboard - you should see consequence modals appear
-- 4. If no modals appear, check the console logs for queue status
-- 5. Each modal should appear once and not repeat after acknowledgment