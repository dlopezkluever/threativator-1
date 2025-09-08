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
DROP POLICY IF EXISTS "Users can read their own submission files" ON storage.objects;

-- Remove all existing kompromat policies
DROP POLICY IF EXISTS "Users can delete their own kompromat" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own kompromat" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own kompromat" ON storage.objects;

-- ============================================
-- STEP 2: Create correct policies for SUBMISSIONS bucket
-- File path pattern: users/{userId}/submissions/filename
-- Array indices: [0]=users, [1]={userId}, [2]=submissions, [3]=filename
-- ============================================

-- Service role can manage everything
CREATE POLICY "Service role can manage all submission objects" ON storage.objects
  FOR ALL TO service_role 
  USING (bucket_id = 'submissions');

-- Authenticated users can upload to their own folder
CREATE POLICY "Users can upload to own submission folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'submissions' AND
    auth.uid()::text = (storage.foldername(name))[2] AND
    (storage.foldername(name))[1] = 'users' AND 
    (storage.foldername(name))[3] = 'submissions'
  );

-- Authenticated users can view their own submissions
CREATE POLICY "Users can view own submissions" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'submissions' AND
    auth.uid()::text = (storage.foldername(name))[2] AND
    (storage.foldername(name))[1] = 'users'
  );

-- Authenticated users can delete their own submissions  
CREATE POLICY "Users can delete own submissions" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'submissions' AND
    auth.uid()::text = (storage.foldername(name))[2] AND
    (storage.foldername(name))[1] = 'users'
  );

-- ============================================
-- STEP 3: Create correct policies for KOMPROMAT bucket  
-- File path pattern: {userId}/kompromat/filename
-- Array indices: [0]={userId}, [1]=kompromat, [2]=filename
-- ============================================

-- Authenticated users can upload their own kompromat
CREATE POLICY "Users can upload their own kompromat" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'kompromat' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    (storage.foldername(name))[2] = 'kompromat'
  );

-- Authenticated users can view their own kompromat
CREATE POLICY "Users can view their own kompromat" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'kompromat' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Authenticated users can delete their own kompromat
CREATE POLICY "Users can delete their own kompromat" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'kompromat' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- STEP 4: Enable RLS (ensure it's on)
-- ============================================
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;