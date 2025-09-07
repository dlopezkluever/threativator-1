# Testing Guide: Consequence System

## 🚀 Quick Test Steps

### 1. **Verify Database Setup**

Run these queries in Supabase SQL Editor:

```sql
-- Check if cron job is scheduled
SELECT * FROM check_cron_job_status();

-- Test the overdue detection function
SELECT * FROM check_overdue_checkpoints();

-- Test manual trigger
SELECT manual_consequence_trigger();
```

### 2. **Create Test Data**

First, make sure you have some basic data:

```sql
-- Check if you have test data
SELECT id, title, final_deadline, status FROM goals WHERE user_id = auth.uid();
SELECT id, title, deadline, status FROM checkpoints;
```

If you need test data, create a goal through the UI first, then continue.

### 3. **Deploy Edge Functions**

```bash
# Deploy the consequence processor
supabase functions deploy triggerConsequence

# Deploy testing utilities  
supabase functions deploy testConsequences
```

### 4. **Environment Variables Setup**

In Supabase Dashboard > Edge Functions > Settings:

```bash
# For testing, you can use Stripe test keys
STRIPE_SECRET_KEY=sk_test_your_test_key_here

# For SendGrid testing (optional)
SENDGRID_API_KEY=SG.your_sendgrid_key_here
```

**Note:** For initial testing, the system will work without real API keys - it will simulate the actions.

## 🎯 Test Scenarios

### **Test 1: Create Overdue Checkpoint**

```bash
# Use the test Edge Function to create an overdue checkpoint
supabase functions invoke testConsequences --data '{
  "testType": "create_overdue_checkpoint",
  "userId": "your-user-id-here"
}'
```

### **Test 2: Test Russian Roulette Logic**

```bash
# Test the probability distribution (should be ~33%)
supabase functions invoke testConsequences --data '{
  "testType": "russian_roulette_test"
}'
```

### **Test 3: Manual Consequence Trigger**

```sql
-- In Supabase SQL Editor
SELECT manual_consequence_trigger();

-- Then check if any consequences were created
SELECT * FROM consequences ORDER BY triggered_at DESC LIMIT 5;
```

### **Test 4: Test API Connections**

```bash
# Test Stripe connection (if you have a key)
supabase functions invoke testConsequences --data '{
  "testType": "test_stripe_connection"
}'

# Test SendGrid connection (if you have a key)  
supabase functions invoke testConsequences --data '{
  "testType": "test_sendgrid_connection",
  "userId": "your-user-id"
}'
```

## 🔍 Monitoring & Debugging

### **Check System Status**

```sql
-- View all cron jobs
SELECT * FROM cron.job;

-- Check recent cron runs
SELECT * FROM check_recent_cron_runs();

-- View consequence audit trail
SELECT 
  c.*,
  g.title as goal_title
FROM consequences c
LEFT JOIN goals g ON c.goal_id = g.id
ORDER BY c.triggered_at DESC;
```

### **Check for Overdue Items**

```sql
-- See what the system would process
SELECT * FROM check_overdue_checkpoints();

-- Check checkpoint statuses
SELECT 
  c.title,
  c.deadline,
  c.status,
  g.title as goal_title
FROM checkpoints c
JOIN goals g ON c.goal_id = g.id
WHERE c.deadline < NOW() AND c.status = 'pending';
```

## 🎭 Frontend Testing

### **Test Consequence Modal**

1. Go to your dashboard at `/dashboard`
2. The consequence modal should automatically appear if there are new consequences
3. You can also trigger a test consequence by adding this to your dashboard:

```typescript
// Add this button temporarily to test the modal
<button onClick={() => {
  const testConsequence = {
    id: 'test-123',
    consequence_type: 'monetary',
    triggered_at: new Date().toISOString(),
    execution_status: 'completed',
    execution_details: {
      triggered: true,
      amount_transferred: 25.00,
      charity: 'doctors_without_borders'
    },
    goal_id: 'test-goal',
    monetary_amount: 25.00,
    failure_type: 'checkpoint'
  }
  // This would trigger the modal
}}>
  Test Consequence Modal
</button>
```

## ⚡ Real-Time Testing

### **Create a Real Overdue Scenario**

1. **Create a goal** through the UI with a checkpoint
2. **Manually update the deadline** to be in the past:

```sql
-- Find your latest checkpoint
SELECT id, title, deadline FROM checkpoints 
WHERE goal_id IN (SELECT id FROM goals WHERE user_id = auth.uid())
ORDER BY created_at DESC LIMIT 1;

-- Make it overdue (1 hour ago)
UPDATE checkpoints 
SET deadline = NOW() - INTERVAL '1 hour'
WHERE id = 'your-checkpoint-id-here';
```

3. **Wait for cron job** (runs every 5 minutes) OR trigger manually:

```sql
SELECT manual_consequence_trigger();
```

4. **Check for consequences**:

```sql
SELECT * FROM consequences WHERE user_id = auth.uid() ORDER BY triggered_at DESC;
```

## 🚨 Expected Behaviors

### **Russian Roulette Results:**
- **33% chance:** Consequence is triggered and executed
- **67% chance:** User is spared, but a record is still created

### **Checkpoint vs Final Deadline:**
- **Checkpoint failure:** 33% probability, uses minor kompromat
- **Final deadline failure:** 100% probability, uses major kompromat

### **Error Handling:**
- Missing API keys → System logs error but continues
- Insufficient funds → Logged but system doesn't crash
- Missing kompromat → Graceful fallback with error logging

## 🔧 Troubleshooting

### **No consequences triggered?**
1. Check if pg_cron is running: `SELECT * FROM cron.job;`
2. Verify overdue items exist: `SELECT * FROM check_overdue_checkpoints();`
3. Check Edge Function logs in Supabase Dashboard

### **Modal not appearing?**
1. Check browser console for JavaScript errors
2. Verify real-time subscriptions are working
3. Check if consequences table has new records

### **API errors?**
1. Verify environment variables are set
2. Check API key permissions
3. Review Edge Function logs for specific errors

## 📊 Success Indicators

✅ **Database Working:** `check_overdue_checkpoints()` returns data when items are overdue

✅ **Cron Job Active:** `check_cron_job_status()` shows job is scheduled and active

✅ **Russian Roulette:** Test shows ~33% trigger rate over 1000 trials

✅ **Consequences Created:** Records appear in `consequences` table

✅ **Frontend Alerts:** Modal appears automatically when consequences are triggered

✅ **API Integration:** Stripe/SendGrid connections succeed (if keys provided)

---

**Need help?** Check the audit trail first:
```sql
SELECT * FROM consequences WHERE user_id = auth.uid() ORDER BY triggered_at DESC;
```