-- Initial schema for Threativator application
-- This creates all core tables needed for the MVP functionality

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom ENUM types
CREATE TYPE grading_type AS ENUM ('ai', 'human_witness');
CREATE TYPE goal_status AS ENUM ('active', 'completed', 'failed', 'paused');
CREATE TYPE checkpoint_status AS ENUM ('pending', 'submitted', 'passed', 'failed', 'overdue');
CREATE TYPE submission_status AS ENUM ('pending', 'grading', 'passed', 'failed', 'contested');
CREATE TYPE submission_type_enum AS ENUM ('file_upload', 'external_url', 'text_description');
CREATE TYPE verdict_enum AS ENUM ('pass', 'fail');
CREATE TYPE kompromat_severity AS ENUM ('minor', 'major');
CREATE TYPE contact_role AS ENUM ('witness', 'consequence_target');
CREATE TYPE consequence_type_enum AS ENUM ('monetary', 'humiliation_email', 'humiliation_social');
CREATE TYPE execution_status_enum AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE charity_enum AS ENUM ('doctors_without_borders', 'red_cross', 'unicef');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT auth.uid(),
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Financial management
    stripe_customer_id TEXT,
    holding_cell_balance DECIMAL(10,2) DEFAULT 0.00,
    
    -- Social media integrations
    twitter_access_token TEXT, -- Will be encrypted in production
    twitter_refresh_token TEXT, -- Will be encrypted in production
    twitter_username TEXT,
    
    -- Onboarding and profile
    onboarding_completed BOOLEAN DEFAULT FALSE,
    avatar_type TEXT DEFAULT 'default',
    display_name TEXT,
    
    CONSTRAINT users_email_check CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Contacts for witnesses and consequence targets
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    roles contact_role[] NOT NULL DEFAULT '{}',
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT contacts_email_check CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT contacts_roles_not_empty CHECK (array_length(roles, 1) > 0)
);

-- Secure kompromat storage
CREATE TABLE kompromat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Supabase Storage path
    file_type TEXT NOT NULL,
    file_size_bytes INTEGER,
    severity kompromat_severity NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT kompromat_severity_check CHECK (severity IN ('minor', 'major')),
    CONSTRAINT kompromat_file_size_check CHECK (file_size_bytes > 0)
);

-- Goals with comprehensive settings
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    final_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Grading configuration
    grading_rubric TEXT NOT NULL,
    referee_type grading_type NOT NULL DEFAULT 'ai',
    witness_contact_id UUID REFERENCES contacts(id),
    
    -- Stakes and consequences
    monetary_stake DECIMAL(10,2) NOT NULL,
    charity_destination charity_enum NOT NULL,
    minor_kompromat_id UUID REFERENCES kompromat(id),
    major_kompromat_id UUID REFERENCES kompromat(id),
    
    -- Status and metadata
    status goal_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Validation constraints
    CONSTRAINT goals_deadline_future CHECK (final_deadline > NOW()),
    CONSTRAINT goals_monetary_stake_positive CHECK (monetary_stake > 0),
    CONSTRAINT goals_title_length CHECK (char_length(title) BETWEEN 3 AND 200),
    CONSTRAINT goals_rubric_length CHECK (char_length(grading_rubric) >= 10)
);

-- Checkpoints for goal milestones
CREATE TABLE checkpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    order_position INTEGER NOT NULL,
    requirements TEXT,
    status checkpoint_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Note: Deadline validation enforced by trigger function below
    CONSTRAINT checkpoints_order_positive CHECK (order_position > 0),
    CONSTRAINT checkpoints_title_length CHECK (char_length(title) BETWEEN 3 AND 200)
);

-- Submissions for proof of completion
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checkpoint_id UUID NOT NULL REFERENCES checkpoints(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Submission content
    submission_type submission_type_enum NOT NULL,
    file_path TEXT, -- For file uploads (Supabase Storage)
    external_url TEXT, -- For external links
    description TEXT,
    
    -- Grading results
    ai_analysis_result JSONB,
    human_verdict verdict_enum,
    feedback_text TEXT,
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    
    -- Status and timing
    status submission_status DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    graded_at TIMESTAMP WITH TIME ZONE,
    
    -- Validation constraints
    CONSTRAINT submissions_content_provided CHECK (
        (submission_type = 'file_upload' AND file_path IS NOT NULL) OR
        (submission_type = 'external_url' AND external_url IS NOT NULL) OR
        (submission_type = 'text_description' AND description IS NOT NULL)
    ),
    CONSTRAINT submissions_confidence_range CHECK (confidence_score BETWEEN 0.00 AND 1.00)
);

-- Consequences tracking and execution
CREATE TABLE consequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checkpoint_id UUID REFERENCES checkpoints(id),
    goal_id UUID REFERENCES goals(id),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Consequence details
    consequence_type consequence_type_enum NOT NULL,
    monetary_amount DECIMAL(10,2),
    charity_destination charity_enum,
    kompromat_id UUID REFERENCES kompromat(id),
    target_contact_id UUID REFERENCES contacts(id),
    social_platform TEXT,
    
    -- Execution tracking
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    executed_at TIMESTAMP WITH TIME ZONE,
    execution_status execution_status_enum DEFAULT 'pending',
    execution_details JSONB, -- Store API responses, email IDs, etc.
    
    -- Validation constraints
    CONSTRAINT consequences_monetary_amount_positive CHECK (
        consequence_type != 'monetary' OR monetary_amount > 0
    ),
    CONSTRAINT consequences_kompromat_required CHECK (
        consequence_type NOT IN ('humiliation_email', 'humiliation_social') OR kompromat_id IS NOT NULL
    )
);

-- Team functionality (for future team-based goals)
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    role TEXT DEFAULT 'member',
    
    UNIQUE(team_id, user_id)
);

-- Notification preferences and tracking
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_deadlines BOOLEAN DEFAULT TRUE,
    email_submissions BOOLEAN DEFAULT TRUE,
    email_consequences BOOLEAN DEFAULT TRUE,
    days_before_deadline INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT notification_days_positive CHECK (days_before_deadline > 0)
);

-- Audit log for important actions
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_final_deadline ON goals(final_deadline);
CREATE INDEX idx_checkpoints_goal_id ON checkpoints(goal_id);
CREATE INDEX idx_checkpoints_deadline ON checkpoints(deadline);
CREATE INDEX idx_checkpoints_status ON checkpoints(status);
CREATE INDEX idx_submissions_checkpoint_id ON submissions(checkpoint_id);
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_consequences_user_id ON consequences(user_id);
CREATE INDEX idx_consequences_execution_status ON consequences(execution_status);
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_kompromat_user_id ON kompromat(user_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- Update triggers for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create notification preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notification_preferences (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_user_notification_preferences
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION create_default_notification_preferences();

-- Function to validate checkpoint deadlines
CREATE OR REPLACE FUNCTION validate_checkpoint_deadline()
RETURNS TRIGGER AS $$
DECLARE
    goal_final_deadline TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get the goal's final deadline
    SELECT final_deadline INTO goal_final_deadline
    FROM goals
    WHERE id = NEW.goal_id;
    
    -- Check if checkpoint deadline is before goal deadline
    IF NEW.deadline > goal_final_deadline THEN
        RAISE EXCEPTION 'Checkpoint deadline cannot be after goal final deadline';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER validate_checkpoint_deadline_trigger
    BEFORE INSERT OR UPDATE ON checkpoints
    FOR EACH ROW EXECUTE FUNCTION validate_checkpoint_deadline();