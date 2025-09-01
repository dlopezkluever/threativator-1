# **Threativator: Product Requirements Document (PRD)**

## **Overview**

Threativator is a quirky task management web application designed to combat procrastination and enforce self-discipline for significant personal and professional projects. It addresses the core problem of staying motivated on long-term goals where willpower alone is insufficient due to a lack of external authority or tangible consequences. The solution leverages negative reinforcement—the fear of financial loss or public humiliation—as a powerful, gamified catalyst for task completion.

This application is explicitly designed for finishing major, demonstrable projects, such as writing a novel, building a software MVP, or mastering a new skill. It is not intended to be a daily to-do list for minor, recurring habits. The primary audience includes individuals working on long-term goals who struggle with self-discipline (e.g., authors, students, developers), as well as freelancers, entrepreneurs, and remote workers who lack an external authority figure to maintain accountability.

## **Core Features**

### **1\. User & Contact Management**

- **What it does:** This feature set allows for user account creation and the management of personal contacts who play roles in the accountability process. It also handles integrations with third-party payment and social media platforms.
- **Why it's important:** It establishes the user's identity and builds the ecosystem of "referees" and "consequence targets" that are essential for the verification and threat mechanisms. The payment integration creates the financial stake.
- **How it works at a high level:** Users sign up for a standard account. They can then add email contacts and tag them with roles like "Witness" or "Consequence Target". A settings page allows users to connect their Stripe account to a personal "holding cell" for funds and optionally connect social media accounts like Twitter for use in consequences.

### **2\. Goal Setting & Management**

- **What it does:** This feature allows users to define a major, long-term goal with a final deadline and break it down into smaller, manageable checkpoints.
- **Why it's important:** This is the core planning phase where the user formalizes their objective. The self-set rubric is crucial because it defines the exact conditions for success or failure, giving the user control over their own destiny.
- **How it works at a high level:** A user creates a goal, either from a pre-configured template (e.g., "Write a Novel") or by creating a custom one. They must set a final deadline and can add intermediate checkpoints, either manually or by having an AI generate a suggested schedule. Critically, the user must define a "grading rubric" for success, which can be a template or a custom natural language prompt for the AI grader (e.g., "The submitted document must be at least 5,000 words long...").

### **3\. The "Threat" Mechanism**

- **What it does:** This is the core accountability engine of the application. It allows users to commit real-world stakes—money and "Kompromat" (embarrassing content)—to their goals.
- **Why it's important:** This mechanism provides the tangible, negative reinforcement that is missing in typical task managers. The fear of losing money or facing public humiliation serves as a powerful motivator to prevent procrastination.
- **How it works at a high level:** To activate a goal, a user must commit a monetary stake from their Stripe holding cell and upload "Kompromat" (images, videos, text files). Kompromat is categorized as "Minor" for checkpoints and "Major" for final deadlines. Upon failure of a checkpoint, a "Russian Roulette" system triggers with a 33% chance of either sending a portion of the money to a pre-selected charity or releasing Minor Kompromat to a random contact. Failure to meet the final deadline guarantees (100% chance) that the entire monetary stake is sent to charity and Major Kompromat is released via email or posted to the user's connected social media accounts.

### **4\. Submission & Verification**

- **What it does:** This feature provides the workflow for users to submit proof of their work and have it graded against their pre-defined rubric.
- **Why it's important:** It closes the loop on accountability. An objective grading process ensures that the user is held to the standards they set for themselves, making the consequences meaningful.
- **How it works at a high level:** Users submit proof via file uploads or links. At goal setup, they choose a grader: either the primary "AI Grader" or a "Human Witness". If AI is chosen, the system analyzes the submission against the rubric. If a human is chosen, an email is sent to a trusted contact who votes "Pass" or "Fail" via a unique link. If a user is failed by the AI, they have the option to contest the decision by having a friend sign up and "Vouch" for them, overriding the AI's failure.

### **5\. Team-Based Goals**

- **What it does:** This feature allows multiple users to collaborate on a single goal while maintaining individual accountability.
- **Why it's important:** It expands the application's use case to small teams, study groups, or partners who want to hold each other accountable for shared projects.
- **How it works at a high level:** A user creates a goal and invites others to join. Each team member sets their own individual stakes (money and Kompromat). For checkpoints, success can be determined by a team vote; if more than 50% of the team votes that a member failed to do their part, that individual's personal consequences are triggered.

