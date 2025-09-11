# **Threativator: Soviet-Style Accountability & Discipline Application**

![Threativator Banner](._images/banner.png)

**Threativator** is a Soviet Constructivist-themed task management web application that combats procrastination through negative reinforcement mechanisms. Built as a USSR-style "State Discipline Network," the application uses financial stakes and "Kompromat" (compromising material) consequences to enforce accountability on significant personal and professional projects.

> *"Trust us, your motivation issues will be a thing of the past; we'll make sure of it, at all costs."* - **The State**

## **🎯 What Threativator Does**

Threativator transforms procrastination through **fear-driven accountability**:

- **Financial Stakes**: Users deposit real money that gets forfeited to charity upon failure
- **Kompromat Consequences**: Users upload embarrassing content that gets shared with contacts or posted on social media when they fail
- **AI-Powered Grading**: Google Gemini API analyzes submissions against user-defined rubrics
- **Human Witness System**: Trusted contacts can override AI decisions and verify compliance
- **Russian Roulette Mechanics**: 33% chance consequences for missed checkpoints, 100% for final deadline failures

### **Target Use Cases**
- Writing a novel or research paper
- Building a software MVP or learning new skills
- Completing certification programs or fitness goals
- Any significant project requiring external accountability
  
### **Not For**
- Daily to-do lists or routine habits
- Minor recurring tasks
- Anything without a clear, demonstrable end result

## **🏗️ Architecture & Tech Stack**

### **Frontend Stack**
```typescript
Framework: React 18 + TypeScript (strict mode)
Build Tool: Vite with HMR and React plugin
Styling: Tailwind CSS 4 with custom Soviet theme
UI Components: Custom Soviet-themed components + Radix UI
Routing: React Router v6 with protected routes
State: React Context API (AuthContext, ToastContext, GoalContext)
Calendar: React Big Calendar for operational dashboard
File Uploads: React Dropzone with Supabase Storage
```

### **Backend Services**
```yaml
Database & Auth: Supabase PostgreSQL with Row Level Security
File Storage: Supabase Storage with RLS policies
Real-time: Supabase subscriptions for live updates
Edge Functions: Supabase Edge Functions for serverless logic
Scheduling: pg_cron for deadline monitoring
Email: SendGrid for transactional emails
Payments: Stripe Elements with Connect for charity payouts
AI/ML: Google Gemini API for submission analysis
Social: Twitter/X API OAuth 2.0 integration
```

### **Key Dependencies**
- `@supabase/supabase-js` - Backend integration
- `@stripe/react-stripe-js` - Payment processing
- `react-router-dom` - Client-side routing
- `react-big-calendar` - Calendar interface
- `lucide-react` - Icon system
- `tailwindcss` - Utility-first styling

## **🗄️ Database Schema**

The application uses a 6-table PostgreSQL schema with comprehensive RLS policies:

```sql
-- Core Tables
auth.users          # Supabase managed user accounts
kompromat           # User uploaded compromising material
contacts            # User's accountability network
goals               # Main accountability objectives  
checkpoints         # Goal milestones and deadlines
submissions         # User proof submissions
consequences        # Executed punishments
```

### **Key Relationships**
- `goals` → `auth.users` (1:N) - Each goal belongs to one user
- `goals` → `checkpoints` (1:N) - Goals contain multiple checkpoints
- `checkpoints` → `submissions` (1:N) - Multiple submission attempts per checkpoint
- `goals` → `kompromat` (N:2) - Minor/major kompromat assignments
- `consequences` → `goals|checkpoints` - Triggered punishments

## **🎨 Soviet Constructivist Design System**

