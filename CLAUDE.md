# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Threativator** (officially "KOMPROMATOR - State Discipline Network") is a Soviet Constructivist-themed accountability web application that combats procrastination through negative reinforcement - financial stakes and "Kompromat" consequences. Built with React + TypeScript + Vite, integrated with Supabase for backend services.

### Current Status: **70% COMPLETED - 7 of 10 Tasks Complete ✅**

**COMPLETED SYSTEMS:**
- ✅ **Task 1: Authentication System** - Complete Supabase auth with signup/login/password reset
- ✅ **Task 2: Onboarding Wizard** - Stripe payment setup, Kompromat upload, contacts, Twitter OAuth
- ✅ **Task 3: Main Dashboard** - Soviet-themed dashboard with calendar, stakes display, quick actions
- ✅ **Task 4: Goal Creation Flow** - Multi-step goal creation with AI checkpoint suggestions
- ✅ **Task 5: Submission System** - File upload, URL submission, text descriptions with real-time status
- ✅ **Task 6: AI Grading System** - Gemini API integration with automatic submission evaluation
- ✅ **Task 7: Consequence Engine** - Automated deadline enforcement with Russian Roulette probability

**PENDING SYSTEMS:**
- 🔄 **Task 8: Twitter Integration** - Social media OAuth for Major Kompromat consequences
- 🔄 **Task 9: Notification System** - SendGrid email notifications for deadlines and results
- 🔄 **Task 10: UI Polish** - Soviet Constructivist design system refinement

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)  
- `npm run lint` - Run ESLint on all files
- `npm run preview` - Preview production build locally
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Complete Architecture Overview

### **Frontend Stack**
- **Build System**: Vite with React plugin and HMR
- **Framework**: React 18 with TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with Soviet Constructivist design tokens
- **Routing**: React Router v7 with protected routes and onboarding enforcement
- **State Management**: React Context API (Auth, Goals, Toast notifications)
- **UI Components**: Custom Soviet-themed components with shadcn/ui patterns
- **Icons**: Lucide React icons with Soviet star symbols

### **Backend Services**
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security)
- **File Storage**: Supabase Storage for Kompromat files and submission proof
- **Real-time**: Supabase subscriptions for live consequence notifications
- **Email**: Supabase Auth emails + SendGrid for consequence notifications
- **Payment**: Stripe Elements integration with SetupIntent for holding cell deposits
- **AI Processing**: Google Gemini API for submission grading and checkpoint generation
- **Automation**: PostgreSQL pg_cron + Supabase Edge Functions for consequence enforcement

### **Key Dependencies**
- `@supabase/supabase-js` (v2.56.1) - Backend integration with real-time subscriptions
- `react-router-dom` (v7.8.2) - Client-side routing with protected routes
- `tailwindcss` (v4.1.12) - Utility-first CSS with custom design tokens
- `@stripe/react-stripe-js` (v3.9.2) - Payment method collection
- `react-big-calendar` (v1.19.4) - Calendar component for goal/checkpoint visualization
- `react-dropzone` (v14.3.8) - Drag-and-drop file uploads
- `class-variance-authority` (v0.7.1) - Component variant management
- `moment` (v2.30.1) - Date manipulation for deadlines
- `uuid` (v11.1.0) - Unique ID generation

## Complete Project Structure

