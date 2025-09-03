-- ========================================
-- THREATIVATOR DATABASE SETUP SCRIPT
-- ========================================
-- Run this script in your Supabase SQL Editor to set up all required tables and storage

-- Step 1: Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Step 2: Create ENUM types
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

-- Step 3: Create users table (extends Supabase auth.users)
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

-- Step 4: Create contacts table
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

-- Step 5: Create kompromat table ⭐ KEY TABLE FOR MODAL
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

-- Step 6: Create goals table
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

-- Step 7: Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE kompromat ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS Policies for kompromat (security critical)
CREATE POLICY "Users can view own kompromat" ON kompromat
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own kompromat" ON kompromat
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own kompromat" ON kompromat
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own kompromat" ON kompromat
    FOR DELETE USING (auth.uid() = user_id);

-- Step 9: Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kompromat', 'kompromat', false)
ON CONFLICT (id) DO NOTHING;

-- Step 10: Create storage policies for kompromat bucket
CREATE POLICY "Users can upload their own kompromat" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'kompromat' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own kompromat" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (bucket_id = 'kompromat' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own kompromat" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'kompromat' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Step 11: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_kompromat_user_id ON kompromat(user_id);
CREATE INDEX IF NOT EXISTS idx_kompromat_created_at ON kompromat(created_at);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Step 12: Create helper function for balance updates (for PaymentModal)
CREATE OR REPLACE FUNCTION increment_balance(user_id UUID, amount DECIMAL)
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET holding_cell_balance = holding_cell_balance + amount,
        updated_at = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- SETUP COMPLETE! 
-- ========================================
-- Your kompromat modal should now work with real Supabase storage!
-- 
-- Verify setup by running:
-- SELECT * FROM kompromat LIMIT 1; 
-- SELECT * FROM storage.buckets WHERE id = 'kompromat';