### **Project Requirements Document (PRD)**

**\# Project Name** Threativator

**\#\# 1\. Project Description & Core Principles** Threativator is a quirky task management web application designed to combat procrastination and enforce self-discipline for significant personal and professional projects.

- **Problem Statement:** It addresses the challenge of staying motivated without external authority or tangible consequences, where willpower alone is insufficient.
- **Core Solution:** It leverages negative reinforcement—the fear of financial loss or public humiliation—as a powerful, gamified catalyst for task completion.
- **Guiding Principle:** Threativator is explicitly designed for finishing major projects or acquiring demonstrable skills (e.g., "submit a video playing a full song," "deploy a functional app MVP"). It is **not** intended to be a daily to-do list for minor, recurring habits.

**\#\# 2\. Target Audience**

- Individuals working on long-term goals who struggle with self-discipline (e.g., authors, students, developers).
- Freelancers, entrepreneurs, and remote workers who lack an external authority figure to maintain accountability.

**\#\# 3\. Desired Features**

**\#\#\# 3.1. User & Contact Management**

- **\[ \] User Accounts:** Standard user authentication for sign-up and login.
- **\[ \] Contact Management:** A dedicated section where users can create and manage a list of email contacts. Each contact can be tagged for different roles:
  - **\[ \] Witnesses/Referees:** People designated to manually verify task completion.
  - **\[ \] Consequence Targets:** A pool of contacts who are potential recipients of humiliation-based consequences.
- **\[ \] Third-Party Integrations:** A settings page for users to optionally connect their personal social media accounts (Twitter, Facebook, LinkedIn) for use in consequences.
- **\[ \] Wallet/Holding Cell:** A dashboard section for users to connect a payment method (via Stripe) and deposit funds into their personal "holding cell."

**\#\#\# 3.2. Goal Setting & Management**

- **\[ \] Goal Creation:** Users can define a specific, long-term goal or project with one final, major deadline.
- **\[ \] Goal Templates:** The system will offer a list of "common goals" (e.g., "Write a Novel," "Lose 15 lbs," "Build a Web App") with pre-configured rubric templates and suggested checkpoint schedules.
- **\[ \] Checkpoints (Sub-deadlines):**
  - **\[ \] Manual Creation:** Users can set their own intermediate checkpoints.
  - **\[ \] AI-Generated Checkpoints:** Users can have the AI suggest a logical, weekly checkpoint schedule to break down the main goal.
- **\[ \] Self-Set Grading Rubric:** For each goal, the user must define the standards for success. This can be done by:
  - **\[ \] Selecting a Template:** Using a pre-written rubric from a Goal Template.
  - **\[ \] Custom Prompt:** Writing a detailed, natural language prompt for the AI to use as its grading instructions (e.g., "The submitted document must be at least 5,000 words long and be about medieval history.").

**\#\#\# 3.3. The "Threat" Mechanism**

- **\[ \] Collateral Commitment:** To activate a goal, a user must commit both a monetary stake from their holding cell and upload "Kompromat."
- **\[ \] "Kompromat" Holding System:**
  - **\[ \] Uploads:** A secure area where users can upload materials. Supported formats include images, videos, and text files (.txt, .doc).
  - **\[ \] Content Examples:** The intent is for "funny and embarrassing" content, not genuinely life-ruining material (e.g., awkward photos, cringeworthy poetry, a pre-written angry letter to an ex).
  - **\[ \] Categorization:** Users must categorize each piece of Kompromat as "Minor" (for checkpoints) or "Major" (for final deadlines).
- **\[ \] Monetary Consequences:**
  - **\[ \] Destination:** The user must pre-select a destination for forfeited funds: one of three pre-set, vetted charities.
  - **\[ \] Checkpoint Failure:** A "Russian Roulette" system is triggered. There is a **1-in-3 (33%) chance** that a portion of the user's monetary stake is sent to the chosen charity.
  - **\[ \] Major Deadline Failure:** The consequence is **guaranteed (100%)**. The entire monetary stake for the goal is sent to the chosen charity.
- **\[ \] Humiliation Consequences:**
  - **\[ \] Checkpoint Failure:** A "Russian Roulette" system is triggered. There is a **1-in-3 (33%) chance** that a "Minor" Kompromat is released to a random contact from the user's "Consequence Targets" list.
  - **\[ \] Major Deadline Failure:** The consequence is **guaranteed (100%)**. A "Major" Kompromat is released via one or both of the following methods:
    - **\[ \] Email:** Sent to a more sensitive, user-defined contact (e.g., a boss, a parent).
    - **\[ \] Social Media:** Posted simultaneously to the official "Threativator" social media page and the user's connected personal account(s). The post on the Threativator page will be permanent, even if the user deletes it from their own page.
- **\[ \] Security:** All user-uploaded Kompromat must be securely encrypted at rest.

**\#\#\# 3.4. Submission & Verification**

