# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Threativator** is a quirky task management web application designed to combat procrastination through negative reinforcement (financial stakes and "Kompromat" consequences). Built with React + TypeScript + Vite, integrated with Supabase for backend services.

### Current Status: **Task 1 COMPLETED ✅**
- ✅ **Authentication System** - Complete Supabase auth with signup/login/password reset
- 🔄 **Next: Task 2** - Onboarding Wizard (Stripe, Kompromat upload, contacts)

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run lint` - Run ESLint on all files
- `npm run preview` - Preview production build locally

## Architecture

### **Frontend Stack**
- **Build System**: Vite with React plugin and HMR
- **Framework**: React 18 with TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom animations
- **Routing**: React Router v6 with protected routes
- **State Management**: React Context API for auth state

### **Backend Services**
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security)
- **File Storage**: Supabase Storage for "Kompromat" and submissions
- **Real-time**: Supabase subscriptions for live updates
- **Email**: Supabase Auth emails (signup confirmation, password reset)

### **Key Dependencies**
- `@supabase/supabase-js` - Backend integration
- `react-router-dom` - Client-side routing
- `tailwindcss` - Utility-first CSS framework

## Project Structure

```
src/
├── components/
│   └── auth/                    # Authentication components
│       ├── AuthTestPage.tsx     # Testing dashboard
│       ├── LoginPage.tsx        # Login form with validation
│       ├── SignupPage.tsx       # Signup form with validation
│       ├── ForgotPasswordPage.tsx # Password reset request
│       ├── ResetPasswordPage.tsx  # Password reset form
│       ├── ProtectedRoute.tsx   # Route protection wrapper
│       ├── PublicRoute.tsx      # Public route wrapper
│       └── AuthErrorBoundary.tsx # Error boundary for auth
├── contexts/
│   ├── AuthContext.tsx          # Global auth state management
│   └── ToastContext.tsx         # Notification system
├── lib/
│   └── supabase.ts             # Supabase client & types
├── utils/
│   ├── errorHandler.ts         # Error mapping & handling
│   ├── retryHandler.ts         # Retry logic for failures
│   └── testHelpers.ts          # Testing utilities
└── App.tsx                     # Main routing & providers
```

## Database Schema

Located in `database/migrations/` - includes:
- **users** - User profiles with onboarding status
- **goals** - User accountability goals
- **checkpoints** - Goal milestones
- **submissions** - Proof uploads
- **kompromat** - "Compromising" content for consequences
- **contacts** - User's accountability contacts

## Authentication System (COMPLETED ✅)

### **Features Implemented**
- ✅ **Signup/Login Pages** - Full form validation, password strength checking
- ✅ **Password Reset Flow** - Email-based reset with secure token validation
- ✅ **Protected Routes** - Route guards with redirect handling
- ✅ **Session Management** - Persistent sessions with auto-refresh
- ✅ **Error Handling** - Comprehensive error mapping and retry logic
- ✅ **Toast Notifications** - User feedback system with animations
- ✅ **Error Boundaries** - Graceful error recovery

### **Key Components**
- `AuthContext` - Global authentication state
- `useAuth()` - Authentication hook for components
- `ProtectedRoute` - Route protection wrapper
- `PublicRoute` - Redirects authenticated users
- `ToastProvider` - Notification system

### **Testing**
- Visit `/test` for authentication testing dashboard
- Test all auth flows: signup, login, password reset
- Verify protected route behavior
- Test error handling and notifications

## Environment Setup

Required environment variables in `.env`:
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development Workflow

### **Current Task Progress** (via TaskMaster)
1. ✅ **Authentication System** - Signup, login, password reset, route protection
2. 🔄 **Onboarding Wizard** - Stripe integration, Kompromat upload, contacts
3. ⏳ **Dashboard Interface** - Main app dashboard with deadlines
4. ⏳ **Goal Creation** - Multi-step goal creation flow
5. ⏳ **Submission System** - File upload and grading system

### **TaskMaster Commands**
- `tm list` - View all tasks and progress
- `tm next` - Get next available task
- `tm show <id>` - View task details
- `tm set-status --id=<id> --status=done` - Mark task complete

## Key Implementation Patterns

### **Error Handling**
- Use `getErrorMessage()` utility for user-friendly messages
- Implement retry logic with `withRetry()` for network failures
- Use `AuthErrorBoundary` for component-level error recovery

### **Form Validation**
- Real-time validation with immediate feedback
- TypeScript interfaces for form state
- Consistent error display patterns

### **State Management**
- React Context for global state (auth, notifications)
- Local component state for form data
- Supabase subscriptions for real-time updates

### **Routing**
- Protected routes with authentication checks
- Return URL handling for login redirects
- Onboarding requirement enforcement

### **CRITICAL UI/UX RULE - Text Contrast**
**🚨 NEVER use light text on light backgrounds or dark text on dark backgrounds**
- Light backgrounds (white, gray, beige) → Use BLACK or DARK text
- Dark backgrounds (black, red, blue) → Use WHITE or LIGHT text
- Always ensure high contrast for readability
- Test all text elements for visibility before implementation

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md
