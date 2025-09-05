# 🚩 Schema Redux: Database Simplification Plan

## 🔍 **Current Problem Analysis**

### **Core Issues Identified:**
1. **RLS Policy Conflicts** - `StorageApiError: new row violates row-level security policy`
2. **Duplicate User Systems** - Both `auth.users` and custom `users` table causing sync issues
3. **Over-Complex Schema** - 11 tables with interdependent policies causing recursion errors
4. **Team Feature Blocking MVP** - Complex team policies preventing basic functionality
5. **Modal Upload Failures** - Backend complexity preventing simple file uploads

### **Root Cause:**
We're fighting Supabase's natural patterns instead of leveraging them. The authentication system expects `auth.uid()` references, but we created a parallel user management system.

---

## 🎯 **Solution Summary**

### **Philosophy: Work WITH Supabase, Not Against It**
- **Embrace `auth.users`** as the single source of user identity
- **Simplify RLS policies** to basic `auth.uid() = user_id` patterns
- **Defer complex features** (teams, detailed audit trails) to post-MVP
- **Focus on core value** - kompromat-driven accountability

### **6-Table Simplified Architecture:**
```
1. kompromat          → auth.users.id (direct reference)
2. contacts           → auth.users.id (direct reference) 
3. goals              → auth.users.id (direct reference)
4. checkpoints        → goals.id (child records)
5. submissions        → checkpoints.id + auth.users.id
6. consequences       → goals.id + auth.users.id (Russian Roulette tracking)
```

### **User Data Strategy:**
- **Primary Identity**: `auth.users` (Supabase native)
- **Financial Data**: Store in `auth.users.raw_user_meta_data.holding_cell_balance`
- **Social Tokens**: Store in `auth.users.raw_user_meta_data.twitter_*`
- **Onboarding Status**: Store in `auth.users.raw_user_meta_data.onboarding_completed`

---

## 📋 **Comprehensive Task List**

### **Phase 1: Database Schema Cleanup** ⏱️ *30-45 minutes*

#### **Task 1.1: Drop Problematic Tables**
- [ ] Drop `teams` table (causing RLS recursion)
- [ ] Drop `team_members` table (causing RLS recursion)
- [ ] Drop custom `users` table (duplicate system)
- [ ] Drop `notification_preferences` table (use defaults)
- [ ] Drop `audit_log` table (nice-to-have, not critical)

#### **Task 1.2: Clean RLS Policies**
- [ ] Remove all team-related RLS policies
- [ ] Remove custom users table policies
- [ ] Simplify storage policies to use `auth.uid()` directly
- [ ] Test that basic auth queries work

#### **Task 1.3: Create Minimal Schema**
- [ ] Create simplified `kompromat` table (references `auth.users.id`)
- [ ] Create simplified `contacts` table (references `auth.users.id`)
- [ ] Create simplified `goals` table (references `auth.users.id`)
- [ ] Create `checkpoints` table (child of goals)
- [ ] Create `submissions` table (proof uploads)
- [ ] Create `consequences` table (Russian Roulette tracking)

#### **Task 1.4: Simple RLS Policies**
- [ ] Create basic kompromat policies (`auth.uid() = user_id`)
- [ ] Create basic contacts policies (`auth.uid() = user_id`)
- [ ] Create basic goals policies (`auth.uid() = user_id`)
- [ ] Create checkpoint policies (via goal ownership)
- [ ] Create submission policies (via checkpoint ownership)
- [ ] Create consequence policies (read-only for users)

---

### **Phase 2: Application Code Updates** ⏱️ *45-60 minutes*

#### **Task 2.1: Update User Data Management**
- [ ] Remove all references to custom `users` table
- [ ] Update `VisibleStakesDisplay` to use `auth.users.raw_user_meta_data`
- [ ] Update `PaymentModal` to store balance in `raw_user_meta_data`
- [ ] Remove `initializeUserProfile` utility (no longer needed)
- [ ] Update all user queries to use `auth.users` directly

#### **Task 2.2: Fix Modal Functionality**
- [ ] Update KompromatModal to use `auth.uid()` directly
- [ ] Remove demo mode localStorage functionality
- [ ] Test file upload with simplified RLS policies
- [ ] Verify existing file display works
- [ ] Test file deletion functionality

#### **Task 2.3: Update Goal Creation Flow**
- [ ] Remove monetary collateral requirements from goal validation
- [ ] Make kompromat the primary accountability mechanism
- [ ] Update goal creation wizard to work without balance checks
- [ ] Ensure goals can be created with just kompromat + contacts

#### **Task 2.4: Update Dashboard Components**
- [ ] Fix `QuickActionsPanel` to work without custom users table
- [ ] Update `DashboardLayout` goal creation validation
- [ ] Remove user profile initialization logic
- [ ] Test that all dashboard components load without errors

---

### **Phase 3: Feature Deactivation** ⏱️ *15-30 minutes*

#### **Task 3.1: Deactivate Team Features**
- [ ] Comment out team-related imports and components
- [ ] Remove team creation UI elements
- [ ] Update goal creation to be individual-only
- [ ] Add "Team Goals - Coming Soon" placeholder

#### **Task 3.2: Make Monetary Stakes Optional**
- [ ] Update goal creation validation to not require balance
- [ ] Keep PaymentModal functional but non-mandatory
- [ ] Add UI indicators that money stakes are optional
- [ ] Focus validation on kompromat + contacts only

---

### **Phase 4: Testing & Validation** ⏱️ *30 minutes*

#### **Task 4.1: Core Flow Testing**
- [ ] Test kompromat upload/delete (primary accountability)
- [ ] Test contact management (witness system)
- [ ] Test goal creation without monetary requirements
- [ ] Verify dashboard loads without database errors

#### **Task 4.2: Integration Testing**  
- [ ] Test complete goal creation → submission → grading flow
- [ ] Verify Russian Roulette consequence system works
- [ ] Test that kompromat can be assigned to goals
- [ ] Confirm no more RLS policy conflicts

---

## 🎯 **Success Criteria**

### **Immediate Goals:**
- [ ] **Zero database errors** in browser console
- [ ] **Kompromat upload works** with real Supabase storage  
- [ ] **Goal creation works** without monetary requirements
- [ ] **Dashboard loads cleanly** without 400/500 errors

### **Architecture Goals:**
- [ ] **Single user identity** - Only `auth.users`, no custom tables
- [ ] **Simple RLS policies** - Basic ownership patterns, no complex joins
- [ ] **6-table schema** - Essential functionality only
- [ ] **Deferred complexity** - Teams marked as post-MVP stretch goal

---

## 🚨 **Risk Assessment**

### **Low Risk Changes:**
- Dropping team tables (not implemented in UI yet)
- Using auth.users metadata for balance/tokens
- Simplifying RLS policies

### **Medium Risk Changes:**
- Modifying existing goal creation flow
- Updating user data references across components

### **Mitigation Strategy:**
- Make changes incrementally
- Test each phase before proceeding
- Keep PaymentModal functional for future use
- Document all changes for easy rollback

---

## 🎯 **Expected Outcomes**

After implementing this plan:
- **✅ Kompromat modal works** with real file uploads
- **✅ Goal creation works** without complex validation 
- **✅ Dashboard loads cleanly** without database errors
- **✅ Russian Roulette system** can be implemented cleanly
- **✅ Foundation set** for rapid MVP development

The simplified architecture will be **much easier to debug, maintain, and extend** while providing all core Threativator functionality.

---

*This plan transforms our over-engineered database into a lean, functional MVP foundation that works with Supabase's natural patterns rather than against them.*