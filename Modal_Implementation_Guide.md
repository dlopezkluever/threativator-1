# Modal Implementation Guide - Threativator Dashboard Management

## Overview

This document outlines the critical functionality gap in the Threativator application and provides a detailed implementation plan for resolving it through modal-based management interfaces.

## Current Problem

### Context
The Threativator application originally included a mandatory onboarding wizard that collected essential user data required for goal creation. However, this onboarding system was **completely removed** due to authentication issues it was causing. The removal of onboarding has created a functional gap that prevents users from utilizing core application features.

### Specific Issues
1. **Blocked Goal Creation**: Users cannot create goals because the goal creation wizard validates for required data that users have no way to provide:
   - Holding cell balance (monetary stakes)
   - Kompromat files (consequence content)
   - Witness contacts (for human grading)

2. **Non-functional Dashboard Buttons**: The dashboard contains management buttons that currently do nothing:
   - "ESTABLISH COLLATERAL" → No payment interface
   - "KOMPROMAT" → No file upload interface
   - "CONTACTS" → No contact management interface
   - Social media integration buttons → No OAuth flow

3. **Database Requirements**: The goal creation process specifically requires:
   - `users.holding_cell_balance > 0` for monetary stakes
   - Records in `kompromat` table for consequence assignment
   - Records in `contacts` table with `roles` containing 'witness' for human grading

## Solution: Large Modal Components

### Approach Rationale
- **Simpler Implementation**: No routing, page management, or navigation complexity
- **Better UX**: Immediate access from dashboard, no context switching
- **Consistent with App Design**: Maintains dashboard-centric workflow
- **Responsive**: Can be full-screen on mobile, large overlay on desktop

### Technical Architecture
- Large modals (80% screen width, 90% height on desktop)
- Full-screen presentation on mobile devices
- Modal state management through React context or local state
- Integration with existing Supabase backend and authentication

## Reference Materials

### Existing Onboarding Components (For Logic Reference Only)
**⚠️ IMPORTANT**: The following files contain working implementations that should be referenced for business logic, API calls, and validation patterns. However, **DO NOT build any onboarding functionality** - these are purely for extracting reusable patterns.

Located in: `src/components/onboarding/`
- `StripePaymentStep.tsx` - Stripe Elements integration, balance management
- `KompromatUploadStep.tsx` - File upload to Supabase Storage, severity classification
- `ContactManagementStep.tsx` - Contact CRUD operations, role assignment
- `SocialMediaStep.tsx` - Twitter OAuth integration

**Key Reference Patterns:**
- Supabase Storage file upload implementation
- Stripe Elements setup and payment processing
- Form validation and error handling
- Database transaction patterns
- File type/size validation logic

## Detailed Implementation Plan

### Phase 1: Core Infrastructure

#### Task 1.1: Modal Component Foundation
**File**: `src/components/modals/BaseModal.tsx`
- Create reusable modal wrapper component
- Implement backdrop click handling and ESC key support
- Add responsive sizing (large desktop, full-screen mobile)
- Include proper ARIA attributes for accessibility
- Style according to Soviet theme guide (thick black borders, beige backgrounds)

#### Task 1.2: Modal State Management
**File**: `src/hooks/useModalState.tsx`
- Create custom hook for managing modal open/close states
- Handle multiple modals (ensure only one open at a time)
- Provide consistent modal management across dashboard

### Phase 2: Payment Management Modal

#### Task 2.1: Payment Modal Component
**File**: `src/components/modals/PaymentModal.tsx`
**Reference**: `StripePaymentStep.tsx` (lines 45-180 for Stripe setup)

**Requirements:**
- Display current holding cell balance prominently
- Integrate Stripe Elements for secure payment processing
- Add predefined amount buttons ($25, $50, $100, $200, Custom)
- Custom amount input with validation (minimum $5, maximum $500)
- Show transaction history in collapsible section
- Success/error feedback with Soviet-themed notifications

**Key Features:**
- Real-time balance updates after successful payment
- Payment method selection (card only for MVP)
- Transaction receipt display
- Integration with existing `users.holding_cell_balance` field