### **6\. Notifications & User Engagement**

- **What it does:** This system keeps the user informed about their progress, upcoming deadlines, and the outcomes of their submissions and failures. It also injects the app's authoritative personality through Soviet KGB spy-themed avatars and stern, official copy.
- **Why it's important:** Timely notifications are critical for a deadline-driven app. The authoritative design elements create a disciplined experience that reinforces the accountability mechanism through official, state-like communication.
- **How it works at a high level:** The system sends automated emails for upcoming deadlines and pass/fail statuses. Failure notifications are intentionally mysterious about humiliation consequences to create tension. The UI uses a couple of KGB spy-style avatars consistently throughout the interface and a prominent in-app modal to announce failures with official, dramatic copy.

## **User Experience**

### **User Personas**

The target users are individuals who require strong external motivators to complete significant, long-term projects. They can be broadly categorized as:

- **The Creator:** Authors, developers, artists, and researchers working on a major project who struggle with the isolation and lack of imposed deadlines. They need a system to enforce a consistent work schedule.
- **The Entrepreneur/Freelancer:** Self-employed individuals and founders who lack an external boss or authority figure to maintain accountability for business-critical goals.
- **The Self-Improver:** Students, fitness enthusiasts, or skill-builders who are trying to achieve a difficult personal goal (e.g., pass an exam, lose weight, learn an instrument) and are prone to giving up without tangible consequences.

### **Key User Flows**

#### **1.0 First-Time User: Onboarding & Setup**

- 1.1. Sign Up:  
   User creates an account using standard email/password authentication.
- 1.2. Welcome & Concept Explanation:  
   The user is shown a brief, engaging walkthrough of the Threativator concept (setting stakes, consequences for failure).
- 1.3. Initial Setup Wizard:  
   A mandatory setup process guides the user before they can access the main dashboard.
  - **Step 1: Connect Payment Method:** The user connects their Stripe account to create their "Holding Cell" and must deposit an initial amount.
  - **Step 2: Upload Initial Kompromat:** The user is required to upload at least one "Minor" and one "Major" piece of Kompromat.
  - **Step 3: Add Initial Contacts:** The user is prompted to add email contacts, tagging them as "Witness/Referee" or "Consequence Target".
  - **Step 4: Connect Social Media (Optional):** The user can connect their Twitter account (for MVP), though this step can be skipped.
- 1.4. Landing on Dashboard:  
   Upon completion, the user lands on the main dashboard, which is populated with their information and ready for use.

#### **2.0 Creating & Activating a New Goal**

- 2.1. Initiate Goal Creation:  
   User clicks a "Create New Goal" button.
- 2.2. Define the Goal:  
   The user either selects a pre-filled "Common Goal" template or manually enters their goal title, deadline, and a custom grading rubric.
- 2.3. Set Checkpoints:  
   The user accepts, modifies, or creates intermediate checkpoints, with an option to have the AI suggest them.
- **2.4. Assign Stakes & Consequences:**
  - **Step 1: Set Monetary Stake:** The user allocates funds from their "Holding Cell" and selects a charity for potential forfeiture.
  - **Step 2: Assign Kompromat:** The user attaches specific Kompromat to the goal's checkpoints and final deadline.
  - **Step 3: Choose Referee:** The user selects either the "AI Grader" or a "Human Witness" from their contact list.
- 2.5. Activate Goal:  
   The user reviews a summary of all stakes and consequences and gives final confirmation, making the goal active.
- 2.6. Goal Appears on Dashboard:  
   The goal and its checkpoints become visible on the dashboard calendar and "upcoming deadlines" sidebar.

#### **3.0 The Active Goal Loop: Managing Deadlines**

- 3.1. Notification:  
   The user receives an email notification that a deadline is approaching.
- 3.2. Initiate Submission:  
   The user logs in and clicks on the upcoming deadline in the calendar or sidebar.
- 3.3. Submit Proof:  
   A modal appears, and the user uploads the required files or links to prove their work.
- 3.4. The Grading Process:  
   The submission status shows as "Grading in Progress" (for AI) or "Waiting for Witness" (for human grading).
