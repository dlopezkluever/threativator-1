-- Migration: Database trigger for automatic AI grading
-- Creates a trigger that calls the gradeSubmission Edge Function when submissions are ready for AI grading

-- Function to trigger AI grading
CREATE OR REPLACE FUNCTION trigger_ai_grading()
RETURNS TRIGGER AS $$
DECLARE
  goal_record RECORD;
BEGIN
  -- Only trigger for pending submissions
  IF NEW.status = 'pending' THEN
    -- Get goal information to check referee type
    SELECT g.referee_type INTO goal_record
    FROM goals g
    JOIN checkpoints c ON c.goal_id = g.id
    WHERE c.id = NEW.checkpoint_id;
    
    -- Only trigger for AI referee type
    IF goal_record.referee_type = 'ai' THEN
      -- Call the Edge Function asynchronously using pg_net extension
      -- Note: This requires the pg_net extension to be enabled
      PERFORM
        net.http_post(
          url := current_setting('app.edge_function_url') || '/functions/v1/gradeSubmission',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.service_role_key')
          ),
          body := jsonb_build_object(
            'submission_id', NEW.id::text
          )
        );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires after submission insert/update
DROP TRIGGER IF EXISTS submissions_ai_grading_trigger ON submissions;
CREATE TRIGGER submissions_ai_grading_trigger
  AFTER INSERT OR UPDATE OF status ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_ai_grading();

-- Add settings for Edge Function URL and service key
-- These should be set by the Supabase admin
-- Example: SELECT set_config('app.edge_function_url', 'https://your-project.supabase.co', false);
-- Example: SELECT set_config('app.service_role_key', 'your-service-role-key', false);

COMMENT ON FUNCTION trigger_ai_grading() IS 'Automatically triggers AI grading for pending submissions with AI referee type';
COMMENT ON TRIGGER submissions_ai_grading_trigger ON submissions IS 'Calls gradeSubmission Edge Function for AI-refereed submissions';