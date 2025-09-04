-- Schema Redux: Clean up RLS policies
-- Phase 2: Remove problematic policies and update remaining tables

-- Drop all existing RLS policies (we'll recreate simple ones next)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;

-- Drop team-related policies (tables are gone but policies might remain)
DROP POLICY IF EXISTS "Team members can view shared goals" ON goals;
DROP POLICY IF EXISTS "Team members can view shared checkpoints" ON checkpoints;
DROP POLICY IF EXISTS "Users can view teams for their goals" ON teams;
DROP POLICY IF EXISTS "Users can create teams for own goals" ON teams;
DROP POLICY IF EXISTS "Team creators can update teams" ON teams;
DROP POLICY IF EXISTS "Team creators can delete teams" ON teams;
DROP POLICY IF EXISTS "Team members can view team membership" ON team_members;
DROP POLICY IF EXISTS "Team creators can manage membership" ON team_members;
DROP POLICY IF EXISTS "Users can join teams" ON team_members;
DROP POLICY IF EXISTS "Users can leave teams" ON team_members;

-- Drop notification preference policies (table is gone)
DROP POLICY IF EXISTS "Users can view own notification preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can update own notification preferences" ON notification_preferences;

-- Drop audit log policies (table is gone)
DROP POLICY IF EXISTS "Users can view own audit log" ON audit_log;
DROP POLICY IF EXISTS "System can insert audit log" ON audit_log;
DROP POLICY IF EXISTS "Service role can insert audit log" ON audit_log;

-- Drop complex witness policies that may cause issues
DROP POLICY IF EXISTS "Witnesses can view submissions for their assigned checkpoints" ON submissions;

-- Note: Table constraint updates moved to migration 006 since tables were dropped