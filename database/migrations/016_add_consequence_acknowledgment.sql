-- Migration 016: Add acknowledgment tracking to consequences table

-- Add columns to track user acknowledgment of consequences
ALTER TABLE consequences 
ADD COLUMN acknowledged_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN notification_shown BOOLEAN DEFAULT FALSE;

-- Create index for efficient querying of unacknowledged consequences
CREATE INDEX idx_consequences_unacknowledged 
ON consequences(user_id, acknowledged_at, notification_shown) 
WHERE acknowledged_at IS NULL;

-- Function to mark consequence as acknowledged
CREATE OR REPLACE FUNCTION acknowledge_consequence(consequence_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id_check UUID;
BEGIN
  -- Verify consequence belongs to current user
  SELECT c.user_id INTO user_id_check
  FROM consequences c
  WHERE c.id = consequence_id;
  
  IF user_id_check != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot acknowledge consequence for other users';
  END IF;
  
  -- Mark as acknowledged
  UPDATE consequences 
  SET 
    acknowledged_at = NOW(),
    notification_shown = TRUE
  WHERE id = consequence_id
    AND user_id = auth.uid()
    AND acknowledged_at IS NULL;
  
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION acknowledge_consequence(UUID) TO authenticated;

-- Function to get unacknowledged consequences for a user
CREATE OR REPLACE FUNCTION get_unacknowledged_consequences(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
  id UUID,
  consequence_type consequence_type_enum,
  triggered_at TIMESTAMP WITH TIME ZONE,
  execution_status execution_status_enum,
  execution_details JSONB,
  checkpoint_id UUID,
  goal_id UUID,
  monetary_amount DECIMAL(10,2),
  charity_destination charity_enum,
  kompromat_id UUID,
  target_contact_id UUID,
  failure_type TEXT,
  goal_title TEXT,
  checkpoint_title TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.consequence_type,
    c.triggered_at,
    c.execution_status,
    c.execution_details,
    c.checkpoint_id,
    c.goal_id,
    c.monetary_amount,
    c.charity_destination,
    c.kompromat_id,
    c.target_contact_id,
    CASE 
      WHEN c.checkpoint_id IS NOT NULL THEN 'checkpoint'::TEXT
      ELSE 'final_deadline'::TEXT
    END as failure_type,
    g.title as goal_title,
    ch.title as checkpoint_title
  FROM consequences c
  LEFT JOIN goals g ON c.goal_id = g.id
  LEFT JOIN checkpoints ch ON c.checkpoint_id = ch.id
  WHERE c.user_id = user_uuid
    AND c.acknowledged_at IS NULL
    AND c.execution_status = 'completed'  -- Only show successfully executed consequences
  ORDER BY c.triggered_at ASC;  -- Show oldest first
END;
$$;

GRANT EXECUTE ON FUNCTION get_unacknowledged_consequences(UUID) TO authenticated;

-- Function to mark consequence notification as shown (but not yet acknowledged)
CREATE OR REPLACE FUNCTION mark_consequence_shown(consequence_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE consequences 
  SET notification_shown = TRUE
  WHERE id = consequence_id
    AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION mark_consequence_shown(UUID) TO authenticated;