- 3.5. Outcome \- Pass:  
   The user receives a congratulatory email, and the deadline is marked as complete on the dashboard.
- 3.6. Outcome \- Fail (AI Grader):  
   The user receives a "Submission Failed" email. They have the option to resubmit before the deadline passes or contest the AI's decision.

#### **4.0 The Consequence Flow: Handling Failure**

- 4.1. Failure by Missing a Deadline:  
   The system detects a missed deadline and automatically triggers the appropriate consequence (Russian Roulette or guaranteed). The user receives a vague "Great dishonor" email and sees a failure modal upon their next login.
- 4.2. Failure by AI Rejection (Contesting Path):  
   If an AI fails a submission before the deadline passes, the user can click "Contest AI Decision". This requires them to get a friend to sign up for an account and click a "Vouch" button on the goal page, which overrides the failure.
- 4.3. Failure by Human Witness:  
   If a designated witness votes "Fail," the action is final and cannot be contested. The user must resubmit before the deadline to avoid consequences.

### **UI/UX Considerations**

#### **1\. Core Design Principles**

1. **Authoritative & Unambiguous Tone:** The design follows Soviet Constructivist principles with rigid structure and clear hierarchy. Information is presented with strong lines, boxes, and a clear grid system. The UI feels stern, official, and powerful—a tool for discipline, not entertainment. Deadlines are presented as commands, not suggestions, through stark visual hierarchy.

2. **Direct & Imperative Communication:** All microcopy uses direct, imperative language with uppercase **STALINIST ONE** typography for headings and button text (e.g., "SUBMIT PROOF," "COMMIT STAKES"). The tone is that of a state authority enforcing discipline, using symbolism over frivolous decoration.

3. **Impactful Feedback & Consequences:** User actions feel significant through high-contrast visual feedback. Success states use muted colors (`Success-Muted`: `#5A7761`) while failures use bold, unmissable red (`Primary-Red`: `#DA291C`). The "Russian Roulette" moment feels mechanical and tense—like an official stamp process rather than a game.

4. **Functional Clarity & Trust:** Zero ambiguity in high-stakes interactions. Confirmation modals use official document styling with brutal clarity: "COMRADE, YOU ARE COMMITTING: **$100** AND **FILE: K-01.JPG**. FAILURE IS NOT AN OPTION. CONFIRM DIRECTIVE." Security elements use vault metaphors with "SECURE STATE ARCHIVE" messaging.

#### **2\. Component-Specific Rules**