```
src/
├── components/
│   ├── auth/                         # Authentication System (Task 1) ✅
│   │   ├── AuthTestPage.tsx          # Authentication testing dashboard
│   │   ├── LoginPage.tsx             # Login form with validation
│   │   ├── SignupPage.tsx            # Signup form with validation  
│   │   ├── ForgotPasswordPage.tsx    # Password reset request
│   │   ├── ResetPasswordPage.tsx     # Password reset form with token validation
│   │   ├── ProtectedRoute.tsx        # Route protection wrapper with onboarding check
│   │   ├── PublicRoute.tsx           # Public route wrapper (redirects authenticated users)
│   │   ├── AuthErrorBoundary.tsx     # Error boundary for auth failures
│   │   └── TwitterCallbackPage.tsx   # Twitter OAuth callback handler
│   ├── onboarding/                   # Onboarding Wizard System (Task 2) ✅
│   │   ├── OnboardingWizard.tsx      # Main wizard with stepper navigation
│   │   ├── StripePaymentStep.tsx     # Stripe Elements payment method setup
│   │   ├── KompromatUploadStep.tsx   # Drag-and-drop Kompromat file upload
│   │   ├── ContactManagementStep.tsx # Contact addition with role assignment
│   │   ├── SocialMediaStep.tsx       # Twitter OAuth integration (optional)
│   │   └── OnboardingTestPage.tsx    # Individual step testing page
│   ├── dashboard/                    # Main Dashboard System (Task 3) ✅
│   │   ├── DashboardLayout.tsx       # Main Soviet-themed dashboard layout
│   │   ├── OperationalCalendar.tsx   # Calendar view with goal/checkpoint display
│   │   ├── ImmediateDirectivesSidebar.tsx # Upcoming deadlines sidebar (7 days)
│   │   ├── VisibleStakesDisplay.tsx  # Financial/Kompromat stakes visualization
│   │   ├── QuickActionsPanel.tsx     # Command action buttons grid
│   │   ├── ConsequenceModalCompact.tsx # Dramatic consequence notification modals
│   │   └── ConsequenceModal*.tsx     # Various consequence modal iterations
│   ├── goals/                        # Goal Creation & Submission Systems (Tasks 4-5) ✅
│   │   ├── GoalCreation.tsx          # Multi-step goal creation wizard
│   │   ├── steps/                    # Goal creation step components
│   │   │   ├── GoalDefinitionStep.tsx # Goal title, description, deadline, rubric
│   │   │   ├── CheckpointStep.tsx    # Checkpoint management with AI suggestions  
│   │   │   ├── StakesStep.tsx        # Monetary stakes and Kompromat assignment
│   │   │   ├── RefereeStep.tsx       # AI vs Human witness selection
│   │   │   └── ReviewStep.tsx        # Final review and database transaction
│   │   ├── SubmissionModal.tsx       # Multi-type submission interface
│   │   ├── FileUploadZone.tsx        # Drag-and-drop file submission
│   │   ├── URLInput.tsx              # External URL submission
│   │   ├── TextDescriptionInput.tsx  # Written proof submission
│   │   ├── SubmissionPreview.tsx     # Preview before submission
│   │   ├── SubmissionHistory.tsx     # Previous submissions with feedback
│   │   └── GoalDetailModal.tsx       # Goal detail view with submission interface
│   ├── modals/                       # Reusable Modal Components
│   │   ├── BaseModal.tsx             # Base modal wrapper with overlay
│   │   ├── PaymentModal.tsx          # Stripe payment method modal
│   │   ├── KompromatModal.tsx        # Kompromat upload modal
│   │   ├── ContactModal.tsx          # Contact addition modal
│   │   └── SocialMediaModal.tsx      # Twitter connection modal
│   └── ui/                           # UI Component System
│       ├── index.ts                  # Component exports
│       ├── button.tsx                # Button variants (command, danger, success, ghost)
│       ├── card.tsx                  # Card components with Soviet styling
│       ├── separator.tsx             # Visual separators
│       ├── soviet-*.tsx              # Soviet Constructivist themed components
│       └── test-card.tsx             # Testing component
├── contexts/                         # Global State Management
│   ├── AuthContext.tsx               # Authentication state with session persistence
│   ├── GoalContext.tsx               # Goal management state
│   └── ToastContext.tsx              # Notification system with animations
├── hooks/                            # Custom React Hooks
│   ├── useModalState.tsx             # Modal state management hook
│   ├── useConsequenceNotifications*.ts # Real-time consequence detection hooks
│   └── useConsequenceNotificationsSafe.ts # Production consequence hook
├── lib/
│   ├── supabase.ts                   # Supabase client with complete type definitions
│   └── utils.ts                      # Utility functions (cn, clsx utilities)
├── utils/                            # Utility Functions & Services
│   ├── errorHandler.ts               # Error mapping and user-friendly messages
│   ├── retryHandler.ts               # Network failure retry logic
│   ├── testHelpers.ts                # Testing utilities
│   ├── resetOnboarding.ts            # Onboarding state reset utility
│   ├── submissionService.ts          # Submission business logic
│   └── submissionStorage.ts          # File upload/storage management
├── styles/
│   ├── tokens.css                    # Soviet Constructivist design tokens
│   ├── index.css                     # Global styles with Tailwind imports
│   └── App.css                       # Application-specific styles
├── assets/                           # Static Assets
├── main.tsx                          # React application entry point
└── App.tsx                           # Main routing with context providers
```

