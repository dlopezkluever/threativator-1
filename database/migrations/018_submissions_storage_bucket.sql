-- Create submissions storage bucket with proper RLS policies
-- This bucket is for user file submissions (proof uploads)

-- Create the submissions storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'submissions',
  'submissions',
  true, -- Public bucket so files can be viewed via public URLs
  10485760, -- 10MB limit
  ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'video/mp4',
    'video/mov',
    'video/quicktime',
    'video/avi',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Remove any existing submission storage policies to avoid conflicts
DROP POLICY IF EXISTS "Users can upload to own submission folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own submissions" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own submissions" ON storage.objects;
DROP POLICY IF EXISTS "Service role can manage all submission objects" ON storage.objects;

-- Storage policies for submissions bucket
-- Users can upload to their own folder: users/{userId}/submissions/
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

-- Users can delete their own submissions (for cleanup)
CREATE POLICY "Users can delete own submissions" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'submissions' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Service role can manage all submission objects (for admin operations)
CREATE POLICY "Service role can manage all submission objects" ON storage.objects
  FOR ALL TO service_role USING (bucket_id = 'submissions');

-- Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;