- **\[ \] Submission Formats:** The system will accept various forms of proof, including file uploads (.pdf, .zip, .png) and links to external sites (e.g., GitHub).
- **\[ \] Grading Referees:** Proof is assessed by one of the following, chosen by the user at goal setup:
  - **\[ \] AI Grader:** The primary method. The AI analyzes the submission against the user-defined rubric. (See MVP Scope for capability details).
  - **\[ \] Human Witness:** An email is sent to a user-selected "Witness." The witness clicks a unique link to a simple page where they can vote "Pass" or "Fail."
- **\[ \] Contesting an AI Decision:** If a user's submission is failed by the AI, they can contest it.
  - **\[ \] The process requires the user to get a trusted friend to sign up for a Threativator account.**
  - **\[ \] Once registered, the friend can navigate to the user's goal page and click a "Vouch" button to override the AI's failure.** The social friction of this process is the intended deterrent.

**\#\#\# 3.5. Team-Based Goals**

- **\[ \] Team Creation:** Users can create a goal and invite other users to join as a team.
- **\[ \] Individual Accountability:** Each team member sets their own individual stakes (money and Kompromat).
- **\[ \] Team-Based Grading:** For team checkpoints, success can be determined by a team vote. If more than 50% of the team members vote that an individual did not complete their portion of the task, that individual's personal consequences are triggered.

**\#\#\# 3.6. Notifications & User Engagement**

- **\[ \] Standard Notifications:** Automatic emails for upcoming deadlines and submission status (pass/fail).
- **\[ \] Failure Notification:**
  - **\[ \] Email:** An email is sent summarizing the failure. For humiliation consequences, the email **will not** specify what was sent or to whom, creating mystery.
  - **\[ \] In-App Popup:** Upon next login after a failure, a modal appears with the message: "You've unfortunately failed. We have sent these out. This is great shame. Great dishonor comes on you, but hopefully this will only make you better, friend."
- **\[ \] Avatars:** The UI and notifications will feature themed avatars to enhance the app's personality.
  - **\[ \] Examples:** A "boss" for professional work, a "gym trainer" (e.g., resembling Dwayne "The Rock" Johnson) for fitness goals, an "art critic" for creative projects.

**\#\# 4\. Design & UI/UX Requests**

- **\[ \] Core Layout:** The UI will be simple, focusing on three main components: a large central calendar view, an "upcoming deadlines" sidebar, and prominent dashboard buttons.
- **\[ \] Dashboard:**
  - **\[ \] Calendar:** A full-month calendar view with the ability to swipe between months, and a 7-day view. Deadlines and checkpoints will be color-coded.
  - **\[ \] Deadlines Sidebar:** A list of the "nearest two days" most critical deadlines. Each item will show the date, a brief description, and be clickable.
  - **\[ \] Action Buttons:** Prominent, easily accessible buttons to "Add Funds," "Upload Kompromat," and "Manage Contacts."
- **\[ \] Submission Flow:**
  - **\[ \] Step 1:** User clicks a deadline from the calendar or the sidebar.
  - **\[ \] Step 2:** A pop-up modal appears, showing more information about what is due.
  - **\[ \] Step 3:** The modal contains a button to "Submit Proof," which leads to the submission form.

**\#\# 5\. MVP Scope & Phased Rollout**

- **\[ \] Initial MVP \- Monetary Consequences:** Limited to sending funds to one of three pre-set charities. Person-to-person payments will be a future release.
- **\[ \] Initial MVP \- Social Media Integration:** Will launch with Twitter integration only. Facebook and LinkedIn integrations will be added in future releases.
- **\[ \] Initial MVP \- AI Analyzer Capabilities:** The AI's analysis will be limited to simple, quantitative checks:
  - **\[ \] Documents:** Verifies word count.
  - **\[ \] Code Repositories:** Verifies commit history/activity.
  - **\[ \] Photos:** Uses Optical Character Recognition (OCR) to read numbers from a scale.
- **\[ \] Future Release \- Advanced AI:** Later development will focus on a more sophisticated AI capable of qualitative analysis (e.g., judging text coherence, code functionality, or verifying form in a workout video).
- **\[ \] Future Release \- Person-to-Person Payments:**
  - **\[ \] Functionality:** A system to send penalty funds to a random contact via a secure claim link.
  - **\[ \] Recipient Experience:** The email will state: "Your friend \[User's Name\] failed a personal goal and, as a consequence, you get their $\[Amount\] penalty\! Click here to claim it."
  - **\[ \] Unclaimed Funds Policy:** A 15-day claim period. If unclaimed, funds will be split: 50% to a default charity and 50% to the platform operator.

**\#\# 6\. Other Notes**

- **\[ \] Tech Stack:** React and Vite (frontend), Supabase (backend).
- **\[ \] Legal:** A comprehensive Terms of Service and legal page is required. It must be transparent about all consequence mechanisms, the app's intended "fun" purpose, and the future policy for retaining 50% of unclaimed funds. It must explicitly state the app is not for genuine blackmail.