## Complete Database Schema

**Core Tables** (6-table simplified schema):

### **1. auth.users** (Supabase Auth)
- User authentication and metadata
- Stripe customer IDs, holding cell balance
- Twitter OAuth tokens, onboarding status
- Profile information (display name, avatar)

### **2. goals** (User Accountability Goals)
```sql
- id, user_id, title, description
- final_deadline, status ('active', 'completed', 'failed', 'paused')
- grading_rubric, referee_type ('ai', 'human_witness')
- witness_contact_id (for human grading)
- monetary_stake, charity_destination ('doctors_without_borders', 'red_cross', 'unicef')
- minor_kompromat_id, major_kompromat_id (consequence assignment)
- created_at, completed_at
```

### **3. checkpoints** (Goal Milestones)
```sql
- id, goal_id, title, description
- deadline, order_position, requirements  
- status ('pending', 'submitted', 'passed', 'failed', 'overdue')
- created_at, completed_at
```

### **4. submissions** (Proof Uploads)
```sql
- id, checkpoint_id, user_id
- submission_type ('file_upload', 'external_url', 'text_description')
- file_path, external_url, description
- ai_analysis_result (JSONB), human_verdict, feedback_text
- confidence_score, status ('pending', 'grading', 'passed', 'failed', 'contested')
- submitted_at, graded_at
```

### **5. kompromat** (Compromising Content)
```sql
- id, user_id, original_filename, file_path
- file_type, file_size_bytes, severity ('minor', 'major')
- description, created_at
```

### **6. contacts** (Accountability Contacts)
```sql
- id, user_id, name, email
- roles ('witness', 'consequence_target')[]
- verified, created_at
```

### **7. consequences** (Automated Enforcement)
```sql
- id, checkpoint_id, goal_id, user_id
- consequence_type ('monetary', 'humiliation_email', 'humiliation_social')
- monetary_amount, charity_destination, kompromat_id, target_contact_id
- triggered_at, executed_at, execution_status, execution_details (JSONB)
- acknowledged_at (for modal "show once" logic)
```

## Implemented Systems Deep Dive

### **Authentication System (Task 1) ✅**

**Complete Implementation:**
- **Signup/Login**: Full form validation with password strength checking and email verification
- **Password Reset**: Email-based reset flow with secure token validation
- **Protected Routes**: Authentication guards with automatic onboarding enforcement  
- **Session Management**: Persistent sessions with auto-refresh and cross-tab synchronization
- **Error Handling**: Comprehensive error mapping with user-friendly messages and retry logic
- **Toast Notifications**: Animated notification system for user feedback
- **Error Boundaries**: Graceful error recovery for auth failures

**Key Files:**
- `src/contexts/AuthContext.tsx` - Global authentication state management
- `src/components/auth/ProtectedRoute.tsx` - Route protection with onboarding checks
- `src/components/auth/*Page.tsx` - Complete authentication page suite
- `src/utils/errorHandler.ts` - Error message mapping and retry logic

### **Onboarding Wizard System (Task 2) ✅**

**Complete Multi-Step Flow:**
1. **Stripe Payment Integration** - SetupIntent creation, payment method collection, holding cell setup
2. **Kompromat Upload** - Drag-and-drop file upload with severity level assignment (minor/major)
3. **Contact Management** - Contact addition with role assignment (witness/consequence_target)
4. **Social Media OAuth** - Optional Twitter OAuth 2.0 with PKCE flow for social consequences
5. **Wizard Navigation** - Stepper UI with progress tracking and state persistence

**Key Features:**
- State machine pattern for wizard flow control
- Individual step validation and error handling
- Supabase Storage integration for file uploads
- Stripe Elements integration with error handling
- Twitter OAuth 2.0 with PKCE for secure social media connection

**Key Files:**
- `src/components/onboarding/OnboardingWizard.tsx` - Main wizard controller
- `src/components/onboarding/*Step.tsx` - Individual step implementations
- `supabase/functions/create-setup-intent/` - Stripe backend integration
- `supabase/functions/exchange-twitter-token/` - Twitter OAuth backend

### **Main Dashboard System (Task 3) ✅**

**Soviet Constructivist Design:**
- **Header**: Dominant "KOMPROMATOR" branding with Soviet star iconography
- **Layout**: 2-column primary layout with calendar (75%) and directives sidebar (25%)
- **Color Scheme**: Crimson red primary, beige backgrounds, black accents
- **Typography**: Bold, authoritative messaging with state surveillance theme

