# **Threativator: Official Tech Stack & Implementation Guide**

This document defines the official technology stack for the Threativator application and provides a guide with best practices, conventions, and important considerations for each component. Adhering to these guidelines will ensure a consistent, secure, and scalable development process.

## **1\. Core Stack**

| Category     | Technology                     | Role                                            |
| ------------ | ------------------------------ | ----------------------------------------------- |
| **Language** | **TypeScript**                 | Provides static typing for the entire codebase. |
| **Frontend** | **React** (with Vite)          | The UI library for building the web interface.  |
| **UI Kit**   | **Magic UI** (on Tailwind CSS) | For animated, pre-styled components.            |
| **Backend**  | **Supabase**                   | Backend-as-a-Service (database, auth, etc.).    |
| **AI/ML**    | **Google Gemini API**          | For analyzing user submissions.                 |

## **2\. Frontend Development**

### **React & TypeScript with Vite**

- **Best Practices:**
  - Exclusively use functional components with Hooks (`useState`, `useEffect`, etc.).
  - Enforce strict TypeScript types for all props, state, and API responses to prevent runtime errors.
- **Conventions:**
  - Structure the project by feature (e.g., `/features/goals`, `/features/auth`).
  - Use Vite for its fast development server and optimized build process.

### **Magic UI (with Tailwind CSS)**

- **Best Practices:**
  - Leverage Magic UI to enhance the "fun and quirky" nature of the app. Ideal for modals, notifications, buttons, and visual feedback on submissions.
  - Use the underlying Tailwind CSS utility classes for all custom styling and layout to maintain a consistent design system.
- **Conventions:**
  - Install Magic UI components individually into the `/components/magic` directory as needed. This prevents bloating the project with unused code.
- **Limitations & Pitfalls:**
  - Magic UI is a component collection, not an exhaustive library. Complex components like the main calendar view will need to be built from scratch using Tailwind CSS or a dedicated calendar library.
  - **Avoid over-animation.** Use motion to enhance the user experience, not distract from it. Excessive animation can harm performance and accessibility.

## **3\. Backend & Services**

### **Supabase (The All-in-One Backend)**

- **Best Practices:**
  - **Enable Row Level Security (RLS) on ALL tables.** This is the most critical security practice. Policies must be written to ensure users can only access and modify their own data, using `auth.uid() = user_id`.
  - Use Supabase's real-time functionality to instantly reflect data changes in the UI (e.g., a friend vouching for a submission).
- **Conventions:**
  - Use Supabase's built-in Auth for email/password sign-up and user management.
  - Define the database schema with clear foreign key relationships to ensure data integrity (e.g., a `checkpoint` must belong to a `goal`).
- **Pitfalls:**
  - Forgetting or misconfiguring RLS policies is the biggest risk. Test policies thoroughly.
  - Avoid calling complex database queries directly from the client. Create database functions (`pl/pgsql`) for complex logic and call them via RPC.

### **Stripe (Payment Processing)**

- **Best Practices:**
  - **Never handle Stripe API keys on the client side.** All Stripe API calls must be made from secure Supabase Edge Functions. The client should only ever receive a temporary `client_secret` to complete a payment.
  - Use `Stripe Connect` to manage payouts to charities, as it simplifies compliance and financial reporting.
- **Conventions:**
  - Store Stripe customer IDs in the `users` table to link users to their payment information.
- **Pitfalls:**
  - **Webhook security is paramount.** The webhook endpoint (an Edge Function) that receives events from Stripe must verify the Stripe signature on every single request to prevent fraudulent calls.

### **Supabase Storage (File & "Kompromat" Management)**

- **Best Practices:**
  - Apply strict RLS policies to storage buckets. A user should only be able to upload to a folder matching their `user_id` and read files from that same folder.
- **Conventions:**
  - Organize storage by user: create a main folder for each `user_id`, with subfolders for `kompromat`, `submissions`, etc.
- **Pitfalls:**
  - Large file uploads (especially video) can be costly and slow. For the MVP, enforce a reasonable file size limit (e.g., 10MB) on uploads.

### **SendGrid (Transactional Email Service)**

- **Best Practices:**
  - Trigger all emails from Supabase Edge Functions. Do not attempt to send emails from the client.
  - Properly authenticate your domain with SendGrid (using SPF and DKIM records) to maximize deliverability and avoid the spam folder.
- **Conventions:**
  - Use SendGrid's dynamic templates to manage email content. This allows for editing email copy without a new code deployment.
- **Limitations:**
  - The free tier has daily/monthly sending limits. Monitor your usage as the app grows to decide when to upgrade.

### **Twitter API (Social Media Integration \- MVP)**

- **Best Practices:**
  - Use the OAuth 2.0 Authorization Code Flow with PKCE to securely obtain user permission to post on their behalf.
  - Store user `access_token` and `refresh_token` encrypted in the database.
- **Conventions:**
  - All API calls to Twitter must originate from Supabase Edge Functions.
- **Pitfalls:**
  - A user can revoke your app's permissions at any time. Your consequence logic must gracefully handle API errors related to invalid or expired tokens.
  - Be aware of Twitter's API rate limits. If many users fail at once, your logic should queue posts rather than sending them all simultaneously.

### **Supabase Edge Functions & `pg_cron` (Scheduled Jobs)**

- **Best Practices:**
  - `pg_cron` should be used to schedule a simple, lightweight database function that runs frequently (e.g., every 5 minutes).
  - This database function's only job is to invoke a Supabase Edge Function, which contains the complex logic for checking deadlines and triggering consequences.
- **Conventions:**
  - Create a `deadline_checks` table to log when the job runs and which deadlines it processed to prevent accidental double-triggering of a consequence.
- **Limitations:**
  - Edge Functions have execution time limits. Ensure your consequence logic is efficient and can complete within the allowed time. This is not expected to be an issue for this project.

### **Google Gemini API (AI Submission Analysis)**

- **Best Practices:**
  - **Never expose your Gemini API key on the client.** All calls must be made from a secure Supabase Edge Function.
  - For the MVP, use the Gemini API for its specific strengths (OCR, basic text analysis). For simple tasks like word count, perform that check in the Edge Function _before_ calling the API to reduce costs.
- **Conventions:**
  - Construct clear, specific, and non-ambiguous prompts based on the user's rubric to get the most reliable results.
- **Pitfalls:**
  - **Cost Management:** Gemini API calls cost money. Implement sanity checks and limits on the size and type of files that can be submitted for analysis.
  - **Prompt Injection:** Sanitize user-created rubrics before including them in your API prompt to prevent users from overriding your core instructions to the AI.
