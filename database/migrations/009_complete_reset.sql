-- COMPLETE RESET: Drop everything and start fresh
-- Since no important data exists, we can be destructive

-- Drop all existing tables (including any remaining core tables)
DROP TABLE IF EXISTS consequences CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS checkpoints CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS kompromat CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS validate_checkpoint_deadline() CASCADE;
DROP FUNCTION IF EXISTS increment_balance(UUID, DECIMAL) CASCADE;
DROP FUNCTION IF EXISTS set_onboarding_completed(UUID, BOOLEAN) CASCADE;
DROP FUNCTION IF EXISTS update_social_tokens(UUID, TEXT, TEXT, TEXT) CASCADE;

-- Drop all custom types
DROP TYPE IF EXISTS grading_type CASCADE;
DROP TYPE IF EXISTS goal_status CASCADE;
DROP TYPE IF EXISTS checkpoint_status CASCADE;
DROP TYPE IF EXISTS submission_status CASCADE;
DROP TYPE IF EXISTS submission_type_enum CASCADE;
DROP TYPE IF EXISTS verdict_enum CASCADE;
DROP TYPE IF EXISTS kompromat_severity CASCADE;
DROP TYPE IF EXISTS contact_role CASCADE;
DROP TYPE IF EXISTS consequence_type_enum CASCADE;
DROP TYPE IF EXISTS execution_status_enum CASCADE;
DROP TYPE IF EXISTS charity_enum CASCADE;

-- Recreate ENUM types
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

-- Create the 6-table simplified schema with auth.users references

-- 1. Kompromat table
CREATE TABLE kompromat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size_bytes INTEGER,
    severity kompromat_severity NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT kompromat_severity_check CHECK (severity IN ('minor', 'major')),
    CONSTRAINT kompromat_file_size_check CHECK (file_size_bytes > 0)
);

-- 2. Contacts table
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    roles contact_role[] NOT NULL DEFAULT '{}',
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT contacts_email_check CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT contacts_roles_not_empty CHECK (array_length(roles, 1) > 0)
);

-- 3. Goals table (monetary stakes now optional)
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    final_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Grading configuration
    grading_rubric TEXT NOT NULL,
    referee_type grading_type NOT NULL DEFAULT 'ai',
    witness_contact_id UUID REFERENCES contacts(id),
    
    -- Stakes and consequences (monetary now optional)
    monetary_stake DECIMAL(10,2) DEFAULT 0.00,
    charity_destination charity_enum,
    minor_kompromat_id UUID REFERENCES kompromat(id),
    major_kompromat_id UUID REFERENCES kompromat(id),
    
    -- Status and metadata
    status goal_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Updated constraints (monetary now optional)
    CONSTRAINT goals_deadline_future CHECK (final_deadline > NOW()),
    CONSTRAINT goals_monetary_stake_non_negative CHECK (monetary_stake >= 0),
    CONSTRAINT goals_title_length CHECK (char_length(title) BETWEEN 3 AND 200),
    CONSTRAINT goals_rubric_length CHECK (char_length(grading_rubric) >= 10)
);

-- 4. Checkpoints table
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
    
    CONSTRAINT checkpoints_order_positive CHECK (order_position > 0),
    CONSTRAINT checkpoints_title_length CHECK (char_length(title) BETWEEN 3 AND 200)
);

-- 5. Submissions table
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checkpoint_id UUID NOT NULL REFERENCES checkpoints(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    submission_type submission_type_enum NOT NULL,
    file_path TEXT,
    external_url TEXT,
    description TEXT,
    
    ai_analysis_result JSONB,
    human_verdict verdict_enum,
    feedback_text TEXT,
    confidence_score DECIMAL(3,2),
    
    status submission_status DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    graded_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT submissions_content_provided CHECK (
        (submission_type = 'file_upload' AND file_path IS NOT NULL) OR
        (submission_type = 'external_url' AND external_url IS NOT NULL) OR
        (submission_type = 'text_description' AND description IS NOT NULL)
    ),
    CONSTRAINT submissions_confidence_range CHECK (confidence_score BETWEEN 0.00 AND 1.00)
);

-- 6. Consequences table
CREATE TABLE consequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checkpoint_id UUID REFERENCES checkpoints(id),
    goal_id UUID REFERENCES goals(id),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    consequence_type consequence_type_enum NOT NULL,
    monetary_amount DECIMAL(10,2),
    charity_destination charity_enum,
    kompromat_id UUID REFERENCES kompromat(id),
    target_contact_id UUID REFERENCES contacts(id),
    social_platform TEXT,
    
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    executed_at TIMESTAMP WITH TIME ZONE,
    execution_status execution_status_enum DEFAULT 'pending',
    execution_details JSONB,
    
    CONSTRAINT consequences_monetary_amount_positive CHECK (
        consequence_type != 'monetary' OR monetary_amount > 0
    ),
    CONSTRAINT consequences_kompromat_required CHECK (
        consequence_type NOT IN ('humiliation_email', 'humiliation_social') OR kompromat_id IS NOT NULL
    )
);

-- Create indexes
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

-- Create checkpoint validation function and trigger
CREATE OR REPLACE FUNCTION validate_checkpoint_deadline()
RETURNS TRIGGER AS $$
DECLARE
    goal_final_deadline TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT final_deadline INTO goal_final_deadline
    FROM goals
    WHERE id = NEW.goal_id;
    
    IF NEW.deadline > goal_final_deadline THEN
        RAISE EXCEPTION 'Checkpoint deadline cannot be after goal final deadline';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_checkpoint_deadline_trigger ON checkpoints;
CREATE TRIGGER validate_checkpoint_deadline_trigger
    BEFORE INSERT OR UPDATE ON checkpoints
    FOR EACH ROW EXECUTE FUNCTION validate_checkpoint_deadline();