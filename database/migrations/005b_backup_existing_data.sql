-- BACKUP existing data before schema changes
-- Run this BEFORE migration 006 if you have important data

-- Check what tables still exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('kompromat', 'contacts', 'goals', 'checkpoints', 'submissions', 'consequences');

-- If any tables exist with data, backup first:
-- CREATE TABLE kompromat_backup AS SELECT * FROM kompromat;
-- CREATE TABLE contacts_backup AS SELECT * FROM contacts;
-- CREATE TABLE goals_backup AS SELECT * FROM goals;
-- CREATE TABLE checkpoints_backup AS SELECT * FROM checkpoints;
-- CREATE TABLE submissions_backup AS SELECT * FROM submissions;
-- CREATE TABLE consequences_backup AS SELECT * FROM consequences;

-- Uncomment the backup lines above if you have important data to preserve