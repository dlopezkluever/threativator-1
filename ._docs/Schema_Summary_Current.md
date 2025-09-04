# 📋 Current Database Schema Summary

## 🎯 **Active Schema Status**

**Migration Files Applied:**
- ✅ `004_schema_cleanup.sql` - Dropped problematic tables
- ✅ `009_complete_reset.sql` - Fresh schema creation
- ✅ `011_metadata_functions_only.sql` - User metadata functions  
- ✅ `013_simple_fixes.sql` - Priority column + storage bucket
- ✅ **Storage Policies** - Fixed via Supabase Dashboard UI

---

## 🗄️ **Active Database Tables**

### **Core Tables (6 Total)**

#### **1. `kompromat`**
```sql
CREATE TABLE kompromat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size_bytes INTEGER,
    severity kompromat_severity NOT NULL, -- 'minor' | 'major'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- **Status:** ✅ Working with file uploads
- **RLS Policy:** `auth.uid() = user_id`

#### **2. `contacts`**
```sql
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    roles contact_role[] NOT NULL DEFAULT '{}', -- witness | consequence_target
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- **Status:** ✅ Working with contact creation
- **RLS Policy:** `auth.uid() = user_id`

#### **3. `goals`**
```sql
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    final_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    grading_rubric TEXT NOT NULL,
    referee_type grading_type NOT NULL DEFAULT 'ai', -- 'ai' | 'human_witness'
    witness_contact_id UUID REFERENCES contacts(id),
    monetary_stake DECIMAL(10,2) DEFAULT 0.00, -- NOW OPTIONAL
    charity_destination charity_enum, -- 'doctors_without_borders' | 'red_cross' | 'unicef'
    minor_kompromat_id UUID REFERENCES kompromat(id),
    major_kompromat_id UUID REFERENCES kompromat(id),
    priority TEXT DEFAULT 'medium', -- Added for calendar compatibility
    status goal_status DEFAULT 'active', -- 'active' | 'completed' | 'failed' | 'paused'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);
```
- **Status:** ✅ Working with goal creation (monetary stakes optional)
- **RLS Policy:** `auth.uid() = user_id`

#### **4. `checkpoints`**
```sql
CREATE TABLE checkpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    order_position INTEGER NOT NULL,
    requirements TEXT,
    status checkpoint_status DEFAULT 'pending', -- 'pending' | 'submitted' | 'passed' | 'failed' | 'overdue'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);
```
- **Status:** ✅ Working with goal creation, appears on calendar
- **RLS Policy:** Via goal ownership check

#### **5. `submissions`**
```sql
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checkpoint_id UUID NOT NULL REFERENCES checkpoints(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    submission_type submission_type_enum NOT NULL, -- 'file_upload' | 'external_url' | 'text_description'
    file_path TEXT,
    external_url TEXT,
    description TEXT,
    ai_analysis_result JSONB,
    human_verdict verdict_enum, -- 'pass' | 'fail'
    feedback_text TEXT,
    confidence_score DECIMAL(3,2),
    status submission_status DEFAULT 'pending', -- 'pending' | 'grading' | 'passed' | 'failed' | 'contested'
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    graded_at TIMESTAMP WITH TIME ZONE
);
```
- **Status:** ⏳ Ready for submission system development
- **RLS Policy:** `auth.uid() = user_id`

#### **6. `consequences`**
```sql
CREATE TABLE consequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checkpoint_id UUID REFERENCES checkpoints(id),
    goal_id UUID REFERENCES goals(id),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    consequence_type consequence_type_enum NOT NULL, -- 'monetary' | 'humiliation_email' | 'humiliation_social'
    monetary_amount DECIMAL(10,2),
    charity_destination charity_enum,
    kompromat_id UUID REFERENCES kompromat(id),
    target_contact_id UUID REFERENCES contacts(id),
    social_platform TEXT,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    executed_at TIMESTAMP WITH TIME ZONE,
    execution_status execution_status_enum DEFAULT 'pending', -- 'pending' | 'completed' | 'failed'
    execution_details JSONB
);
```
- **Status:** ⏳ Ready for Russian Roulette system development
- **RLS Policy:** Read-only for users, service role manages execution

---

## 🔐 **Authentication & User Data**

