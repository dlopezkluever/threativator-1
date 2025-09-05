# Threativator Consequence Engine Documentation

## Overview

The Consequence Engine is the heart of Threativator's accountability system. It automatically detects missed deadlines and executes appropriate consequences according to the "Russian Roulette" probability system.

## Architecture

### Components

1. **Database Functions** (PostgreSQL + pg_cron)
   - `check_overdue_checkpoints()` - Detects missed deadlines
   - `trigger_consequence_processing()` - Initiates consequence processing
   - Cron job running every 5 minutes

2. **Edge Function** (`triggerConsequence`)
   - Processes identified failures
   - Implements Russian Roulette logic
   - Integrates with Stripe and SendGrid
   - Creates audit trail

3. **Frontend Components**
   - `ConsequenceModal` - Dramatic failure notifications
   - `useConsequenceNotifications` - Real-time consequence detection

## Russian Roulette System

### Probability Rules

- **Checkpoint Failures**: 33% chance of consequence execution
- **Final Deadline Failures**: 100% chance of consequence execution (guaranteed)

### Implementation

```typescript
async function russianRoulette(): Promise<boolean> {
  const randomArray = new Uint8Array(1)
  crypto.getRandomValues(randomArray)
  const roll = randomArray[0] % 3
  return roll === 0 // 1/3 chance = 33%
}
```

## Consequence Types

### 1. Monetary Consequences

**Process:**
1. Validates charity destination
2. Checks user's holding cell balance
3. Executes Stripe transfer to charity
4. Updates user balance
5. Creates audit record

**Error Handling:**
- Insufficient funds logged but doesn't fail entire process
- Stripe failures are retried
- Balance updates happen after successful transfer

### 2. Humiliation Email Consequences

**Process:**
1. Selects appropriate Kompromat (minor for checkpoints, major for final deadlines)
2. Randomly selects contact from consequence_targets
3. Sends dramatic email via SendGrid with Kompromat attachment
4. Creates audit record

**Email Content:**
- Official Soviet-style formatting
- "Great Dishonor" messaging
- Kompromat attachment (if file-based)
- Disclaimer about voluntary nature

## Database Schema Integration

### Key Tables

#### `consequences`
```sql
CREATE TABLE consequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checkpoint_id UUID REFERENCES checkpoints(id),
    goal_id UUID REFERENCES goals(id),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    consequence_type consequence_type_enum NOT NULL,
    monetary_amount DECIMAL(10,2),
    charity_destination charity_enum,
    kompromat_id UUID REFERENCES kompromat(id),
    target_contact_id UUID REFERENCES contacts(id),
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    executed_at TIMESTAMP WITH TIME ZONE,
    execution_status execution_status_enum DEFAULT 'pending',
    execution_details JSONB
);
```

#### Status Enums
```sql
CREATE TYPE execution_status_enum AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE consequence_type_enum AS ENUM ('monetary', 'humiliation_email', 'humiliation_social');
```

## Setup Instructions

### 1. Database Setup

```bash
# Apply migrations
psql -d your_database -f database/migrations/014_consequence_engine_setup.sql
psql -d your_database -f database/migrations/015_pg_cron_setup.sql
```

### 2. Enable pg_cron Extension

In Supabase Dashboard:
1. Go to Database > Extensions
2. Enable `pg_cron` extension
3. Verify with: `SELECT cron.schedule_in_database('test', '* * * * *', 'SELECT 1;', 'postgres');`

### 3. Environment Variables

Required in Supabase Edge Function environment:

```bash
# Stripe (for monetary consequences)
STRIPE_SECRET_KEY=sk_test_...

# SendGrid (for humiliation emails)
SENDGRID_API_KEY=SG.xyz...

# Supabase (automatically available)
SUPABASE_URL=https://xyz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service_role_key...
```

### 4. Deploy Edge Functions

```bash
# Deploy main consequence processor
supabase functions deploy triggerConsequence

# Deploy test utilities (optional)
supabase functions deploy testConsequences
```

### 5. Charity Account Configuration

Update `stripe-utils.ts` with real Stripe Connect account IDs:

```typescript
const CHARITY_ACCOUNTS = {
  'doctors_without_borders': 'acct_real_msf_id',
  'red_cross': 'acct_real_redcross_id',
  'unicef': 'acct_real_unicef_id'
}
```

## Testing

### 1. Manual Testing

```bash
# Test consequence detection
SELECT * FROM check_overdue_checkpoints();

# Test cron job status  
SELECT * FROM check_cron_job_status();

# Manual trigger
SELECT manual_consequence_trigger();
```

