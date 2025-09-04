# gradeSubmission Edge Function

Automatically grades user submissions using AI analysis with cost optimization and security features.

## Features

- **Automatic Triggering**: Triggered by database trigger when submission status is 'pending' and referee_type is 'ai'
- **Cost Optimization**: Performs simple checks first before calling expensive AI APIs
- **Security**: Sanitizes user rubrics to prevent prompt injection attacks
- **Multi-format Support**: Handles text, URLs, and file uploads with appropriate validation
- **GitHub Integration**: Verifies commit activity for coding projects
- **Retry Logic**: Handles API failures with exponential backoff
- **Metrics Tracking**: Logs API usage for monitoring and cost control

## Pre-checks (No AI API Cost)

1. **Word Count Validation**: Extracts minimum word requirements from rubric and validates
2. **URL Accessibility**: Verifies external URLs are reachable and valid
3. **GitHub Commit Verification**: Checks recent commit activity for repository links
4. **Number Extraction**: Finds numeric values in text for quantitative requirements

## AI Analysis (Gemini API)

Only triggered when:
- Simple checks are inconclusive
- Rubric contains qualitative criteria (quality, coherence, analysis, etc.)
- Complex evaluation is required

## Deployment

### 1. Environment Variables Required

Set these in Supabase Dashboard → Edge Functions → Environment Variables:

```bash
GOOGLE_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Deploy Function

```bash
supabase functions deploy gradeSubmission --project-ref your-project-ref
```

### 3. Database Migration

Run `014_grading_trigger.sql` in Supabase SQL editor to create the automatic trigger.

### 4. Configuration

Set Edge Function URL in database:
```sql
SELECT set_config('app.edge_function_url', 'https://your-project.supabase.co', false);
SELECT set_config('app.service_role_key', 'your-service-role-key', false);
```

## Testing

### Manual Testing

```bash
# Run test setup (creates test data)
# Execute test-setup.sql in Supabase SQL editor

# Run manual tests
deno run --allow-net --allow-env manual-test.ts

# Run Deno tests
deno test --allow-net --allow-env test.ts
```

### Test Cases Covered

- ✅ Word count validation (pass/fail)
- ✅ URL accessibility checking
- ✅ GitHub commit verification
- ✅ Prompt injection prevention
- ✅ Error handling and retries
- ✅ Edge cases (empty submissions, malformed data)
- ✅ API usage metrics logging

## Security Features

### Prompt Injection Prevention

The function sanitizes user rubrics by:
- Removing system/assistant/user role declarations
- Filtering out instruction override attempts
- Limiting rubric length to 2000 characters
- Removing JSON brackets that could break parsing

### Input Validation

- Validates submission IDs and required fields
- Checks file types and sizes for uploads
- Validates URL formats and accessibility
- Limits processing time with timeouts

## Cost Optimization

1. **Simple Checks First**: Performs regex-based validation before AI calls
2. **Conditional AI Usage**: Only uses Gemini API when necessary
3. **Efficient Prompting**: Uses structured prompts optimized for accuracy
4. **Metrics Tracking**: Monitors API usage for cost control

## Response Format

```json
{
  "success": true,
  "result": {
    "verdict": "pass" | "fail",
    "confidence_score": 0.0-1.0,
    "reasoning": "Explanation of decision",
    "word_count": 150,
    "url_accessible": true
  }
}
```

## Error Handling

- Database connection failures
- API rate limiting and timeouts
- Invalid submission data
- Missing environment variables
- File processing errors

## Future Enhancements

- **OCR Integration**: Google Vision API for image text extraction
- **PDF Processing**: Text extraction from PDF documents
- **Advanced GitHub Analysis**: Code quality metrics, specific file changes
- **Webhook Integration**: Real-time notifications to frontend
- **Batch Processing**: Multiple submissions in single request