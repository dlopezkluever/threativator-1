-- Simple fixes that don't require storage table permissions
-- Add missing priority column and create storage bucket

-- Add missing priority column to goals table
ALTER TABLE goals ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';

-- Create storage bucket if it doesn't exist (this should work)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kompromat',
  'kompromat', 
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mov', 'application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

