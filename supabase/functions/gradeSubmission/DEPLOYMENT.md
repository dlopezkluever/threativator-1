# gradeSubmission Edge Function Deployment Guide

## Prerequisites

1. **Supabase CLI installed and logged in**
2. **Project linked**: `supabase link --project-ref your-project-ref`
3. **Environment variables set** in Supabase Dashboard

## Environment Variables

Set these in Supabase Dashboard → Edge Functions → Environment Variables:

```bash
GOOGLE_API_KEY=your_gemini_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Deployment Steps

### 1. Deploy the Edge Function

```bash
cd supabase/functions/gradeSubmission
supabase functions deploy gradeSubmission --project-ref your-project-ref
```

### 2. Apply Database Migration

Run the following SQL in Supabase SQL editor:

```sql
-- Apply the trigger migration
\i 014_grading_trigger.sql
```

### 3. Configure Database Settings

Set the Edge Function URL and service key:

```sql
SELECT set_config('app.edge_function_url', 'https://your-project.supabase.co', false);
SELECT set_config('app.service_role_key', 'your-service-role-key', false);
```

### 4. Create Storage Bucket for Submissions

```sql
-- Create submissions bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('submissions', 'submissions', false)
ON CONFLICT (id) DO NOTHING;

-- Set storage policy for submissions bucket
CREATE POLICY "Users can upload their own submission files" 
ON storage.objects FOR INSERT 
WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can read their own submission files" 
ON storage.objects FOR SELECT 
USING (auth.uid()::text = (storage.foldername(name))[1]);
```

## Testing

### 1. Set Up Test Data

```bash
# Run test setup SQL
# Execute test-setup.sql in Supabase SQL editor
```

### 2. Test the Function

```bash
# Test individual cases
curl -X POST https://your-project.supabase.co/functions/v1/gradeSubmission \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"submission_id": "test-word-count-pass"}'
```

## Monitoring

### Check Function Logs

```bash
supabase functions logs gradeSubmission --project-ref your-project-ref
```

### Monitor API Usage

The function logs metrics that can be monitored:
- Response time
- API calls made to Gemini
- Cost optimization hits/misses
- Error rates

## Troubleshooting

### Common Issues

1. **403 Forbidden**: Check service role key has proper permissions
2. **Gemini API Error**: Verify GOOGLE_API_KEY is set and valid
3. **Database Trigger Not Firing**: Check pg_net extension is enabled
4. **File Access Issues**: Verify storage bucket policies are configured

### Debug Mode

Add debug logging by setting environment variable:
```bash
DEBUG_GRADING=true
```

## Security Considerations

- Rubric sanitization prevents prompt injection
- Service role key should have minimal required permissions
- File uploads are validated for type and size
- API calls have timeouts to prevent hanging
- Sensitive data is not logged

## Cost Optimization

The function minimizes costs by:
1. Performing free checks first (word count, URL validation)
2. Only calling Gemini API when necessary
3. Using efficient prompt design
4. Implementing request caching where possible

## Future Enhancements

- OCR integration for image analysis
- PDF text extraction
- Advanced GitHub analysis
- Batch processing capabilities
- Real-time notifications