### 2. Edge Function Testing

Use the `testConsequences` Edge Function:

```javascript
// Test overdue checkpoint creation
await supabase.functions.invoke('testConsequences', {
  body: { 
    testType: 'create_overdue_checkpoint', 
    userId: 'user-uuid' 
  }
})

// Test Russian Roulette probability
await supabase.functions.invoke('testConsequences', {
  body: { testType: 'russian_roulette_test' }
})

// Test Stripe connection
await supabase.functions.invoke('testConsequences', {
  body: { testType: 'test_stripe_connection' }
})
```

### 3. Frontend Testing

```typescript
// Trigger test consequence in dashboard
const { triggerTestConsequence } = useConsequenceNotifications()
triggerTestConsequence()
```

## Monitoring and Logs

### Cron Job Monitoring

```sql
-- Check cron job execution history
SELECT * FROM cron.job_run_details 
WHERE jobname = 'consequence-processor' 
ORDER BY start_time DESC LIMIT 10;

-- Check for failed executions
SELECT * FROM cron.job_run_details 
WHERE jobname = 'consequence-processor' 
AND status = 'failed';
```

### Consequence Audit Trail

```sql
-- View all consequences
SELECT 
    c.*,
    g.title as goal_title,
    ch.title as checkpoint_title
FROM consequences c
LEFT JOIN goals g ON c.goal_id = g.id
LEFT JOIN checkpoints ch ON c.checkpoint_id = ch.id
ORDER BY c.triggered_at DESC;

-- Check execution success rates
SELECT 
    consequence_type,
    execution_status,
    COUNT(*) as count
FROM consequences 
GROUP BY consequence_type, execution_status;
```

### Edge Function Logs

Monitor in Supabase Dashboard > Functions > triggerConsequence > Logs

Key log messages:
- `Found X overdue item(s) to process`
- `Russian Roulette result: TRIGGERED/SPARED`
- `Stripe transfer successful: txn_id`
- `Humiliation email sent successfully: msg_id`

## Error Handling

### Common Issues

1. **pg_cron Not Running**
   - Check extension is enabled
   - Verify cron job is scheduled
   - Check database permissions

2. **Stripe Failures**
   - Verify API keys are correct
   - Check charity account IDs
   - Ensure sufficient balance in platform account

3. **SendGrid Failures**
   - Verify API key and sender email
   - Check attachment size limits
   - Verify recipient email format

4. **Missing Kompromat/Contacts**
   - System gracefully handles missing data
   - Fallback consequences are logged
   - Users are notified of configuration issues

### Error Recovery

The system is designed for fault tolerance:
- Failed consequences are retried on next cron run
- Partial failures (e.g., Stripe success but balance update fails) are logged
- Audit trail preserves all attempts for debugging

## Security Considerations

1. **API Keys**: All sensitive keys stored in Supabase Vault
2. **Service Role**: Edge Function uses service role for database access
3. **Kompromat Storage**: Files encrypted at rest in Supabase Storage
4. **Audit Trail**: Complete logging for accountability
5. **Rate Limiting**: Cron runs limited to prevent abuse

## Performance

- **Cron Frequency**: Every 5 minutes (configurable)
- **Batch Processing**: Processes all overdue items in single run
- **Indexing**: Optimized queries with proper indexes
- **Timeout Handling**: Edge Function has 60-second timeout

## Future Enhancements

1. **Social Media Integration**: Twitter/Facebook posting
2. **Advanced Targeting**: Time-zone aware processing  
3. **Escalation System**: Multiple consequence levels
4. **Analytics Dashboard**: Consequence effectiveness tracking
5. **User Appeals**: Contest system for disputed consequences

---

## Quick Reference

### Key Files
- `database/migrations/014_consequence_engine_setup.sql` - Database functions
- `database/migrations/015_pg_cron_setup.sql` - Cron job setup
- `supabase/functions/triggerConsequence/index.ts` - Main processor
- `src/components/dashboard/ConsequenceModal.tsx` - Frontend modal
- `src/hooks/useConsequenceNotifications.ts` - Real-time notifications

### Key Commands
- `SELECT check_overdue_checkpoints();` - Test detection
- `SELECT manual_consequence_trigger();` - Manual trigger
- `SELECT * FROM check_cron_job_status();` - Check cron status
- `supabase functions invoke triggerConsequence` - Test processor

### Support
For issues or questions, check the audit trail first:
```sql
SELECT * FROM consequences 
WHERE user_id = 'your-user-id' 
ORDER BY triggered_at DESC;
```