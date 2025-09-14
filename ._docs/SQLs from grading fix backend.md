Of course\! Here are all the SQL queries mentioned in the document, compiled into a single master file.

-----

# Master SQL Query File

This document contains a comprehensive list of all SQL queries, functions, and policies discussed and created during the debugging and feature implementation session.

## 1\. Initial Storage Bucket Creation and Policies

These were the initial attempts to create the storage bucket and its associated Row-Level Security (RLS) policies.

### Bucket Creation

```sql
-- Create submissions storage bucket with proper RLS policies
-- This bucket is for user file submissions (proof uploads)
-- Create the submissions storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'submissions',
  'submissions',
  true, -- Public bucket so files can be viewed via public URLs
  10485760, -- 10MB limit
  '{image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf,video/mp4,video/mov,video/quicktime,text/plain}'
);
```

### Initial RLS Policies

```sql
-- Users can upload to own submission folder
CREATE POLICY "Users can upload to own submission folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'submissions' AND
  auth.uid()::text = (storage.foldername(name))[1] AND
  (storage.foldername(name))[2] = 'submissions'
);

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions" ON storage.objects
FOR SELECT USING (
  bucket_id = 'submissions' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## 2\. Fixing Conflicting Storage Policies

These queries were created to clean up and correct conflicting or incorrect storage policies.

### Full Policy Fix (`fix-storage-policies.sql`)

This script removes all potentially conflicting policies and recreates the correct ones for both `submissions` and `kompromat` buckets.

```sql
-- Fix Storage Policies - Remove Conflicting Policies and Create Correct Ones
-- Run this in your Supabase SQL Editor
-- ============================================
-- STEP 1: Clean up all existing conflicting policies
-- ============================================
-- Remove all existing submission policies
DROP POLICY IF EXISTS "Service role can manage all submission objects" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own submissions" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to own submission folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own submissions" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own submission files" ON storage.objects;

-- Remove all existing kompromat policies
DROP POLICY IF EXISTS "Users can upload kompromat to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own kompromat files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own kompromat files" ON storage.objects;

-- ============================================
-- STEP 2: Create new, correct policies
-- ============================================
-- Policies for "submissions" bucket
-- Path pattern: users/{userId}/submissions/filename.jpg
-- ============================================
-- 1. Users can upload to their own submission folder
CREATE POLICY "Users can upload to own submission folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'submissions' AND
  auth.uid()::text = (storage.foldername(name))[2] AND
  (storage.foldername(name))[1] = 'users' AND
  (storage.foldername(name))[3] = 'submissions'
);

-- 2. Users can view their own submission files
CREATE POLICY "Users can view own submissions" ON storage.objects
FOR SELECT USING (
  bucket_id = 'submissions' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- 3. Users can delete their own submission files
CREATE POLICY "Users can delete own submissions" ON storage.objects
FOR DELETE USING (
  bucket_id = 'submissions' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- ============================================
-- Policies for "kompromat" bucket
-- Path pattern: {userId}/kompromat/filename.jpg
-- ============================================
-- 1. Users can upload kompromat to their own folder
CREATE POLICY "Users can upload kompromat to their own folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'kompromat' AND
  auth.uid()::text = (storage.foldername(name))[1] AND
  (storage.foldername(name))[2] = 'kompromat'
);

-- 2. Users can view their own kompromat files
CREATE POLICY "Users can view their own kompromat files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'kompromat' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Users can delete their own kompromat files
CREATE POLICY "Users can delete their own kompromat files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'kompromat' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- STEP 3: Ensure service role can do anything (admin access)
-- ============================================
CREATE POLICY "Service role can manage all submission objects" ON storage.objects
FOR ALL USING (
  auth.role() = 'service_role'
);
```

### Safe Policy Fix (`safe-submissions-fix.sql`)

This is a more targeted script that only fixes the `submissions` bucket policies, leaving `kompromat` policies untouched.

```sql
-- SAFE FIX: Only fix submissions policies, leave kompromat alone
-- This is a targeted fix that won't break existing functionality
-- ============================================
-- STEP 1: Remove ONLY conflicting submissions policies
-- ============================================
-- Remove duplicate/conflicting submission policies
DROP POLICY IF EXISTS "Users can upload to own submission folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own submission files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own submissions" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own submissions" ON storage.objects;

-- ============================================
-- STEP 2: Create correct policies for the "submissions" bucket
-- Path pattern: users/{userId}/submissions/filename
-- ============================================
-- 1. Users can upload to their own submission folder
CREATE POLICY "Users can upload to own submission folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'submissions' AND
  (storage.foldername(name))[1] = 'users' AND
  auth.uid()::text = (storage.foldername(name))[2] AND
  (storage.foldername(name))[3] = 'submissions'
);

