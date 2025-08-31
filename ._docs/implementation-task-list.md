# **Threativator: Implementation Task List & Development Plan**

This document outlines the iterative development plan for the Threativator application. It is structured in phases, each building upon the last to deliver increasing value, culminating in a polished, feature-complete product.

## **Phase 1: Project Setup & Core Infrastructure (Barebones)**

**Goal:** Establish the foundational architecture and a minimally running application. This phase is not user-facing but ensures all core services can communicate.

### **1.1: Environment & Tooling Setup**

- **\[ \] Action 1:** Initialize a new React project using Vite with the TypeScript template.
- **\[ \] Action 2:** Set up the project repository on GitHub with branch protection rules.
- **\[ \] Action 3:** Configure ESLint, Prettier, and TypeScript for strict code quality.
- **\[ \] Action 4:** Install and configure Tailwind CSS and the core theme settings (`theme-rules.md`).

### **1.2: Supabase Backend Initialization**

- **\[ \] Action 1:** Create a new Supabase project.
- **\[ \] Action 2:** Write the initial database migration script (`initial_schema.sql`) to create all tables defined in `architecture-and-rules.md`.
- **\[ \] Action 3:** Implement basic Row Level Security (RLS) policies for all tables, ensuring users can only see their own data.
- **\[ \] Action 4:** Set up the Supabase client in the React app and establish a successful connection.
- **\[ \] Action 5:** Implement a basic "health check" page that successfully fetches data from a test table to confirm connectivity.

## **Phase 2: The MVP (Minimal Viable Product)**

**Goal:** Deliver the core user journey. A user can sign up, create a goal with real stakes, submit proof, and have it graded by the AI. This version is usable and demonstrates the app's primary value.

### **2.1: User Onboarding & Authentication**

- **\[ \] Action 1:** Build the sign-up and login pages using Supabase Auth.
- **\[ \] Action 2:** Create the mandatory multi-step onboarding wizard (`user-flow.md, 1.3`).
- **\[ \] Action 3:** Integrate Stripe Elements for the "Connect Payment Method" step.
- **\[ \] Action 4:** Implement the "Upload Initial Kompromat" step using Supabase Storage.
- **\[ \] Action 5:** Create the UI for adding initial contacts.

### **2.2: Core Goal Management**

- **\[ \] Action 1:** Develop the main dashboard UI, including a static placeholder for the calendar and a functional "Upcoming Deadlines" list.
- **\[ \] Action 2:** Build the multi-step "Create New Goal" flow.
- **\[ \] Action 3:** Implement the logic for assigning monetary stakes (from the user's Stripe "Holding Cell") and Kompromat to the new goal.
- **\[ \] Action 4:** Ensure newly created goals and checkpoints are correctly saved to the database and displayed on the dashboard.

### **2.3: Submission & AI Grading Loop**

- **\[ \] Action 1:** Build the "Submit Proof" modal, allowing for file uploads to Supabase Storage.
- **\[ \] Action 2:** Create the `gradeSubmission` Supabase Edge Function.
- **\[ \] Action 3:** Integrate the Google Gemini API within the Edge Function to perform the MVP-level analysis (word count, OCR).
- **\[ \] Action 4:** Implement the logic to update the submission/checkpoint status in the database based on the AI's response.
- **\[ \] Action 5:** Use Supabase real-time subscriptions to automatically update the submission status on the user's dashboard.

### **2.4: Basic Notifications**

- **\[ \] Action 1:** Create a Supabase Edge Function to handle email sending via SendGrid.
- **\[ \] Action 2:** Implement triggers to send "Submission Passed" and "Submission Failed" emails after the grading process is complete.
- **\[ \] Action 3:** Set up dynamic email templates in SendGrid for these notifications, incorporating the avatars and witty microcopy.

## **Phase 3: Consequences & Gamification (Polish & Core Loop Expansion)**

**Goal:** Implement the "threat" part of Threativator. This phase makes the consequences real and introduces the key gamified elements.

### **3.1: Deadline & Consequence Engine**

- **\[ \] Action 1:** Set up `pg_cron` in Supabase to run a scheduled job every 5 minutes.
- **\[ \] Action 2:** Create the `triggerConsequence` Supabase Edge Function that checks for any missed deadlines.
- **\[ \] Action 3:** Implement the monetary consequence logic: trigger a Stripe payout to the designated charity via the API.
- **\[ \] Action 4:** Implement the humiliation consequence logic: send an email to a random contact from the user's list, attaching the "Minor" Kompromat.
- **\[ \] Action 5:** Implement the "Great dishonor" email and the in-app failure modal.

### **3.2: Gamified UI Elements**

- **\[ \] Action 1:** Implement the "Russian Roulette" animated sequence for checkpoint failures.
- **\[ \] Action 2:** Build out the full, interactive dashboard calendar.
- **\[ \] Action 3:** Integrate the custom avatars throughout the UI and notifications.
- **\[ \] Action 4:** Add all the specified Magic UI animations to buttons, modals, and notifications to align with the "Bold & Playful" style.
- **\[ \] Action 5:** Implement the "Visible Stakes" component on the dashboard.

### **3.3: Social Integration (MVP)**

- **\[ \] Action 1:** Implement the OAuth flow for connecting a user's Twitter account.
- **\[ \] Action 2:** Securely store and manage user access tokens in the database.
- **\[ \] Action 3:** Extend the `triggerConsequence` function to handle posting "Major" Kompromat to Twitter for final deadline failures.

## **Phase 4: Advanced Features & Scalability (Post-MVP)**

**Goal:** Enhance the core product with features that expand its use cases and improve the user experience.

### **4.1: Advanced Grading & Referee Options**

- **\[ \] Action 1:** Implement the "Human Witness" grading flow, including sending the email and creating the simple voting page.
- **\[ \] Action 2:** Build the "Contest AI Decision" flow, including the UI for a friend to "Vouch" for a submission.
- **\[ \] Action 3:** Begin development on the advanced AI grading models (Phase 2 AI).
- **\[ \] Action 4:** Introduce Goal Templates for common use cases.

### **4.2: Team-Based Goals**

- **\[ \] Action 1:** Implement the UI for creating a team and inviting other users.
- **\[ \] Action 2:** Adapt the goal creation flow to allow for team-based goals.
- **\[ \] Action 3:** Build the voting mechanism for team-based grading of checkpoints.

### **4.3: Platform Polish**

- **\[ \] Action 1:** Build out the user settings and profile management pages.
- **\[ \] Action 2:** Create the comprehensive legal and Terms of Service pages.
- **\[ \] Action 3:** Implement a full suite of transactional emails (welcome email, password reset, upcoming deadline reminders).
- **\[ \] Action 4:** Develop an admin dashboard for basic user management and monitoring.
