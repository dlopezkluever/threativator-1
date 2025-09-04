-- SCHEMA REDUX APPLICATION GUIDE
-- Run these migrations in order via Supabase SQL editor

-- STEP 1: Clean up problematic tables and policies
\i database/migrations/004_schema_cleanup.sql

-- STEP 2: Remove team and custom user RLS policies
\i database/migrations/005_clean_rls_policies.sql

-- STEP 3: Create simplified schema with auth.users references
\i database/migrations/006_simplified_schema.sql

-- STEP 4: Apply basic RLS policies using auth.uid() patterns
\i database/migrations/007_simple_rls_policies.sql

-- STEP 5: Add user metadata management functions
\i database/migrations/008_user_metadata_functions.sql

-- VERIFICATION QUERIES:
-- Run these to verify the migration succeeded

-- Check that problematic tables are gone
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'teams', 'team_members', 'notification_preferences', 'audit_log');
-- Should return 0 rows

-- Check remaining tables use auth.users references
SELECT tc.table_name, tc.constraint_name, tc.constraint_type 
FROM information_schema.table_constraints tc
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- Check RLS policies are simplified
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test auth.uid() access (run when logged in)
SELECT 'kompromat' as table_name, count(*) as accessible_rows FROM kompromat;
SELECT 'contacts' as table_name, count(*) as accessible_rows FROM contacts;
SELECT 'goals' as table_name, count(*) as accessible_rows FROM goals;