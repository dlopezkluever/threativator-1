  Next Steps for You:
  1. Deploy function: supabase functions deploy gradeSubmission
  2. Apply migration: Run 014_grading_trigger.sql in Supabase SQL editor
  3. Set environment variables: Add GOOGLE_API_KEY in Supabase Dashboard
  4. Create submissions bucket: Run the storage policy SQL from DEPLOYMENT.md
  5. Test: Use the test scripts to verify functionality

  The function is production-ready with security features, cost optimization, and comprehensive error handling!

> wait can you explain in more detail what in need to do "The Next Steps for You"

● Absolutely! Let me break down each step in detail with the exact commands and actions you need to take:

  Detailed Next Steps for Deployment

  1. Deploy the Edge Function

  Where: Command line in your project root
  Command:
  cd "C:\Users\Daniel Lopez\Desktop\Neet-a-thon\Threativator\threativator-1"
  supabase functions deploy gradeSubmission

  What this does: Uploads the TypeScript function to Supabase's servers so it can be called via HTTP

  Expected output: You should see deployment success message with a function URL

  ---
  2. Apply the Database Migration

  Where: Supabase Dashboard → SQL Editor
  Steps:
  1. Go to https://supabase.com/dashboard
  2. Select your project
  3. Click "SQL Editor" in left sidebar
  4. Copy the contents of database/migrations/014_grading_trigger.sql
  5. Paste into SQL Editor
  6. Click "RUN" button

  What this does: Creates a database trigger that automatically calls the gradeSubmission function when a submission becomes 'pending' with AI referee type

  ---
  3. Set Environment Variables

  Where: Supabase Dashboard → Edge Functions
  Steps:
  1. In Supabase Dashboard, go to "Edge Functions" in left sidebar
  2. Click on "gradeSubmission" function
  3. Go to "Settings" or "Environment Variables" tab
  4. Add these variables:

  GOOGLE_API_KEY = your_actual_gemini_api_key_from_env_file
  SUPABASE_URL = https://your-project-id.supabase.co
  SUPABASE_SERVICE_ROLE_KEY = your_service_role_key

  How to get these values:
  - GOOGLE_API_KEY: Already in your .env file
  - SUPABASE_URL: In your .env as VITE_SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY: Supabase Dashboard → Settings → API → service_role key

  ---
  4. Create Submissions Storage Bucket

  Where: Supabase Dashboard → SQL Editor (same as step 2)
  SQL to run:
  -- Create submissions bucket
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('submissions', 'submissions', false)
  ON CONFLICT (id) DO NOTHING;

  -- Set storage policies
  CREATE POLICY "Users can upload their own submission files"
  ON storage.objects FOR INSERT
  WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

  CREATE POLICY "Users can read their own submission files"
  ON storage.objects FOR SELECT
  USING (auth.uid()::text = (storage.foldername(name))[1]);

  What this does: Creates a secure storage bucket where users can upload submission files that only they can access

  ---
  5. Configure Database Settings

  Where: Supabase Dashboard → SQL Editor
  SQL to run (replace with your actual values):
  SELECT set_config('app.edge_function_url', 'https://ksbbgnrphqhwixwnjdri.supabase.co', false);
  SELECT set_config('app.service_role_key', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYmJnbnJwaHFod2l4d25qZHJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjYyNDM2MywiZXhwIjoyMDcyMjAwMzYzfQ.HdxyEVftxiBr7eRarQyJTwhk78Kh7MBKKsxbfe_J5ao', false);

  What this does: Tells the database trigger where to find your Edge Function

  ---
  6. Test the Implementation

  Option A - Set up test data:
  1. Go to Supabase Dashboard → SQL Editor
  2. Copy contents of supabase/functions/gradeSubmission/test-setup.sql
  3. Paste and run to create test submissions

  Option B - Test through your app:
  1. Create a goal with AI referee type
  2. Add a checkpoint
  3. Submit something for that checkpoint
  4. Check if it gets automatically graded

  Option C - Direct API test:
  # Replace YOUR_PROJECT_ID and YOUR_ANON_KEY with actual values
  curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/gradeSubmission \
    -H "Authorization: Bearer YOUR_ANON_KEY" \
    -H "Content-Type: application/json" \
    -d '{"submission_id": "some-test-id"}'

  ---
  Quick Verification Checklist

  - Function deployed (check Supabase Dashboard → Edge Functions)
  - Database trigger exists (check if trigger shows up in database schema)
  - Environment variables set (function settings show the vars)
  - Storage bucket created (check Supabase Dashboard → Storage)
  - Test submission gets automatically graded

  Need help with any of these steps? Let me know which part you're stuck on and I can provide more specific guidance!
  
  
  
  Quick Start (Recommended)

  Try this sequence:

  # Install CLI
  npm install -g supabase

  # Verify it works
  supabase --version

  # Login (opens browser)
  supabase login

  # Link your project (replace with your actual project ref)
  supabase link --project-ref YOUR_PROJECT_REF

  # Deploy the function
  supabase functions deploy gradeSubmission

  If you get permission errors with npm install -g, try:
  npm install -g supabase --force

  Let me know if you run into any issues with the installation!

  ● I see the issue! Supabase CLI needs to be installed as a dev dependency, not globally. Let me help you fix this:

  Install Supabase CLI as Dev Dependency

  npm i supabase --save-dev

  Then Use npx to Run Commands

  After installation, you'll use npx to run Supabase commands:

  # Verify installation
  npx supabase --version

  # Login to Supabase
  npx supabase login

  # Link your project (replace with your actual project ref)
  npx supabase link --project-ref YOUR_PROJECT_REF

  # Deploy the function
  npx supabase functions deploy gradeSubmission

  Complete Sequence

  Run these commands one by one:

  # 1. Install Supabase CLI locally
  npm i supabase --save-dev

  # 2. Check it works
  npx supabase --version

  # 3. Login (this will open your browser)
  npx supabase login

  # 4. Link your project (get project-ref from Supabase Dashboard URL or Settings)
  npx supabase link --project-ref YOUR_PROJECT_REF

  # 5. Deploy the grading function
  npx supabase functions deploy gradeSubmission

  To find your project-ref:
  1. Go to your Supabase Dashboard
  2. Look at the URL: https://supabase.com/dashboard/project/[THIS-IS-YOUR-PROJECT-REF]
  3. Or go to Settings → General → Reference ID

  The key difference is using npx supabase instead of just supabase since it's installed locally rather than globally.

1Odielone!

  Try the installation first and let me know if you run into any other issues!