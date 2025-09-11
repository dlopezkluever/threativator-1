Run this SQL in Supabase SQL Editor:
-- Set Edge Function URL
SELECT set_config('app.edge_function_url', 'https://ksbbgnrphqhwixwnjdri.supabase.co', true);

-- Set Service Role Key  
SELECT set_config('app.service_role_key', 'YOUR_SERVICE_ROLE_KEY', true);