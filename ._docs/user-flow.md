# **Threativator User Flow**

This document outlines the user journey through the Threativator application, from initial setup to the completion or failure of a goal. It is based on the features defined in the `project-overview.md`.

## **1.0 First-Time User: Onboarding & Setup**

This flow describes the journey of a new user from landing on the site to being fully set up and ready to create their first goal.

- **1.1. Sign Up:** User creates an account using standard authentication (email/password).
- **1.2. Welcome & Concept Explanation:** User is shown a brief, engaging walkthrough of the Threativator concept (setting stakes, consequences for failure).
- **1.3. Initial Setup Wizard:** The user is guided through a mandatory setup process before accessing the main dashboard.
  - **Step 1: Connect Payment Method:** User is prompted to connect their Stripe account to create their "Holding Cell." They must deposit an initial amount to proceed.
  - **Step 2: Upload Initial Kompromat:** User is required to upload at least one "Minor" and one "Major" piece of Kompromat. The UI clearly explains the difference and provides examples.
  - **Step 3: Add Initial Contacts:** User is prompted to add a few email contacts, with the ability to tag them as "Witness/Referee" and/or "Consequence Target."
  - **Step 4: Connect Social Media (Optional):** User is given the option to connect their Twitter account (for MVP). This step can be skipped.
- **1.4. Landing on Dashboard:** After completing the setup, the user lands on the main dashboard, which is now populated with their information (e.g., Holding Cell balance). The app is now ready for use.

## **2.0 Creating & Activating a New Goal**

This flow describes the process of a registered user setting up and committing to a new goal.

- **2.1. Initiate Goal Creation:** User clicks a "Create New Goal" button on the dashboard.
- **2.2. Define the Goal:**
  - **Path A (Template):** User selects a "Common Goal" template (e.g., "Write a Novel"). The goal title, rubric, and suggested checkpoints are pre-filled.
  - **Path B (Custom):** User manually enters their goal title, the final deadline, and writes a custom prompt to serve as the AI's grading rubric.
- **2.3. Set Checkpoints:**
  - If using a template, the user can accept the suggested weekly checkpoints or modify them.
  - If creating a custom goal, the user can add checkpoints manually or click "Generate Checkpoints" to have the AI suggest them.
- **2.4. Assign Stakes & Consequences (The Commitment Step):**
  - **Step 1: Set Monetary Stake:** The user allocates a specific amount from their "Holding Cell" to this goal. They must also select one of the three charities to receive the funds upon failure.
  - **Step 2: Assign Kompromat:** The user selects which of their uploaded Kompromat to attach to this goal's checkpoints ("Minor") and final deadline ("Major").
  - **Step 3: Choose Referee:** The user selects who will grade their submissions: the "AI Grader" (default) or a "Human Witness" from their contact list.
- **2.5. Activate Goal:** The user reviews a summary of the goal, deadlines, and all associated stakes. They click a final confirmation button, and the goal becomes active.
- **2.6. Goal Appears on Dashboard:** The main goal and all its checkpoints are now visible and color-coded on the dashboard calendar and in the "upcoming deadlines" sidebar.

## **3.0 The Active Goal Loop: Managing Deadlines**

This flow describes the primary loop of the app: submitting proof for an upcoming deadline.

- **3.1. Notification:** The user receives an email notification that a checkpoint or final deadline is approaching. The avatar for the goal type is featured in the email.
- **3.2. Initiate Submission:**
  - The user logs into the app.
  - They click on the upcoming deadline in either the calendar or the sidebar.
- **3.3. Submit Proof:**
  - A modal pops up with details of what needs to be submitted.
  - The user clicks "Submit Proof," uploads the required file(s) or links, and confirms the submission.
- **3.4. The Grading Process:**
  - **If AI Grader:** The submission is sent for AI analysis. The user sees a "Grading in Progress" status.
  - **If Human Witness:** The designated witness receives an email with a unique link to a page where they can vote "Pass" or "Fail." The user sees a "Waiting for Witness" status.
- **3.5. Outcome \- Pass:**
  - The user receives a "Congratulations\!" email.
  - The deadline on the dashboard is marked as complete (e.g., turns green).
  - The loop repeats for the next checkpoint, or the goal is marked as successfully completed if it was the final deadline.
- **3.6. Outcome \- Fail (AI Grader):**
  - The user receives a "Submission Failed" email explaining that the proof did not meet the rubric.
  - The deadline on the dashboard is marked as failed (e.g., turns red).
  - The user has the option to **resubmit** before the deadline passes or **contest** the decision (see Flow 4.2).

## **4.0 The Consequence Flow: Handling Failure**

This flow describes the different paths that occur when a deadline is not met.

- **4.1. Failure by Missing a Deadline:**
  - The system detects that a deadline has passed with no successful submission.
  - The appropriate consequence is triggered automatically (Russian Roulette for checkpoints, guaranteed for the final deadline).
  - The user receives the "Great dishonor" email, which is intentionally vague about humiliation consequences.
  - Upon next login, the user sees the "You've unfortunately failed" pop-up modal.
  - The failed deadline is archived, and the user continues with the next checkpoint or the goal is marked as "Failed."
- **4.2. Failure by AI Rejection (Contesting Path):**
  - The user's submission is failed by the AI, but the deadline has **not** yet passed.
  - The user clicks the "Contest AI Decision" button.
  - The UI instructs the user to have a friend sign up for Threativator and "Vouch" for them.
  - The user's friend creates an account, finds the user's goal page, and clicks "Vouch."
  - The AI failure is overridden, and the submission is marked as a "Pass." The user is notified.
- **4.3. Failure by Human Witness:**
  - The designated witness votes "Fail" on the submission.
  - This action is final and cannot be contested.
  - The submission is marked as failed, and the user must resubmit before the deadline or face the consequences as described in Flow 4.1.