-- 2. Users can view their own submission files
CREATE POLICY "Users can view own submissions" ON storage.objects
FOR SELECT USING (
  bucket_id = 'submissions' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- 3. Users can delete their own submission files
CREATE POLICY "Users can delete own submissions" ON storage.objects
FOR DELETE USING (
  bucket_id = 'submissions' AND
  auth.uid()::text = (storage.foldername(name))[2]
);
```

## 3\. Bucket-Level Policies and Schema Additions

### Bucket Listing Policy (`add-bucket-policy.sql`)

This policy allows authenticated users to list available buckets, which was necessary for the frontend to perform access checks.

```sql
-- Add bucket-level policy to allow authenticated users to list buckets
-- This is needed so users can access the submissions bucket
-- Allow authenticated users to list/access storage buckets
CREATE POLICY "Authenticated users can list buckets" ON storage.buckets
  FOR SELECT TO authenticated
  USING (true);
```

### Proposed Schema Additions for "Early Completion" Feature

These `ALTER TABLE` statements were planned to support the feature where completing a final checkpoint automatically passes earlier ones.

```sql
-- Add to checkpoints table:
ALTER TABLE checkpoints ADD COLUMN auto_passed_by_final UUID REFERENCES submissions(id);
ALTER TABLE checkpoints ADD COLUMN status_reason TEXT;

-- Add to goals table:
ALTER TABLE goals ADD COLUMN early_completion_enabled BOOLEAN DEFAULT true;
```

## 4\. Grading System Trigger and Configuration

This section covers the setup, configuration, and debugging of the database trigger responsible for initiating the AI grading process.

### Original Grading Trigger (`014_grading_trigger.sql`)

This is the original function and trigger definition that calls the Edge Function.

```sql
-- This trigger calls the gradeSubmission Edge Function when a new submission
-- is created with status = 'pending' and the goal uses the 'ai' referee.
CREATE OR REPLACE FUNCTION trigger_ai_grading()
RETURNS TRIGGER AS $$
DECLARE
  goal_record RECORD;
BEGIN
  -- Only trigger for new pending submissions
  IF NEW.status = 'pending' THEN
    -- Get goal information to check the referee type
    SELECT g.referee_type INTO goal_record
    FROM goals g
    JOIN checkpoints c ON c.goal_id = g.id
    WHERE c.id = NEW.checkpoint_id;

    -- Only proceed if the goal's referee is 'ai'
    IF goal_record.referee_type = 'ai' THEN
      -- Asynchronously call the Edge Function to grade the submission
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

-- Create the trigger on the submissions table
CREATE TRIGGER submissions_ai_grading_trigger
AFTER INSERT ON submissions
FOR EACH ROW
EXECUTE FUNCTION trigger_ai_grading();
```

### Initial Trigger Configuration (Session-based)

These queries were the first attempt to configure the trigger's settings. They were not persistent.

```sql
-- Set Edge Function URL
SELECT set_config('app.edge_function_url', 'https://ksbbgnrphqhwixwnjdri.supabase.co', true);

-- Set Service Role Key
SELECT set_config('app.service_role_key', 'YOUR_SERVICE_ROLE_KEY', true);
```

### Permanent Trigger Configuration (Table-based)

This approach uses a dedicated table to store persistent configuration, making the trigger more reliable.

```sql
-- Create permanent settings table for app configuration
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fix the app_config table structure if `updated_at` is missing
ALTER TABLE app_config ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Insert/Update the Edge Function configuration
INSERT INTO app_config (key, value) VALUES
  ('edge_function_url', 'https://ksbbgnrphqhwixwnjdri.supabase.co'),
  ('service_role_key', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYmJnbnJwaHFod2l4d25qZHJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjYyNDM2MywiZXhwIjoyMDcyMjAwMzYzfQ.HdxyEVftxiBr7eRarQyJTwhk78Kh7MBKKsxbfe_J5ao')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- Verify the configuration was saved
SELECT * FROM app_config;
```

### Updated Grading Trigger (Using `app_config` table)

This is the final, corrected version of the trigger function that reads settings from the `app_config` table.

```sql
CREATE OR REPLACE FUNCTION trigger_ai_grading()
RETURNS TRIGGER AS $$
DECLARE
  goal_record RECORD;
  edge_url TEXT;
  service_key TEXT;
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
      -- Get configuration from permanent table
      SELECT value INTO edge_url FROM app_config WHERE key = 'edge_function_url';
      SELECT value INTO service_key FROM app_config WHERE key = 'service_role_key';

      -- Call the Edge Function
      PERFORM
        net.http_post(
          url := edge_url || '/functions/v1/gradeSubmission',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || service_key
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
```

## 5\. Diagnostic and Test Queries

These queries were used throughout the session to diagnose problems and test functionality.

### Initial Diagnostic Queries

```sql
-- Check if trigger settings are properly stored
SELECT
  name,
  setting,
  source,
  sourceline
FROM pg_settings
WHERE name LIKE 'app.%';

-- Manually call the trigger function with a test submission ID
SELECT trigger_ai_grading() FROM submissions WHERE id = 'YOUR_RECENT_SUBMISSION_ID';
```

### Comprehensive Diagnostic Queries

This block of queries was used to get a full picture of the trigger system's state.

```sql
-- Check trigger configuration
SELECT
  current_setting('app.edge_function_url', true) as edge_url,
  current_setting('app.service_role_key', true) as service_key,
  length(current_setting('app.service_role_key', true)) as key_length;

-- Check if trigger function exists
SELECT EXISTS(
  SELECT 1 FROM pg_proc
  WHERE proname = 'trigger_ai_grading'
) as trigger_function_exists;

-- Check if trigger exists on submissions table
SELECT EXISTS(
  SELECT 1 FROM pg_trigger
  WHERE tgname = 'submissions_ai_grading_trigger'
) as trigger_exists;

-- Get your most recent submission for testing
SELECT
  id,
  checkpoint_id,
  submission_type,
  status,
  submitted_at
FROM submissions
ORDER BY submitted_at DESC
LIMIT 1;
```

### Final Submission Status Check

This query was used to check the detailed status of recent submissions for the logged-in user.

```sql
-- Get your most recent submission with full details
SELECT
  id,
  checkpoint_id,
  submission_type,
  status,
  submitted_at,
  graded_at,
  feedback_text,
  ai_analysis_result
FROM submissions
WHERE user_id = (SELECT auth.uid())
ORDER BY submitted_at DESC
LIMIT 3;
```