**Dashboard Components:**
- **Operational Calendar** - `react-big-calendar` integration displaying all goals and checkpoints
- **Immediate Directives Sidebar** - Next 7 days upcoming deadlines with click-to-submit
- **Visible Stakes Display** - Financial balance and Kompromat count visualization
- **Command Actions Panel** - 3x2 grid of quick action buttons (New Mission, Collateral, etc.)
- **Classified Intel Panel** - Operational statistics and compliance metrics

**Key Files:**
- `src/components/dashboard/DashboardLayout.tsx` - Main dashboard controller
- `src/components/dashboard/OperationalCalendar.tsx` - Calendar integration
- `src/components/dashboard/ImmediateDirectivesSidebar.tsx` - Deadline tracking
- `src/styles/tokens.css` - Soviet Constructivist design tokens

### **Goal Creation System (Task 4) ✅**

**Multi-Step Creation Process:**
1. **Goal Definition** - Title, description, final deadline, grading rubric with templates
2. **Checkpoint Management** - Multiple checkpoints with AI-generated suggestions via Gemini API
3. **Stakes Assignment** - Monetary stakes, charity selection, Kompromat assignment (minor/major)
4. **Referee Selection** - AI grading vs human witness selection from contacts
5. **Review & Submission** - Final review with atomic database transaction

**AI Integration:**
- **Checkpoint Suggestions** - Gemini API integration for intelligent checkpoint generation
- **Template Rubrics** - Pre-defined grading rubric templates for common goal types
- **Real-time Validation** - Step-by-step validation with immediate feedback

**Key Files:**
- `src/components/goals/GoalCreation.tsx` - Main goal creation wizard
- `src/components/goals/steps/` - Individual creation step components
- AI integration in CheckpointStep for intelligent suggestions

### **Submission System (Task 5) ✅**

**Multi-Type Submission Interface:**
- **File Upload** - Drag-and-drop zone with Supabase Storage integration, progress tracking
- **External URL** - Link submission with validation and metadata extraction
- **Text Description** - Rich text editor for written proof submissions

**Real-time Features:**
- **Status Tracking** - Real-time submission status updates via Supabase subscriptions
- **Submission History** - Complete history with feedback and resubmission capability
- **Preview System** - Preview before final submission with editing capability

**Key Files:**
- `src/components/goals/SubmissionModal.tsx` - Multi-type submission interface
- `src/components/goals/FileUploadZone.tsx` - Drag-and-drop implementation
- `src/utils/submissionService.ts` - Submission business logic
- `src/utils/submissionStorage.ts` - File storage management

### **AI Grading System (Task 6) ✅**

**Gemini API Integration:**
- **Automatic Grading** - Google Gemini API analyzes submissions against user-defined rubrics
- **Database Triggers** - Automatic grading invocation when submissions are created
- **Cost Optimization** - Pre-processing checks to minimize expensive API calls
- **Confidence Scoring** - AI confidence metrics for grading reliability

**Edge Function Architecture:**
- **`gradeSubmission`** - Main grading processor with secure prompt construction
- **Error Handling** - Comprehensive error recovery and retry mechanisms
- **Usage Monitoring** - API usage tracking for cost optimization
- **Security** - Input sanitization and secure prompt engineering

**Key Files:**
- `supabase/functions/gradeSubmission/index.ts` - Main AI grading function
- `database/migrations/014_grading_trigger.sql` - Database automation setup
- Real-time grading results via Supabase subscriptions

### **Consequence Engine System (Task 7) ✅**

**Automated Deadline Enforcement:**
- **pg_cron Automation** - 5-minute automated checking for overdue checkpoints/goals
- **Russian Roulette Logic** - 33% probability for checkpoint failures, 100% for final deadlines
- **Real-time Notifications** - Immediate modal alerts via Supabase subscriptions
- **Complete Audit Trail** - Full logging of all consequence attempts and outcomes

**Consequence Types:**
- **Monetary Penalties** - Real Stripe API transfers to approved charities (Doctors Without Borders, Red Cross, UNICEF)
- **Humiliation Emails** - SendGrid integration sending Kompromat attachments to random contacts
- **Mercy Notifications** - "State shows mercy" messaging when Russian Roulette spares users
- **Grading Failures** - Submission failure notifications with resubmission guidance

