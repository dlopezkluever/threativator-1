-- Fix for the ambiguous column reference in check_overdue_checkpoints function
-- This fixes the "column reference checkpoint_id is ambiguous" error

-- I think this is correcting 014_consequence_engine_setup.sql

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
      -- Ensure we haven't already processed this failure (fixed the ambiguity)
      AND NOT EXISTS (
        SELECT 1 FROM consequences cons
        WHERE cons.checkpoint_id = c.id 
        AND cons.execution_status != 'failed'
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
      -- Ensure we haven't already processed this final failure (fixed the ambiguity)
      AND NOT EXISTS (
        SELECT 1 FROM consequences cons
        WHERE cons.goal_id = g.id 
        AND cons.checkpoint_id IS NULL
        AND cons.execution_status != 'failed'
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