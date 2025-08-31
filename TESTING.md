# Testing Guide for Threativator Onboarding

## 🚀 Quick Start

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Visit:** `http://localhost:5174`

## 🧪 Test Scenarios

### Authentication & Onboarding Flow

#### 1. New User Journey
```
http://localhost:5174 
→ Signup (/signup)
→ Email verification
→ Login (/login) 
→ Onboarding (/onboarding)
→ Dashboard (/dashboard)
```

#### 2. Returning User Journey
```
http://localhost:5174
→ Login (/login)
→ Dashboard (/dashboard) [if onboarding complete]
→ Onboarding (/onboarding) [if onboarding incomplete]
```

### Onboarding Steps Testing

#### Step 1: Payment Setup 💳
**Required:** Stripe test keys in `.env`
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Test Cards:**
- ✅ Success: `4242424242424242`
- ❌ Decline: `4000000000000002`
- ⚠️  3D Secure: `4000000000003220`
- 💳 Insufficient funds: `4000000000009995`

**Expected Results:**
- Customer created in Stripe
- `stripe_customer_id` saved to user profile
- Progress to step 2

#### Step 2: Kompromat Upload 📁
**Test Files:**
- ✅ Valid image: JPG, PNG, GIF < 50MB
- ✅ Valid video: MP4, MOV, AVI < 50MB
- ❌ Invalid type: PDF, TXT, DOC
- ❌ Too large: >50MB file

**Test Actions:**
- Drag and drop files
- Select files via button
- Set severity levels (minor/major)
- Add descriptions
- Remove files
- Skip step

**Expected Results:**
- Files uploaded to Supabase Storage bucket `kompromat`
- Records created in `kompromat` table
- Progress to step 3

#### Step 3: Contact Management 👥
**Test Data:**
- ✅ Valid email: `test@example.com`
- ❌ Invalid email: `invalid-email`
- ✅ Valid name: `John Doe`

**Test Actions:**
- Add multiple contacts
- Select roles: witness, consequence_target
- Test duplicate email prevention
- Remove contacts
- Skip step

**Expected Results:**
- Records created in `contacts` table
- Roles properly assigned
- Progress to step 4

#### Step 4: Social Media 🐦
**Optional Setup:** Twitter OAuth
```bash
VITE_TWITTER_CLIENT_ID=your_client_id
```

**Test Actions:**
- Connect Twitter (if configured)
- Skip step
- Complete onboarding

**Expected Results:**
- `onboarding_completed = true` in user profile
- Redirect to dashboard
- Success toast message

## 🔍 Database Verification

Check Supabase dashboard tables:

### `users` table
- `stripe_customer_id` populated
- `onboarding_completed = true`
- `twitter_username` (if connected)

### `kompromat` table
- Files with correct `user_id`
- Proper `severity` levels
- Valid `file_path` references

### `contacts` table
- Contacts with correct `user_id`
- Proper `roles` arrays
- Valid email addresses

### Storage bucket `kompromat`
- Files uploaded to user-specific folders
- Proper file permissions (RLS)

## 🚨 Error Testing

### Network Issues
1. Disconnect internet during upload
2. Slow network simulation
3. Check retry mechanisms

### Invalid Data
1. Submit forms with missing required fields
2. Use invalid file types
3. Test malformed email addresses

### Browser Issues
1. Refresh during onboarding
2. Navigate away and return
3. Close browser tab

## 📱 Responsive Testing

Test layouts on:
- Desktop: 1920x1080, 1366x768
- Tablet: 1024x768, 768x1024
- Mobile: 375x667, 414x896

## 🎯 Accessibility Testing

1. **Keyboard Navigation:**
   - Tab through all form elements
   - Use Enter to submit forms
   - Use Space to toggle checkboxes

2. **Screen Reader:**
   - Test with browser screen reader
   - Check ARIA labels
   - Verify form field labels

## 🐛 Common Issues & Solutions

### "Stripe not configured"
- Add `VITE_STRIPE_PUBLISHABLE_KEY` to `.env`
- Restart dev server

### "File upload failed"
- Check Supabase Storage bucket exists
- Verify RLS policies are set up
- Check file size and type restrictions

### "Social media connection failed"
- Add `VITE_TWITTER_CLIENT_ID` to `.env`
- Ensure Twitter OAuth app is configured
- Check redirect URI matches

### "Database error"
- Verify Supabase connection
- Check table schemas match TypeScript types
- Ensure RLS policies allow operations

## 📊 Success Criteria

✅ User can complete entire onboarding flow
✅ All data is properly saved to database  
✅ Error handling works for all failure cases
✅ UI is responsive on all screen sizes
✅ No TypeScript or console errors
✅ Toast notifications appear correctly
✅ Navigation prevents leaving incomplete onboarding