### **Primary Identity: `auth.users` (Supabase Native)**
- **User ID:** `auth.uid()` used throughout all RLS policies
- **Email:** `auth.users.email` 
- **Metadata Storage:** `auth.users.raw_user_meta_data`

### **User Metadata Fields:**
```jsonb
{
  "holding_cell_balance": 0.00,           -- Financial collateral
  "onboarding_completed": false,          -- Onboarding status
  "twitter_access_token": "...",          -- Social integration
  "twitter_refresh_token": "...",         -- Social integration  
  "twitter_username": "@username"         -- Social integration
}
```

### **Helper Functions:**
- `increment_balance(user_id, amount)` - Updates balance in metadata
- `set_onboarding_completed(user_id, completed)` - Marks onboarding status
- `update_social_tokens(user_id, ...)` - Manages social media tokens

---

## 🗂️ **Storage Configuration**

### **Kompromat Storage Bucket**
- **Bucket Name:** `kompromat`
- **Path Structure:** `users/{user_id}/kompromat/{timestamp}_{filename}`
- **File Limits:** 10MB max, specific MIME types
- **RLS Policies:** Users can manage files in their own folder (`[2]` array index)

**Allowed File Types:**
- Images: `image/jpeg`, `image/png`, `image/gif`
- Videos: `video/mp4`, `video/mov`  
- Documents: `application/pdf`

---

## 🚫 **Removed/Deprecated Tables**

These tables were **dropped** and are **not active:**
- ❌ `users` (custom table) - Replaced by `auth.users`
- ❌ `teams` - Deferred to post-MVP
- ❌ `team_members` - Deferred to post-MVP
- ❌ `notification_preferences` - Using defaults
- ❌ `audit_log` - Simplified for MVP

---

## 📋 **ENUM Types in Use**

```sql
-- Goal and checkpoint statuses
CREATE TYPE goal_status AS ENUM ('active', 'completed', 'failed', 'paused');
CREATE TYPE checkpoint_status AS ENUM ('pending', 'submitted', 'passed', 'failed', 'overdue');

-- Submission system
CREATE TYPE submission_status AS ENUM ('pending', 'grading', 'passed', 'failed', 'contested');
CREATE TYPE submission_type_enum AS ENUM ('file_upload', 'external_url', 'text_description');
CREATE TYPE verdict_enum AS ENUM ('pass', 'fail');

-- Accountability system
CREATE TYPE kompromat_severity AS ENUM ('minor', 'major');
CREATE TYPE contact_role AS ENUM ('witness', 'consequence_target');

-- Consequences system
CREATE TYPE consequence_type_enum AS ENUM ('monetary', 'humiliation_email', 'humiliation_social');
CREATE TYPE execution_status_enum AS ENUM ('pending', 'completed', 'failed');

-- Other
CREATE TYPE grading_type AS ENUM ('ai', 'human_witness');
CREATE TYPE charity_enum AS ENUM ('doctors_without_borders', 'red_cross', 'unicef');
```

---

## ✅ **Current Functionality Status**

### **Working Features:**
- ✅ **Authentication** - Supabase Auth with session management
- ✅ **Kompromat Upload** - File storage with RLS policies
- ✅ **Contact Management** - Add/edit witness contacts
- ✅ **Goal Creation** - Create goals without monetary requirements
- ✅ **Checkpoint System** - Milestones appear on calendar
- ✅ **Dashboard** - Loads without database errors

### **Expected Issues (Normal):**
- ⚠️ **Payment System** - Missing Stripe Edge Function (separate service needed)
- ⚠️ **Submission System** - Ready for development but not implemented
- ⚠️ **Russian Roulette** - Consequence execution system ready but not implemented
- ⚠️ **Immediate Directives** - Sidebar needs separate query logic

---

## 🎯 **Key Architecture Decisions**

1. **Single User Identity:** Only `auth.users`, no custom user tables
2. **Metadata Storage:** User data in `raw_user_meta_data` instead of separate fields
3. **Optional Stakes:** Monetary requirements removed, kompromat is primary accountability
4. **Simple RLS:** Basic `auth.uid() = user_id` patterns, no complex joins
5. **6-Table Schema:** Essential functionality only, team features deferred
6. **Storage Policies:** Managed via Dashboard UI, not SQL migrations

This simplified architecture provides a **solid foundation for MVP development** while eliminating the RLS policy conflicts that were blocking progress.