-- ========================================
-- KOMPROMAT-ONLY SETUP SCRIPT
-- ========================================
-- This script only creates the missing kompromat components
-- Run this in your Supabase SQL Editor

-- Step 1: Create kompromat severity enum (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kompromat_severity') THEN
        CREATE TYPE kompromat_severity AS ENUM ('minor', 'major');
    END IF;
END $$;

-- Step 2: Create kompromat table (if not exists)
CREATE TABLE IF NOT EXISTS kompromat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Step 3: Enable RLS on kompromat table
ALTER TABLE kompromat ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for kompromat (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'kompromat' AND policyname = 'Users can view own kompromat') THEN
        CREATE POLICY "Users can view own kompromat" ON kompromat
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'kompromat' AND policyname = 'Users can insert own kompromat') THEN
        CREATE POLICY "Users can insert own kompromat" ON kompromat
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'kompromat' AND policyname = 'Users can update own kompromat') THEN
        CREATE POLICY "Users can update own kompromat" ON kompromat
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'kompromat' AND policyname = 'Users can delete own kompromat') THEN
        CREATE POLICY "Users can delete own kompromat" ON kompromat
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Step 5: Create kompromat storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kompromat',
  'kompromat',
  false,  -- Private bucket
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
) ON CONFLICT (id) DO NOTHING;

-- Step 6: Create storage policies for kompromat bucket
DO $$
BEGIN
    -- Check if policies exist, create if not
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Users can upload their own kompromat') THEN
        CREATE POLICY "Users can upload their own kompromat" 
        ON storage.objects 
        FOR INSERT 
        TO authenticated 
        WITH CHECK (bucket_id = 'kompromat' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Users can view their own kompromat') THEN
        CREATE POLICY "Users can view their own kompromat" 
        ON storage.objects 
        FOR SELECT 
        TO authenticated 
        USING (bucket_id = 'kompromat' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Users can delete their own kompromat') THEN
        CREATE POLICY "Users can delete their own kompromat" 
        ON storage.objects 
        FOR DELETE 
        TO authenticated 
        USING (bucket_id = 'kompromat' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END $$;

-- Step 7: Create index for performance
CREATE INDEX IF NOT EXISTS idx_kompromat_user_id ON kompromat(user_id);

-- Step 8: Create helper function for PaymentModal
CREATE OR REPLACE FUNCTION increment_balance(user_id UUID, amount DECIMAL)
RETURNS VOID AS $$
BEGIN
    UPDATE auth.users 
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('holding_cell_balance', 
        COALESCE((raw_user_meta_data->>'holding_cell_balance')::decimal, 0) + amount)
    WHERE id = user_id;
    
    -- Also update our custom users table if it exists
    UPDATE users 
    SET holding_cell_balance = COALESCE(holding_cell_balance, 0) + amount,
        updated_at = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Run these to verify setup worked:

SELECT 'Kompromat table exists' as status, count(*) as rows FROM kompromat;
SELECT 'Kompromat bucket exists' as status, id, name, public FROM storage.buckets WHERE id = 'kompromat';
SELECT 'Helper function exists' as status, proname FROM pg_proc WHERE proname = 'increment_balance';

-- SUCCESS! Your kompromat modal should now work with real backend storage!