-- Row Level Security (RLS) Policies for Threativator
-- Ensures users can only access their own data and appropriate shared data

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE kompromat ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow user registration" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Contacts table policies
CREATE POLICY "Users can view own contacts" ON contacts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts" ON contacts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts" ON contacts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts" ON contacts
    FOR DELETE USING (auth.uid() = user_id);

-- Kompromat table policies (highly sensitive)
CREATE POLICY "Users can view own kompromat" ON kompromat
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own kompromat" ON kompromat
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own kompromat" ON kompromat
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own kompromat" ON kompromat
    FOR DELETE USING (auth.uid() = user_id);

-- Goals table policies
CREATE POLICY "Users can view own goals" ON goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Team members can view shared goals" ON goals
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM teams t
            JOIN team_members tm ON t.id = tm.team_id
            WHERE t.goal_id = goals.id AND tm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own goals" ON goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON goals
    FOR DELETE USING (auth.uid() = user_id);

-- Checkpoints table policies
CREATE POLICY "Users can view own checkpoints" ON checkpoints
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM goals WHERE goals.id = checkpoints.goal_id AND goals.user_id = auth.uid()
        )
    );

CREATE POLICY "Team members can view shared checkpoints" ON checkpoints
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM goals g
            JOIN teams t ON g.id = t.goal_id
            JOIN team_members tm ON t.id = tm.team_id
            WHERE g.id = checkpoints.goal_id AND tm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert checkpoints for own goals" ON checkpoints
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM goals WHERE goals.id = checkpoints.goal_id AND goals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update checkpoints for own goals" ON checkpoints
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM goals WHERE goals.id = checkpoints.goal_id AND goals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete checkpoints for own goals" ON checkpoints
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM goals WHERE goals.id = checkpoints.goal_id AND goals.user_id = auth.uid()
        )
    );

-- Submissions table policies
CREATE POLICY "Users can view own submissions" ON submissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Witnesses can view submissions for their assigned checkpoints" ON submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM checkpoints c
            JOIN goals g ON c.goal_id = g.id
            WHERE c.id = submissions.checkpoint_id 
            AND g.referee_type = 'human_witness'
            AND g.witness_contact_id IN (
                SELECT contacts.id FROM contacts 
                WHERE contacts.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert own submissions" ON submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions" ON submissions
    FOR UPDATE USING (auth.uid() = user_id);

-- Consequences table policies
CREATE POLICY "Users can view own consequences" ON consequences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert consequences" ON consequences
    FOR INSERT WITH CHECK (true); -- Will be restricted by service role

CREATE POLICY "System can update consequences" ON consequences
    FOR UPDATE USING (true); -- Will be restricted by service role

-- Teams table policies
CREATE POLICY "Users can view teams for their goals" ON teams
    FOR SELECT USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM team_members WHERE team_id = teams.id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create teams for own goals" ON teams
    FOR INSERT WITH CHECK (
        auth.uid() = created_by AND
        EXISTS (
            SELECT 1 FROM goals WHERE goals.id = teams.goal_id AND goals.user_id = auth.uid()
        )
    );

CREATE POLICY "Team creators can update teams" ON teams
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Team creators can delete teams" ON teams
    FOR DELETE USING (auth.uid() = created_by);

-- Team members table policies
CREATE POLICY "Team members can view team membership" ON team_members
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM teams WHERE teams.id = team_members.team_id AND teams.created_by = auth.uid()
        )
    );

CREATE POLICY "Team creators can manage membership" ON team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM teams WHERE teams.id = team_members.team_id AND teams.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can join teams" ON team_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave teams" ON team_members
    FOR DELETE USING (auth.uid() = user_id);

-- Notification preferences table policies
CREATE POLICY "Users can view own notification preferences" ON notification_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences" ON notification_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Audit log policies (read-only for users)
CREATE POLICY "Users can view own audit log" ON audit_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit log" ON audit_log
    FOR INSERT WITH CHECK (true); -- Will be restricted by service role

-- Special policies for service role operations
-- These allow the backend to perform system operations

-- Create service role policies for consequences (Russian Roulette system)
CREATE POLICY "Service role can manage consequences" ON consequences
    FOR ALL TO service_role USING (true);

-- Create service role policies for audit logging
CREATE POLICY "Service role can insert audit log" ON audit_log
    FOR INSERT TO service_role WITH CHECK (true);

-- Create service role policies for system operations
CREATE POLICY "Service role can update submission status" ON submissions
    FOR UPDATE TO service_role USING (true);

CREATE POLICY "Service role can update checkpoint status" ON checkpoints
    FOR UPDATE TO service_role USING (true);

CREATE POLICY "Service role can update goal status" ON goals
    FOR UPDATE TO service_role USING (true);

-- Function to check if user owns a goal (helper for complex policies)
CREATE OR REPLACE FUNCTION user_owns_goal(goal_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM goals 
        WHERE id = goal_uuid AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is team member for a goal
CREATE OR REPLACE FUNCTION user_is_team_member(goal_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM teams t
        JOIN team_members tm ON t.id = tm.team_id
        WHERE t.goal_id = goal_uuid AND tm.user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;