### **Visual Identity**
```css
/* Color Palette */
--primary-crimson: #C11B17    /* State authority elements */
--accent-black: #000000       /* Body text and borders */
--background-beige: #F5EEDC   /* Document backgrounds */
--main-crimson: #C11B17       /* Page background */
--success-muted: #5A7761      /* Military green for completed ops */

/* Typography */
--header-font: "Stalinist One" /* UPPERCASE headers only */
--body-font: "Roboto Condensed" /* Efficient information display */
--minimum-size: 14px          /* All interactive elements */

/* Geometric Authority */
--border-thick: 6px           /* Headers/footers - maximum authority */  
--border-medium: 4px          /* Card sections */
--border-radius: 0px          /* Zero radius enforced globally */
--no-shadows: forbidden       /* Stark contrast and lines only */
```

### **Component Hierarchy**
```typescript
// Implemented Layout Structure
OPERATIONAL COMMAND CENTER
├── IMMEDIATE DIRECTIVES (25% width sidebar)
├── OPERATIONAL CALENDAR (75% width main area) 
└── Bottom Command Panel (1:2:1 ratio)
    ├── STATE COLLATERAL (25% - status display)
    ├── COMMAND ACTIONS (50% - 3x2 button grid)  
    └── INTELLIGENCE PANEL (25% - future expansion)
```

## **🔧 Development Setup**

### **Prerequisites**
- Node.js 18+ and npm
- Supabase account and project
- API keys for required services

### **Environment Configuration**
```bash
# Required Environment Variables
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional for full functionality
STRIPE_PUBLIC_KEY=your_stripe_public_key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
SENDGRID_API_KEY=your_sendgrid_api_key
TWITTER_CLIENT_ID=your_twitter_client_id
```

### **Quick Start**
```bash
# Clone and install
git clone [repository-url]
cd threativator-1
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API keys

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### **Available Scripts**
```json
{
  "dev": "vite",                    // Start dev server with HMR
  "build": "tsc -b && vite build",  // TypeScript compile + build
  "lint": "eslint .",               // Run ESLint checks
  "preview": "vite preview",        // Preview production build
  "format": "prettier --write .",   // Format all files
  "format:check": "prettier --check ." // Check formatting
}
```

## **🏛️ Project Structure**

```
src/
├── components/
│   ├── auth/                    # Authentication system
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── AuthErrorBoundary.tsx
│   ├── dashboard/               # Main operational interface
│   │   ├── DashboardLayout.tsx
│   │   ├── OperationalCalendar.tsx
│   │   ├── ImmediateDirectivesSidebar.tsx
│   │   ├── QuickActionsPanel.tsx
│   │   └── VisibleStakesDisplay.tsx
│   ├── goals/                   # Goal creation & management
│   │   ├── GoalCreation.tsx
│   │   ├── steps/               # Multi-step goal wizard
│   │   ├── SubmissionModal.tsx
│   │   └── GoalDetailModal.tsx
│   ├── onboarding/             # Progressive security clearance
│   │   ├── OnboardingWizard.tsx
│   │   ├── StripePaymentStep.tsx
│   │   ├── KompromatUploadStep.tsx
│   │   └── ContactManagementStep.tsx
│   ├── modals/                 # State communiqués
│   │   ├── BaseModal.tsx
│   │   ├── PaymentModal.tsx
│   │   ├── KompromatModal.tsx
│   │   └── ContactModal.tsx
│   └── ui/                     # Soviet-themed components
│       ├── soviet-card.tsx
│       ├── soviet-button.tsx
│       ├── soviet-banner.tsx
│       └── soviet-container.tsx
├── contexts/
│   ├── AuthContext.tsx         # Global auth state
│   ├── ToastContext.tsx        # Notification system
│   └── GoalContext.tsx         # Goal management state
├── hooks/
│   └── useModalState.tsx       # Modal state management
├── lib/
│   └── supabase.ts            # Supabase client & types
└── utils/
    ├── errorHandler.ts         # Error mapping & handling
    ├── retryHandler.ts         # Retry logic for failures  
    └── testHelpers.ts          # Testing utilities
