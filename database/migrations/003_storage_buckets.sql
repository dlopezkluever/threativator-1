-- Create Storage buckets for file uploads
-- This migration creates the necessary storage buckets and policies

-- Create kompromat bucket for storing embarrassing content
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kompromat', 'kompromat', false);

-- Create submissions bucket for goal proof uploads (for future use)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('submissions', 'submissions', false);

-- Create avatars bucket for profile pictures (for future use)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- Storage policies for kompromat bucket
-- Users can only access their own kompromat files
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

-- Storage policies for submissions bucket (for future use)
CREATE POLICY "Users can upload their own submissions" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'submissions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own submissions" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (bucket_id = 'submissions' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for avatars bucket (for future use)
CREATE POLICY "Anyone can view avatars" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatars" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatars" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatars" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);