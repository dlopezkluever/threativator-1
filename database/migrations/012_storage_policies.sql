-- Fix Storage RLS policies for kompromat uploads and missing priority column
-- The "new row violates row-level security policy" error is from storage bucket policies

-- Add missing priority column to goals table
ALTER TABLE goals ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kompromat',
  'kompromat', 
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mov', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Remove any existing storage policies
DROP POLICY IF EXISTS "Users can upload own kompromat" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own kompromat" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own kompromat" ON storage.objects;

-- Create new storage policies using the correct path pattern
CREATE POLICY "Users can upload own kompromat" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'kompromat' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own kompromat" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'kompromat' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own kompromat" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'kompromat' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;