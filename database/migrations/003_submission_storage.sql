-- Supabase Storage setup for submission files
-- This creates the storage bucket and RLS policies for user file submissions

-- Create the submissions storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'submissions',
  'submissions',
  true,
  10485760, -- 10MB limit
  ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'application/pdf',
    'video/mp4',
    'video/mov',
    'video/quicktime'
  ]
);

-- Storage policies for submissions bucket
-- Users can only upload to their own folder: /users/{userId}/submissions/
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

-- Service role can manage all objects (for admin operations)
CREATE POLICY "Service role can manage all submission objects" ON storage.objects
  FOR ALL TO service_role USING (bucket_id = 'submissions');