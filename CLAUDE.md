# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**KOMPROMATOR** (Threativator) is a Soviet Constructivist-themed accountability app that combats procrastination through negative reinforcement - financial stakes and "Kompromat" consequences. React + TypeScript + Vite frontend with Supabase backend.

**Core Concept**: Users set goals with monetary stakes and embarrassing content. Miss deadlines → money goes to charity and/or Kompromat gets shared with contacts or posted to Twitter.

## Development Commands

```bash
# Frontend
npm run dev              # Start Vite dev server (localhost:5173)
npm run build            # TypeScript compile + production build
npm run lint             # ESLint check
npm run format           # Prettier format all files

# Supabase
supabase start           # Start local Supabase (requires Docker)
supabase db push         # Apply migrations to remote
supabase functions serve # Run Edge Functions locally
supabase functions deploy <name>  # Deploy single function
supabase functions deploy         # Deploy all functions
```

## Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript (strict), Vite, Tailwind CSS v4, React Router v7
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions + Realtime)
- **APIs**: Stripe (payments), SendGrid (emails), Google Gemini (AI grading), Twitter/X OAuth
- **Automation**: pg_cron for deadline monitoring (5-minute intervals)

### Key Entry Points
- `src/App.tsx` - Main routing with context providers
- `src/contexts/AuthContext.tsx` - Global auth state, session management
- `src/lib/supabase.ts` - Supabase client with TypeScript types
- `src/components/dashboard/DashboardLayout.tsx` - Main app interface
- `src/components/goals/GoalCreation.tsx` - Multi-step goal wizard

### Edge Functions (`supabase/functions/`)
- `gradeSubmission` - Gemini API submission analysis
- `triggerConsequence` - Execute monetary/email/social consequences
- `sendDeadlineReminders` - Email reminders (24h, 1h before deadlines)
- `sendSubmissionResultNotification` - Pass/fail notifications
- `create-setup-intent` - Stripe payment method setup
- `exchange-twitter-token` - Twitter OAuth token exchange

### Database Schema (6 core tables)
- `goals` - Accountability objectives with stakes
- `checkpoints` - Goal milestones with deadlines
- `submissions` - User proof uploads with AI grading results
- `kompromat` - Embarrassing content (minor/major severity)
- `contacts` - Accountability contacts (witness/consequence_target roles)
- `consequences` - Executed punishment records

### Data Flow
```
User submits proof → submissions table → gradeSubmission Edge Function →
Gemini API grades against rubric → status updated → real-time notification

pg_cron checks overdue → triggerConsequence → Russian Roulette (33%/100%) →
Stripe transfer OR SendGrid email → consequences table → modal notification
```

## Key Patterns

### State Management
- **AuthContext**: Authentication state with Supabase session
- **GoalContext**: Goal CRUD and real-time subscriptions
- **ToastContext**: Notification queue with Soviet-themed styling
- **useConsequenceNotificationsSafe**: Real-time consequence modals (show-once logic)

### Error Handling
- `src/utils/errorHandler.ts` - `getErrorMessage()` for user-friendly errors
- `src/utils/retryHandler.ts` - `withRetry()` for network failures
- `AuthErrorBoundary` for graceful auth failure recovery

### File Upload Flow
1. `react-dropzone` captures files
2. Upload to Supabase Storage (`kompromat` or `submissions` bucket)
3. Store path in database table
4. Storage RLS ensures user can only access own files

## Soviet Constructivist Design System

### Color Palette
```css
--primary-crimson: #C11B17    /* Primary actions, headers */
--background-beige: #F5EEDC   /* Document backgrounds */
--accent-black: #000000       /* Text, borders */
--success-muted: #5A7761      /* Completed operations */
```

### Typography & UI Rules
- **UPPERCASE headers** with authoritative messaging
- **Zero border-radius** enforced globally
- **No shadows** - stark contrast only
- **Military terminology**: "OPERATIVE", "DIRECTIVE", "CLASSIFIED"
- **Consequence modals**: "GREAT DISHONOR", "STATE SHOWS MERCY"

### Critical: Text Contrast
- Light backgrounds → BLACK text
- Dark backgrounds → WHITE text
- Always test visibility before shipping

## Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_URL=<project_url>
VITE_SUPABASE_ANON_KEY=<anon_key>
```

### Supabase Edge Functions (Dashboard → Settings → Edge Functions)
```
GOOGLE_API_KEY=<gemini_key>
STRIPE_SECRET_KEY=<stripe_live_key>
SENDGRID_API_KEY=<sendgrid_key>
```

## Database Migrations

Migrations are in `database/migrations/`. Key migrations:
- `006_simplified_schema.sql` - Core 6-table schema
- `014_consequence_engine_setup.sql` - Overdue detection functions
- `015_pg_cron_setup.sql` - 5-minute automated checking
- `019_deadline_reminders.sql` - Notification preferences
- `022_notification_preferences.sql` - User notification settings

**Never modify existing migrations** - always create new numbered files.

## Testing Routes

- `/test` - Authentication flow testing
- `/test-onboarding` - Onboarding wizard step testing

## TaskMaster Integration

Project uses TaskMaster for task management. See `.taskmaster/CLAUDE.md` for full commands.

```bash
task-master list                              # View all tasks
task-master next                              # Get next available task
task-master show <id>                         # View task details
task-master set-status --id=<id> --status=done  # Mark complete
```
