-- Migration 014: Consequence Engine Setup with pg_cron
-- IMPORTANT: pg_cron extension must be enabled via Supabase Dashboard first!
-- Go to Database > Extensions > Enable "pg_cron"

-- Create function to identify overdue checkpoints and goals
CREATE OR REPLACE FUNCTION check_overdue_checkpoints()
RETURNS TABLE (
  checkpoint_id UUID,
  goal_id UUID,
  user_id UUID,
  failure_type TEXT, -- 'checkpoint' or 'final_deadline'
  consequence_types consequence_type_enum[],
  monetary_stake DECIMAL(10,2),
  minor_kompromat_id UUID,
  major_kompromat_id UUID,
  charity_destination charity_enum
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH overdue_data AS (
    -- Find overdue checkpoints (not already processed)
    SELECT DISTINCT
      c.id as checkpoint_id,
      c.goal_id,
      g.user_id,
      'checkpoint'::TEXT as failure_type,
      -- Determine consequence types based on goal setup
      ARRAY[
        CASE WHEN g.monetary_stake > 0 THEN 'monetary'::consequence_type_enum END,
        CASE WHEN g.minor_kompromat_id IS NOT NULL THEN 'humiliation_email'::consequence_type_enum END
      ]::consequence_type_enum[] as consequence_types,
      g.monetary_stake,
      g.minor_kompromat_id,
      g.major_kompromat_id,
      g.charity_destination
    FROM checkpoints c
    INNER JOIN goals g ON c.goal_id = g.id
    WHERE 
      c.status = 'pending'
      AND c.deadline < NOW()
      AND g.status = 'active'
      -- Ensure we haven't already processed this failure
      AND NOT EXISTS (
        SELECT 1 FROM consequences 
        WHERE checkpoint_id = c.id 
        AND execution_status != 'failed'
      )
    
    UNION ALL
    
    -- Find overdue final deadlines (goals completely failed)
    SELECT DISTINCT
      NULL::UUID as checkpoint_id,
      g.id as goal_id,
      g.user_id,
      'final_deadline'::TEXT as failure_type,
      -- Final deadlines get all available consequence types
      ARRAY[
        CASE WHEN g.monetary_stake > 0 THEN 'monetary'::consequence_type_enum END,
        CASE WHEN g.major_kompromat_id IS NOT NULL THEN 'humiliation_email'::consequence_type_enum END
      ]::consequence_type_enum[] as consequence_types,
      g.monetary_stake,
      g.minor_kompromat_id,
      g.major_kompromat_id,
      g.charity_destination
    FROM goals g
    WHERE 
      g.status = 'active'
      AND g.final_deadline < NOW()
      -- Ensure we haven't already processed this final failure
      AND NOT EXISTS (
        SELECT 1 FROM consequences 
        WHERE goal_id = g.id 
        AND checkpoint_id IS NULL
        AND execution_status != 'failed'
      )
  )
  SELECT 
    od.checkpoint_id,
    od.goal_id,
    od.user_id,
    od.failure_type,
    -- Clean up NULL values from consequence types array
    array_remove(od.consequence_types, NULL) as consequence_types,
    od.monetary_stake,
    od.minor_kompromat_id,
    od.major_kompromat_id,
    od.charity_destination
  FROM overdue_data od
  WHERE array_length(array_remove(od.consequence_types, NULL), 1) > 0; -- Only return if there are actual consequences
END;
$$;

-- Grant execution permissions to service role
GRANT EXECUTE ON FUNCTION check_overdue_checkpoints() TO service_role;

-- Create a wrapper function that can be called by pg_cron and triggers the Edge Function
CREATE OR REPLACE FUNCTION trigger_consequence_processing()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  overdue_record RECORD;
  overdue_count INTEGER := 0;
BEGIN
  -- Log start of processing
  RAISE NOTICE 'Starting consequence processing at %', NOW();
  
  -- Count overdue items for logging
  SELECT COUNT(*) INTO overdue_count 
  FROM check_overdue_checkpoints();
  
  IF overdue_count > 0 THEN
    RAISE NOTICE 'Found % overdue checkpoint(s)/goal(s) requiring consequence processing', overdue_count;
    
    -- Here we would normally call the Edge Function via HTTP
    -- Since we can't do HTTP calls directly from PL/pgSQL in Supabase,
    -- the Edge Function will need to poll this function or be triggered externally
    -- For now, we'll update checkpoint statuses to 'overdue' to indicate they need processing
    
    UPDATE checkpoints SET status = 'overdue'
    WHERE id IN (
      SELECT checkpoint_id 
      FROM check_overdue_checkpoints() 
      WHERE checkpoint_id IS NOT NULL
    );
    
    -- Update goal status for final deadline failures
    UPDATE goals SET status = 'failed'
    WHERE id IN (
      SELECT goal_id 
      FROM check_overdue_checkpoints() 
      WHERE checkpoint_id IS NULL
    );
    
  ELSE
    RAISE NOTICE 'No overdue checkpoints found';
  END IF;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION trigger_consequence_processing() TO service_role;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_checkpoints_overdue 
ON checkpoints(status, deadline) 
WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_goals_overdue 
ON goals(status, final_deadline) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_consequences_checkpoint 
ON consequences(checkpoint_id, execution_status);

CREATE INDEX IF NOT EXISTS idx_consequences_goal 
ON consequences(goal_id, checkpoint_id, execution_status);

-- Create a test function to verify the system works
CREATE OR REPLACE FUNCTION test_overdue_detection()
RETURNS TABLE (
  test_name TEXT,
  checkpoint_count BIGINT,
  goal_count BIGINT,
  total_overdue BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'Overdue Detection Test'::TEXT,
    (SELECT COUNT(*) FROM check_overdue_checkpoints() WHERE checkpoint_id IS NOT NULL) as checkpoint_count,
    (SELECT COUNT(*) FROM check_overdue_checkpoints() WHERE checkpoint_id IS NULL) as goal_count,
    (SELECT COUNT(*) FROM check_overdue_checkpoints()) as total_overdue;
END;
$$;

GRANT EXECUTE ON FUNCTION test_overdue_detection() TO authenticated;