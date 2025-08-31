# Database Setup Guide

## Phase 1.2: Supabase Backend Initialization

This guide walks you through setting up the Supabase database for the Threativator application.

## Prerequisites

- Supabase project created at [supabase.com](https://supabase.com)
- Environment variables configured in `.env`:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_KEY`

## Database Schema Setup

### Step 1: Run Initial Schema Migration

1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `database/migrations/001_initial_schema.sql`
4. Execute the query

This will create:
- All core tables (users, goals, checkpoints, submissions, etc.)
- Custom ENUM types for type safety
- Indexes for optimal query performance
- Trigger functions for automatic timestamp updates
- Validation constraints

### Step 2: Apply Row Level Security Policies

1. In the Supabase SQL Editor
2. Copy and paste the contents of `database/migrations/002_rls_policies.sql`
3. Execute the query

This will:
- Enable RLS on all tables
- Create policies ensuring users can only access their own data
- Set up service role permissions for system operations
- Create helper functions for complex policy checks

## Verification

After running the migrations, visit the health check page in your application:

```bash
npm run dev
```

Navigate to `http://localhost:5174` to see the Database Health Check page.

The health check will verify:
- ✅ Supabase connection established
- ✅ All required tables exist
- ✅ Authentication configuration working
- ✅ Row Level Security policies enforced

## Database Schema Overview

### Core Tables

- **users**: Extended user profiles with financial and social media data
- **goals**: User-defined objectives with stakes and deadlines
- **checkpoints**: Milestone deadlines within goals
- **submissions**: Proof uploads for checkpoint completion
- **consequences**: Tracking of penalty executions
- **contacts**: User's witnesses and consequence targets
- **kompromat**: Secure storage for embarrassing content
- **teams**: Support for team-based goals (future feature)

### Security Features

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Service role permissions for system operations
- Encrypted storage ready for sensitive data
- Audit logging for important actions

### Performance Optimizations

- Strategic indexes on frequently queried columns
- Efficient foreign key constraints
- Optimized data types and constraints
- Prepared for horizontal scaling

## Troubleshooting

### Common Issues

1. **Connection Errors**: Verify environment variables are correctly set
2. **Permission Denied**: Ensure RLS policies are properly applied
3. **Missing Tables**: Run the initial schema migration first
4. **Auth Issues**: Check Supabase project configuration

### Health Check Failures

- **Supabase Connection**: Check URL and keys in `.env`
- **Database Tables**: Verify schema migration completed successfully
- **Authentication**: Ensure Supabase Auth is enabled in dashboard
- **Row Level Security**: Confirm RLS policies were applied

## Next Steps

Once the health check passes completely, you're ready for:
- **Phase 2.1**: User Onboarding & Authentication
- **Phase 2.2**: Core Goal Management
- **Phase 2.3**: Submission & AI Grading Loop

## Schema Updates

When modifying the schema:
1. Create new migration files with incremental numbers
2. Test changes in development first
3. Apply RLS policies for any new tables
4. Update TypeScript types in `src/lib/supabase.ts`
5. Run health check to verify changes