```

## **📋 Current Implementation Status**

### **✅ Completed Features**
- **Authentication System**: Complete signup/login/password reset flow
- **Protected Routes**: Route guards with redirect handling  
- **Soviet Design System**: Full Constructivist UI implementation
- **Dashboard Layout**: Operational command center interface
- **Goal Creation**: Multi-step wizard with stakes assignment
- **Onboarding System**: Progressive security clearance setup
- **Database Schema**: 6-table structure with RLS policies
- **File Upload**: Kompromat and submission handling via Supabase Storage
- **Toast System**: User feedback with Soviet-themed notifications

### **🔄 In Progress** 
- **AI Grading Integration**: Google Gemini API submission analysis
- **Submission Flow**: Complete evidence upload and verification
- **Deadline Monitoring**: Automated consequence triggering
- **Payment Processing**: Stripe integration for monetary stakes

### **⏳ Planned Features**
- **Email Notifications**: SendGrid integration for deadline alerts
- **Social Media Posting**: Twitter/X API for humiliation consequences
- **Human Witness System**: Contact-based verification workflow
- **Russian Roulette**: Probabilistic checkpoint failure consequences
- **Contest System**: AI decision appeals through vouching

## **🔒 Security & Best Practices**

### **Row Level Security (RLS)**
All database tables implement strict RLS policies ensuring users can only access their own data:
```sql
-- Example policy
CREATE POLICY "Users can view own goals" ON goals
  FOR ALL TO authenticated  
  USING (auth.uid() = user_id);
```

### **API Security**
- **No client-side secrets**: All API calls to Stripe, Gemini, SendGrid made via Supabase Edge Functions
- **Webhook verification**: All webhook endpoints verify signatures
- **Input sanitization**: User rubrics sanitized before AI prompts to prevent injection

### **File Security** 
- **Storage RLS**: Users can only access files in their own `user_id` folders
- **File validation**: Upload restrictions on size, type, and content
- **Secure URLs**: Temporary signed URLs for file access

## **🧪 Testing**

### **Development Testing Routes**
- `/test` - Authentication system testing dashboard
- `/onboarding/test` - Onboarding wizard testing interface
- **Health Check**: Built-in Supabase connectivity verification

### **Testing Strategy**
- **Authentication**: Complete auth flow testing with error scenarios
- **Protected Routes**: Route guard behavior verification  
- **Error Boundaries**: Graceful error recovery testing
- **RLS Policies**: Database security policy validation

## **🚀 Deployment**

### **Production Setup**
```bash
# Build for production
npm run build

# Environment variables for production
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
# ... other production API keys
```

### **Database Migrations**
```bash
# Apply latest schema
supabase db push

# Reset database (development only)
supabase db reset
```

## **📊 TaskMaster Integration**

This project uses TaskMaster AI for development workflow management:

```bash
# View current tasks
tm list

# Get next available task  
tm next

# Mark task complete
tm set-status --id=<id> --status=done

# Add new task
tm add-task --prompt="Task description" --research
```

See `.taskmaster/CLAUDE.md` for complete TaskMaster integration details.

## **🤝 Contributing**

### **Development Workflow**
1. **Authentication**: All features require user authentication
2. **Soviet Theme**: Maintain Constructivist design principles
3. **TypeScript**: Strict typing for all components and API calls  
4. **RLS First**: Security policies before feature development
5. **Error Handling**: Comprehensive error boundaries and user feedback

### **Code Style**
- **React**: Functional components with hooks only
- **TypeScript**: Strict mode with comprehensive type coverage
- **Styling**: Tailwind utilities with Soviet theme variables
- **File Structure**: Feature-based organization with clear separation

## **📜 License**

MIT License - See LICENSE file for details.

## **⚠️ Disclaimer**

Threativator is designed for adult users who willingly choose to submit themselves to accountability mechanisms. The application handles real monetary stakes and personal content - use responsibly.

---

*Built with the discipline of the Soviet State. Compliance is mandatory. Failure is not an option.* 

**ВЕЛИКАЯ ЧЕСТЬ ТОВАРИЩ** (Great Honor, Comrade)