**System Architecture:**
```
pg_cron (5min) → HTTP Function → Edge Function → Russian Roulette → 
Stripe/SendGrid APIs → Database Updates → Real-time Frontend Notifications
```

**Modal Queue System:**
- **Sequential Processing** - Multiple consequences displayed one-by-one, not overwhelming
- **"Show Once" Logic** - Each consequence triggers modal exactly once via acknowledgment tracking
- **Dramatic Presentation** - Soviet Constructivist styling with "GREAT DISHONOR" messaging
- **Authentication Safety** - Queue system designed to not interfere with user sessions

**Key Files:**
- `supabase/functions/triggerConsequence/index.ts` - Main consequence processor
- `supabase/functions/triggerConsequence/stripe-utils.ts` - Monetary consequence execution
- `supabase/functions/triggerConsequence/sendgrid-utils.ts` - Email consequence execution
- `src/hooks/useConsequenceNotificationsSafe.ts` - Real-time notification system
- `src/components/dashboard/ConsequenceModalCompact.tsx` - Modal interface
- `database/migrations/014_consequence_engine_setup.sql` - Core detection functions
- `database/migrations/015_pg_cron_setup.sql` - Automated scheduling
- `database/migrations/016_add_consequence_acknowledgment.sql` - Modal tracking

## Current Development State

### **Production-Ready Systems:**
All completed tasks (1-7) are production-ready with:
- **Real API Integration** - Stripe, SendGrid, Gemini APIs with live keys
- **Automated Systems** - pg_cron scheduling, Edge Function processing
- **Security Implementation** - Row Level Security, service role authentication
- **Error Recovery** - Comprehensive error handling and retry mechanisms
- **Real-time Features** - Supabase subscriptions for live updates
- **Complete Audit Trails** - Full logging and accountability tracking

### **Development Environment:**
- **Hot Reload** - Vite dev server with instant updates
- **Type Safety** - Complete TypeScript coverage with strict mode
- **Code Quality** - ESLint and Prettier configured
- **Testing** - Individual component test pages for isolated testing
- **Database Migrations** - Complete migration history in `database/migrations/`

## Key Implementation Patterns & Best Practices

### **State Management Architecture**
- **Context API** - Global state for authentication, goals, and notifications
- **Local Component State** - Form data and UI state management
- **Supabase Subscriptions** - Real-time data synchronization
- **Modal State Management** - Centralized modal control with `useModalState` hook

### **Error Handling Strategy**
- **User-Friendly Messages** - `getErrorMessage()` utility for error translation
- **Retry Logic** - `withRetry()` wrapper for network failure recovery
- **Error Boundaries** - Component-level error recovery with `AuthErrorBoundary`
- **Toast Notifications** - Immediate user feedback for all operations
- **Graceful Degradation** - Fallback behavior for API failures

### **Form Validation Patterns**
- **Real-time Validation** - Immediate feedback during user input
- **TypeScript Interfaces** - Strongly typed form state management
- **Step-by-Step Validation** - Multi-step form validation with progress tracking
- **Consistent Error Display** - Uniform error presentation across all forms

### **Routing & Navigation**
- **Protected Routes** - Authentication checks with automatic redirects
- **Onboarding Enforcement** - Mandatory onboarding completion before dashboard access
- **Return URL Handling** - Seamless redirect after authentication
- **Deep Linking** - Direct navigation to specific modals and states

### **File Upload & Storage**
- **Drag-and-Drop Interface** - `react-dropzone` integration with progress tracking
- **Supabase Storage** - Secure file storage with access controls
- **File Type Validation** - Client and server-side file type restrictions
- **Progress Feedback** - Real-time upload progress and status updates

### **Real-time Features Implementation**
- **Subscription Management** - Proper cleanup and unique channel naming
- **Queue Systems** - Sequential processing for complex notifications
- **Memory Management** - useRef patterns for subscription lifecycle
- **Authentication Safety** - Subscription patterns that don't corrupt user context

### **Soviet Constructivist Design System**
- **Color Palette** - Crimson red primary, beige backgrounds, black accents
- **Typography** - Bold, authoritative messaging with state surveillance theme
- **Iconography** - Soviet star symbols and state authority imagery  
- **Layout Principles** - Grid-based layouts with geometric precision
- **Animation** - Subtle transitions maintaining authoritative feel

### **CRITICAL UI/UX RULES**