- **Buttons:** Hard-edged rectangles with **zero border radius** (`border-radius: 0px`). Primary buttons use `Primary-Red` (#DA291C) with solid fill. Secondary buttons use outlined or muted styling. All button text rendered in uppercase **STALINIST ONE** typography. Sharp, functional animations only—no bouncy or playful effects.

- **Modals & Pop-ups:** Designed as official communiqués or stamped documents with hard black borders (1px or 2px solid), clear titles, and structured content. Sharp fade-in animations only. No soft shadows—design relies on stark color contrast and strong lines.

- **Dashboard & Calendar:** Rigid, 8-point grid-based layout with "IMMEDIATE DIRECTIVES" (upcoming deadlines) sidebar as primary focus. Calendar uses simple, stark grid of days. Clicking deadlines triggers submission modal instantly without playful transitions. Stakes always visible like official state records.

- **Forms & Inputs:** Simple, rectangular input fields with clear borders and **zero rounded corners**. Labels positioned directly above inputs in uppercase formatting. Background uses `Background-Parchment` (#F5EEDC) for aged document feel.

- **Notifications & Feedback:** High-contrast feedback with KGB spy-themed avatars. Success uses `Success-Muted` (#5A7761), failures use `Primary-Red` (#DA291C). Minimalist animations with sharp transitions that feel mechanical rather than celebratory.

#### **3\. Visual Theme & Style Guide (Soviet Constructivist)**

- **Color Palette (Minimalist & High-Contrast):**
  - `Primary-Red`: `#DA291C` - Dominant color for primary buttons, headings, active states, critical alerts, and failure states
  - `Accent-Black`: `#000000` - Body text, secondary UI elements, and illustration fills
  - `Background-Parchment`: `#F5EEDC` - Main background giving aged paper/official document feel
  - `Container-Light`: `#FFFFFF` - Sparingly used for containers/inputs needing contrast against parchment
  - `Text-Primary`: `#000000` - All primary text content
  - `Text-Muted`: `#333333` - Less important text (used minimally to maintain high contrast)
  - `Success-Muted`: `#5A7761` - Militaristic green for successful submissions (functional, not celebratory)

- **Typography (Bold & Impactful):**
  - **Headings:** **Stalinist One** (Google Fonts) - All `<h1>`, `<h2>`, `<h3>` tags, button text, major UI titles. **Always UPPERCASE**
  - **Body Text:** **Roboto Condensed** (Google Fonts) - Paragraphs, labels, descriptions. Condensed nature allows efficient space usage

- **Iconography & Illustrations:** Stark, single-color (black or red) icons reminiscent of woodblock prints or stencils. Custom SVG format for unique aesthetic. KGB spy-style avatars in high-contrast, graphic style for consistent personality expression.

- **Layout & Spacing:** Strict 8-point grid system (all spacing/sizing in multiples of 8px) enforces structured, authoritative feel. Consistent container padding (16px or 24px) maintains order and structure.

- **Borders & Shadows (Critical Design Rule):**
  - **Zero border radius** - All elements (buttons, inputs, containers) have sharp 90-degree corners (`border-radius: 0px`)
  - Simple solid black borders (1px or 2px) define containers and separate sections
  - **No shadows whatsoever** - Design relies entirely on stark color contrast and strong geometric lines, avoiding any depth effects

## **Technical Architecture**

### **1\. Core Stack**

| Category     | Technology                     | Role                                                                                      |
| :----------- | :----------------------------- | :---------------------------------------------------------------------------------------- |
| **Language** | **TypeScript**                 | Provides static typing for the entire codebase.                                           |
| **Frontend** | **React** (with Vite)          | The UI library for building the web interface.                                            |
| **UI Kit**   | **Magic UI** (on Tailwind CSS) | For animated, pre-styled components that enhance the app's personality.                   |
| **Backend**  | **Supabase**                   | Backend-as-a-Service for the database, authentication, storage, and serverless functions. |
| **AI/ML**    | **Google Gemini API**          | For analyzing user submissions against their defined rubrics.                             |

Export to Sheets

### **2\. Frontend Development**

- **React & TypeScript with Vite:**
  - **Best Practices:** Exclusively use functional components with Hooks. Enforce strict TypeScript types for all props, state, and API responses.
  - **Conventions:** Structure the project by feature (e.g., `/features/goals`). Use Vite for its fast development server and optimized build process.
- **Magic UI (with Tailwind CSS):**
  - **Best Practices:** Leverage Magic UI for modals, notifications, and visual feedback to enhance the "fun and quirky" nature of the app. Use the underlying Tailwind CSS utility classes for all custom styling and layouts.
  - **Conventions:** Install Magic UI components individually into the `/components/magic` directory to prevent project bloat.

### **3\. Backend & Services**

- **Supabase (The All-in-One Backend):**
  - **Best Practices:** Enable Row Level Security (RLS) on ALL tables, with policies ensuring users can only access their own data via `auth.uid() = user_id`. Use Supabase's real-time functionality to instantly reflect data changes in the UI.
  - **Conventions:** Use Supabase's built-in Auth for user management. Define the database schema with clear foreign key relationships.
  - **Complex Logic:** Avoid complex queries directly from the client; instead, create database functions (`pl/pgsql`) and call them via RPC.
- **Supabase Storage (File & "Kompromat" Management):**
  - **Best Practices:** Apply strict RLS policies to storage buckets so a user can only upload to and read from a folder matching their `user_id`.
  - **Conventions:** Organize storage by user, with a main folder for each `user_id` and subfolders for `kompromat`, `submissions`, etc..
- **Supabase Edge Functions & `pg_cron` (Scheduled Jobs):**
  - **Best Practices:** Use `pg_cron` to schedule a lightweight database function that runs every 5 minutes. This function's sole purpose is to invoke a Supabase Edge Function which contains the complex logic for checking deadlines and triggering consequences.
  - **Conventions:** Use a `deadline_checks` table to log job runs and prevent double-triggering of consequences.

### **4\. APIs and Integrations**

- **Stripe (Payment Processing):**
  - **Best Practices:** Never handle Stripe API keys on the client side; all API calls must be made from secure Supabase Edge Functions. Use  
     `Stripe Connect` to manage payouts to charities.
  - **Webhook Security:** The webhook endpoint must verify the Stripe signature on every single request to prevent fraud.
- **SendGrid (Transactional Email Service):**
  - **Best Practices:** Trigger all emails from Supabase Edge Functions. Properly authenticate the sending domain with SPF and DKIM records to maximize deliverability.
  - **Conventions:** Use SendGrid's dynamic templates to manage email content without requiring new code deployments.
- **Twitter API (Social Media Integration \- MVP):**
  - **Best Practices:** Use OAuth 2.0 Authorization Code Flow with PKCE to securely obtain user permission. Store user  
     `access_token` and `refresh_token` encrypted in the database.
  - **Conventions:** All API calls to Twitter must originate from Supabase Edge Functions.
- **Google Gemini API (AI Submission Analysis):**
  - **Best Practices:** Never expose the Gemini API key on the client; all calls must be made from a secure Supabase Edge Function. Perform simple checks (like word count) in the Edge Function  
     _before_ calling the API to reduce costs.
  - **Conventions:** Construct clear, specific, and non-ambiguous prompts to get reliable results. Sanitize user-created rubrics before including them in prompts to prevent prompt injection.

## **Development Roadmap**

### **MVP Scope Definition**

- **Monetary Consequences:** The initial MVP will be limited to sending forfeited funds to one of three pre-set charities.
- **Social Media Integration:** Will launch with Twitter integration only.
- **AI Analyzer Capabilities:** The AI's analysis will be limited to simple, quantitative checks: word count for documents, commit history for code repositories, and Optical Character Recognition (OCR) to read numbers from a scale in a photo.

### **Future Release Scope**

- **Advanced AI:** Later development will focus on a more sophisticated AI capable of qualitative analysis (e.g., judging text coherence or verifying form in a workout video).
- **Person-to-Person Payments:** A system to send penalty funds to a random contact via a secure claim link, with a policy for handling unclaimed funds.
- **Expanded Social Media:** Integrations for Facebook and LinkedIn will be added.

### **Phase 1: Project Setup & Core Infrastructure (Barebones)**

**Goal:** Establish the foundational architecture and a minimally running application to ensure all core services can communicate.

- **1.1: Environment & Tooling Setup**  
  \*DONE: We have already set up a React project using Vite with the TypeScript template.
  - Set up the project repository on GitHub with branch protection rules.
  - Configure ESLint, Prettier, and TypeScript for strict code quality.
  - Install and configure Tailwind CSS.
- **1.2: Supabase Backend Initialization**
  - Create a new Supabase project.
  - Write the initial database migration script to create all tables.
  - Implement basic Row Level Security (RLS) policies for all tables.
  - Set up the Supabase client in the React app and establish a connection.
  - Implement a basic "health check" page to confirm connectivity.

### **Phase 2: The MVP (Minimal Viable Product)**

**Goal:** Deliver the core user journey: sign up, create a goal with stakes, submit proof, and have it graded by the AI.

- **2.1: User Onboarding & Authentication**
  - Build the sign-up and login pages using Supabase Auth.
  - Create the mandatory multi-step onboarding wizard.
  - Integrate Stripe Elements for connecting a payment method.
  - Implement the "Upload Initial Kompromat" step using Supabase Storage.
  - Create the UI for adding initial contacts.
- **2.2: Core Goal Management**
  - Develop the main dashboard UI with a functional "Upcoming Deadlines" list.
  - Build the multi-step "Create New Goal" flow.
  - Implement logic for assigning monetary stakes and Kompromat to a goal.
  - Ensure new goals are correctly saved and displayed on the dashboard.
- **2.3: Submission & AI Grading Loop**
  - Build the "Submit Proof" modal with file upload capability to Supabase Storage.
  - Create the  
     `gradeSubmission` Supabase Edge Function.
  - Integrate the Google Gemini API within the Edge Function for MVP-level analysis.
  - Implement logic to update submission status based on the AI's response.
  - Use Supabase real-time subscriptions to automatically update the UI.
- **2.4: Basic Notifications**
  - Create a Supabase Edge Function to handle email sending via SendGrid.
  - Implement triggers for "Submission Passed" and "Submission Failed" emails.
  - Set up dynamic email templates in SendGrid.

### **Phase 3: Consequences & Gamification (Polish & Core Loop Expansion)**

**Goal:** Implement the "threat" part of Threativator, making consequences real and introducing key gamified elements.

- **3.1: Deadline & Consequence Engine**
  - Set up  
     `pg_cron` in Supabase to run a scheduled job every 5 minutes.
  - Create the  
     `triggerConsequence` Edge Function to check for missed deadlines.
  - Implement monetary consequence logic (Stripe payout to charity).
  - Implement humiliation consequence logic (email Kompromat to a contact).
  - Implement the "Great dishonor" email and the in-app failure modal.
- **3.2: Gamified UI Elements**
  - Implement the "Russian Roulette" animated sequence for checkpoint failures.
  - Build out the full, interactive dashboard calendar.
  - Integrate custom avatars throughout the UI and notifications.
  - Add specified Magic UI animations to buttons, modals, and notifications.
  - Implement the "Visible Stakes" component on the dashboard.
- **3.3: Social Integration (MVP)**
  - Implement the OAuth flow for connecting a user's Twitter account.
  - Securely store and manage user access tokens.
  - Extend the  
     `triggerConsequence` function to handle posting "Major" Kompromat to Twitter.

### **Phase 4: Advanced Features & Scalability (Post-MVP)**

**Goal:** Enhance the core product with features that expand its use cases and improve user experience.

- **4.1: Advanced Grading & Referee Options**
  - Implement the "Human Witness" grading flow.
  - Build the "Contest AI Decision" flow with the "Vouch" functionality.
  - Begin R\&D on advanced AI grading models.
  - Introduce Goal Templates for common use cases.
- **4.2: Team-Based Goals**
  - Implement the UI for creating a team and inviting users.
  - Adapt the goal creation flow for team-based goals.
  - Build the voting mechanism for team-based grading.
- **4.3: Platform Polish**
  - Build out user settings and profile management pages.
  - Create comprehensive legal and Terms of Service pages.
  - Implement a full suite of transactional emails (welcome, password reset, etc.).
  - Develop an admin dashboard for basic monitoring.

## **Risks and Mitigations**

- **Risk:** Forgetting or misconfiguring Row Level Security (RLS) policies, leading to a critical data breach.
  - **Mitigation:** Enable RLS on ALL tables from the start. All policies must be written and thoroughly tested to ensure users can only access their own data.
- **Risk:** Stripe API keys being exposed on the client side, allowing for fraudulent transactions.
  - **Mitigation:** Enforce a strict rule that all Stripe API calls must be made from secure Supabase Edge Functions. The client should only ever receive a temporary  
     `client_secret` to complete a payment.
- **Risk:** Webhook endpoints for Stripe receiving fraudulent calls, leading to incorrect financial processing.
  - **Mitigation:** The webhook endpoint must verify the Stripe signature on every single request it receives, without exception.
- **Risk:** A user revoking the app's Twitter permissions, causing the social media consequence to fail.
  - **Mitigation:** The consequence logic must gracefully handle API errors related to invalid or expired tokens and log the failure appropriately.
- **Risk:** High volume of simultaneous failures causing the app to hit Twitter's API rate limits.
  - **Mitigation:** The consequence logic should queue posts rather than sending them all at once if a large batch of failures is detected.
- **Risk:** Uncontrolled Google Gemini API calls leading to high operational costs.
  - **Mitigation:** Implement sanity checks and limits on the size and type of files submitted for analysis. Perform simple checks (e.g., word count) inside the Edge Function before making an API call to avoid unnecessary costs.
- **Risk:** Users manipulating the AI's grading with "prompt injection" by writing malicious instructions in their custom rubric.
  - **Mitigation:** Sanitize all user-provided rubric text before including it in the final prompt sent to the Gemini API to ensure it cannot override the core instructions.
- **Risk:** Large file uploads (especially video) being costly for storage and slow for users.
  - **Mitigation:** For the MVP, enforce a reasonable file size limit (e.g., 10MB) on all uploads.
- **Risk:** Excessive use of animations harming application performance and accessibility.
  - **Mitigation:** Use motion strategically to enhance the user experience, not distract from it. All animations must be tested for performance impact.
