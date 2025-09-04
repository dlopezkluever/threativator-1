-- Schema Redux: Drop problematic tables and policies
-- Phase 1: Database cleanup to resolve RLS conflicts

-- Drop triggers first to avoid dependency issues
DROP TRIGGER IF EXISTS create_user_notification_preferences ON users;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Drop helper functions
DROP FUNCTION IF EXISTS create_default_notification_preferences();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS user_owns_goal(UUID);
DROP FUNCTION IF EXISTS user_is_team_member(UUID);

-- Drop problematic tables that cause RLS recursion
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE; 
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS users CASCADE; -- This is the big one causing conflicts

-- Drop indexes that referenced dropped tables
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_audit_log_user_id;
DROP INDEX IF EXISTS idx_audit_log_created_at;

-- Note: Core tables (kompromat, contacts, goals, checkpoints, submissions, consequences) 
-- are kept but will need their RLS policies updated in next migration