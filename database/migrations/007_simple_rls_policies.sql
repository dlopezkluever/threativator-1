-- Schema Redux: Simple RLS policies
-- Phase 4: Basic ownership patterns with auth.uid()

-- Enable RLS on all remaining tables
ALTER TABLE kompromat ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consequences ENABLE ROW LEVEL SECURITY;

-- 1. Kompromat policies (basic auth.uid() = user_id pattern)
CREATE POLICY "Users can manage own kompromat" ON kompromat
    FOR ALL USING (auth.uid() = user_id);

-- 2. Contacts policies (basic auth.uid() = user_id pattern)
CREATE POLICY "Users can manage own contacts" ON contacts
    FOR ALL USING (auth.uid() = user_id);

-- 3. Goals policies (basic auth.uid() = user_id pattern)
CREATE POLICY "Users can manage own goals" ON goals
    FOR ALL USING (auth.uid() = user_id);

-- 4. Checkpoints policies (via goal ownership)
CREATE POLICY "Users can manage checkpoints for own goals" ON checkpoints
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM goals 
            WHERE goals.id = checkpoints.goal_id 
            AND goals.user_id = auth.uid()
        )
    );

-- 5. Submissions policies (dual ownership check)
CREATE POLICY "Users can manage own submissions" ON submissions
    FOR ALL USING (auth.uid() = user_id);

-- 6. Consequences policies (read-only for users, system manages execution)
CREATE POLICY "Users can view own consequences" ON consequences
    FOR SELECT USING (auth.uid() = user_id);

-- Service role policies for system operations
CREATE POLICY "Service role can manage consequences" ON consequences
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can update submission status" ON submissions
    FOR UPDATE TO service_role USING (true);

CREATE POLICY "Service role can update checkpoint status" ON checkpoints
    FOR UPDATE TO service_role USING (true);

CREATE POLICY "Service role can update goal status" ON goals
    FOR UPDATE TO service_role USING (true);