**Database Operations:**
```sql
-- Update user balance after successful payment
UPDATE users 
SET holding_cell_balance = holding_cell_balance + :amount 
WHERE id = :user_id;

-- Insert transaction record (optional for tracking)
INSERT INTO transactions (user_id, amount, type, status, stripe_payment_intent_id)
VALUES (:user_id, :amount, 'deposit', 'completed', :payment_intent_id);
```

#### Task 2.2: Stripe Integration Setup
**Reference**: `StripePaymentStep.tsx` (lines 20-44 for Stripe configuration)
- Configure Stripe Elements with existing publishable key
- Implement payment intent creation through Supabase Edge Function
- Handle 3D Secure authentication flows
- Add proper error handling for declined cards, network issues

### Phase 3: Kompromat Management Modal

#### Task 3.1: Kompromat Modal Component  
**File**: `src/components/modals/KompromatModal.tsx`
**Reference**: `KompromatUploadStep.tsx` (entire file for upload logic)

**Requirements:**
- File upload drag-and-drop zone using `react-dropzone`
- File type validation (images: jpg/png/gif, videos: mp4/mov, documents: pdf)
- File size limit enforcement (10MB maximum)
- Severity selection (Minor for checkpoints, Major for final deadlines)
- File preview thumbnails for images, icons for other types
- Upload progress indicator with percentage
- Existing files management (view, delete, change severity)

**File Upload Implementation:**
```typescript
// Supabase Storage path pattern
const filePath = `users/${user.id}/kompromat/${Date.now()}_${file.name}`;

// Upload to 'kompromat' bucket
const { data, error } = await supabase.storage
  .from('kompromat')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: false
  });
```

**Database Schema Integration:**
- Insert records into `kompromat` table with proper fields
- Link to user through `user_id` foreign key
- Store Supabase Storage URL in `file_path` field

#### Task 3.2: File Management Interface
- Grid/list view toggle for existing kompromat
- Bulk selection for deleting multiple files
- Severity editing (change minor to major, vice versa)
- File replacement functionality
- Storage usage indicator

### Phase 4: Contact Management Modal

#### Task 4.1: Contact Modal Component
**File**: `src/components/modals/ContactModal.tsx`  
**Reference**: `ContactManagementStep.tsx` (entire file for CRUD operations)

**Requirements:**
- Add contact form with name, email, roles selection
- Email validation (proper format, uniqueness per user)
- Role selection checkboxes (Witness, Consequence Target)
- Contact list with search/filter functionality
- Inline editing for existing contacts
- Delete confirmation dialog
- Import from device contacts (future enhancement)

**Contact Roles:**
- **Witness**: Can grade submissions for human-witness goals
- **Consequence Target**: Receives kompromat if user fails goals
- **Both**: Contact can serve in both capacities

**Database Operations:**
```sql
-- Insert new contact
INSERT INTO contacts (user_id, name, email, roles, verified)
VALUES (:user_id, :name, :email, ARRAY[:roles], false);

-- Update contact roles
UPDATE contacts 
SET roles = ARRAY[:new_roles], updated_at = NOW()
WHERE id = :contact_id AND user_id = :user_id;
```

#### Task 4.2: Contact Verification System (Future)
- Email verification flow for added contacts
- Verification status indicators
- Resend verification functionality

### Phase 5: Social Media Integration Modal

#### Task 5.1: Social Media Modal Component
**File**: `src/components/modals/SocialMediaModal.tsx`
**Reference**: `SocialMediaStep.tsx` (OAuth implementation)

**Requirements:**
- Twitter OAuth 2.0 integration using existing flow
- Connected accounts display with profile information
- Disconnect functionality with confirmation
- Account status indicators (connected, expired, error)
- Scope permissions explanation

**Twitter Integration Points:**
- OAuth callback handling through existing `/auth/twitter/callback` route
- Token storage in `users.twitter_access_token` and `twitter_refresh_token`
- Username display from `users.twitter_username`