#### **Text Contrast Requirements**
**🚨 NEVER use light text on light backgrounds or dark text on dark backgrounds**
- Light backgrounds (white, gray, beige) → Use BLACK or DARK text
- Dark backgrounds (black, red, blue) → Use WHITE or LIGHT text  
- Always ensure high contrast for readability
- Test all text elements for visibility before implementation

#### **Soviet Theme Consistency**
- Maintain authoritative, state-surveillance messaging
- Use military/official terminology ("OPERATIVE", "DIRECTIVE", "CLASSIFIED")
- Implement dramatic consequence messaging ("GREAT DISHONOR", "STATE SHOWS MERCY")
- Consistent iconography with Soviet stars and geometric elements

#### **Modal & Notification Standards**
- Sequential processing for multiple notifications (never overwhelming)
- "Show once" logic for all consequence modals
- Dramatic presentation for consequence notifications
- Clear call-to-action buttons ("ACKNOWLEDGE SHAME", "SUBMIT PROOF")

## Environment Configuration

### **Required Environment Variables**
```bash
# Frontend (.env)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase Edge Functions (Dashboard Settings)
GOOGLE_API_KEY=your_gemini_api_key          # For AI grading and checkpoint suggestions
STRIPE_SECRET_KEY=sk_live_...               # For real monetary consequences
SENDGRID_API_KEY=SG.real_key...            # For real humiliation email consequences
```

### **Database Configuration**
- **pg_cron Extension** - Enabled in Supabase Dashboard for automated consequence checking
- **http Extension** - Enabled for Edge Function HTTP calls
- **Service Role Authentication** - Configured for automated processing
- **Row Level Security** - Enabled on all tables with user-based access control

### **Production Deployment Checklist**
- ✅ All environment variables configured with live API keys
- ✅ Database migrations applied (`supabase db push`)
- ✅ Edge Functions deployed (`supabase functions deploy`)
- ✅ pg_cron job active (runs every 5 minutes)
- ✅ Storage buckets configured with proper access policies
- ✅ Real-time subscriptions tested and working
- ✅ Stripe Connect charity accounts configured
- ✅ SendGrid sender authentication verified

## Development Workflow

### **TaskMaster Integration**
Tasks 1-7 are complete in TaskMaster. Use these commands:
- `task-master list` - View all tasks and current 70% completion status
- `task-master next` - Get next available task (Task 8: Twitter Integration)
- `task-master show <id>` - View detailed task information
- `task-master set-status --id=<id> --status=done` - Mark tasks complete as you finish them

### **Testing Approach**
- **Authentication Testing** - Visit `/test` for comprehensive auth flow testing
- **Onboarding Testing** - Visit `/test-onboarding` for step-by-step wizard testing  
- **Component Isolation** - Individual test pages for complex components
- **Real API Testing** - Use test Stripe keys and sandbox environments during development
- **Database Testing** - Migration rollback testing and schema validation

### **Code Quality Standards**
- **TypeScript Strict Mode** - All code must pass strict TypeScript compilation
- **ESLint Compliance** - Run `npm run lint` before commits
- **Prettier Formatting** - Run `npm run format` for consistent code style
- **Component Documentation** - Clear prop interfaces and component purposes
- **Error Handling** - Every API call must have proper error handling
- **Loading States** - All async operations must show loading indicators

### **Git Workflow**
- **Feature Branches** - Create branches for Task 8, 9, 10 development
- **Commit Messages** - Reference task numbers in commit messages
- **Migration Files** - Never modify existing migrations, always create new ones
- **Environment Files** - Never commit actual API keys or sensitive data

## Next Development Priorities

### **Task 8: Twitter Integration** (Medium Priority)
- Extend existing Twitter OAuth to support consequence posting
- Implement Major Kompromat posting to Twitter/X for severe failures
- Add Twitter consequence type to consequence engine
- Test social media posting with privacy controls

### **Task 9: Notification System** (Medium Priority) 
- Extend existing SendGrid integration for systematic notifications
- Implement deadline reminder emails (24h, 1h before deadlines)
- Add submission result notifications (pass/fail with feedback)
- Create notification preferences and unsubscribe management

### **Task 10: UI Polish** (Low Priority)
- Implement Magic UI components for enhanced animations  
- Refine Soviet Constructivist design system consistency
- Add advanced transitions and micro-interactions
- Optimize mobile responsiveness for all components
- Conduct accessibility audit and improvements

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md