### Phase 6: Dashboard Integration

#### Task 6.1: Wire Dashboard Buttons
**File**: `src/components/dashboard/DashboardLayout.tsx`

**Update Button Handlers:**
```typescript
const handleEstablishCollateral = () => setPaymentModalOpen(true);
const handleUploadKompromat = () => setKompromatModalOpen(true);
const handleRecruitContacts = () => setContactModalOpen(true);
const handleSocialMedia = () => setSocialModalOpen(true);
```

#### Task 6.2: Modal State Management in Dashboard
- Add state variables for each modal's open/close status
- Ensure proper cleanup and reset on modal close
- Handle modal layering (prevent multiple modals open simultaneously)

#### Task 6.3: Data Refresh Integration
- Refresh relevant data after modal operations complete
- Update dashboard displays (balance, counts) in real-time
- Integrate with existing `GoalProvider` context for data consistency

## Testing Requirements

### Unit Tests
- Modal open/close behavior
- Form validation logic
- File upload constraints
- Payment processing flows

### Integration Tests  
- Stripe payment end-to-end
- Supabase Storage upload/download
- Database transaction consistency
- OAuth flow completion

### User Acceptance Testing
- Goal creation with newly added data (balance, kompromat, contacts)
- Modal UX on different screen sizes
- Error handling and recovery flows
- Data persistence across sessions

## Security Considerations

### Payment Security
- Never store payment details client-side
- Use Stripe Elements for PCI compliance
- Validate amounts server-side
- Implement rate limiting on payment attempts

### File Upload Security
- Server-side file type validation
- Virus scanning (future enhancement)
- Storage access control through Supabase RLS
- File size limits to prevent abuse

### Contact Privacy
- Contact data encrypted at rest
- Access control through user_id foreign keys
- Email validation to prevent spam

## Success Criteria

### Functional Requirements
✅ Users can add funds to holding cell balance
✅ Users can upload kompromat files with severity assignment  
✅ Users can manage witness and consequence contacts
✅ Users can connect social media accounts
✅ Goal creation validation passes with proper data setup
✅ All modals follow Soviet theme design requirements

### Performance Requirements
- Modal open/close animations < 300ms
- File uploads show progress feedback
- Payment processing feedback within 5 seconds
- Contact list loads < 1 second for up to 100 contacts

### UX Requirements
- Intuitive modal navigation
- Clear error messages and validation feedback
- Consistent styling with dashboard theme
- Mobile-responsive modal layouts

## Implementation Timeline

### Week 1: Infrastructure
- Base modal component and hooks
- Dashboard button integration

### Week 2: Payment Modal
- Stripe integration
- Balance management  
- Transaction handling

### Week 3: Kompromat Modal
- File upload implementation
- Storage integration
- File management interface

### Week 4: Contact Modal  
- Contact CRUD operations
- Verification system setup

### Week 5: Social Media & Polish
- Twitter OAuth integration
- End-to-end testing
- Bug fixes and UX improvements

## Dependencies

### External Services
- Stripe Elements SDK (already integrated)
- Supabase Storage (configured)
- Twitter OAuth API (credentials configured)

### Internal Dependencies
- `GoalProvider` context for data consistency
- Existing authentication system
- Soviet theme styling variables and components
- Supabase client configuration

## Notes for New Developers

1. **No Onboarding**: Do not build any onboarding functionality. Reference the old files for logic patterns only.

2. **Theme Consistency**: Follow the Soviet Constructivist design guide exactly - thick black borders, beige backgrounds, Stalinist One font for headers.

3. **Database Schema**: The database schema is already complete. Focus on UI components and API integration.

4. **Error Handling**: Follow existing patterns in the codebase for user-friendly error messages with Soviet-themed language.

5. **Testing**: Test goal creation end-to-end after implementing each modal to ensure the validation blocking is resolved.

6. **State Management**: Use the existing `GoalProvider` context for consistency. Don't create parallel data management systems.

This document should serve as a complete specification for resolving the current functionality gap and enabling full goal creation capabilities.