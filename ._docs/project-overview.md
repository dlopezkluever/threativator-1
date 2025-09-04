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

- **\[ \] Collateral Commitment:** To activate a goal, users can commit kompromat (required) and optionally add monetary stakes for enhanced accountability. *(Monetary stakes are optional for MVP - kompromat provides primary accountability mechanism.)*
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

**\#\#\# 3.5. Team-Based Goals** 🚧 *POST-MVP STRETCH GOAL*

- **\[ \] Team Creation:** Users can create a goal and invite other users to join as a team.
- **\[ \] Individual Accountability:** Each team member sets their own individual stakes (money and Kompromat).
- **\[ \] Team-Based Grading:** For team checkpoints, success can be determined by a team vote. If more than 50% of the team members vote that an individual did not complete their portion of the task, that individual's personal consequences are triggered.
- **⚠️ MVP STATUS:** This feature is **deferred to post-MVP release** to simplify initial database architecture and focus on perfecting individual accountability mechanisms first.

**\#\#\# 3.6. Notifications & User Engagement**

- **\[ \] Standard Notifications:** Automatic emails for upcoming deadlines and submission status (pass/fail).
- **\[ \] Failure Notification:**
  - **\[ \] Email:** An email is sent summarizing the failure. For humiliation consequences, the email **will not** specify what was sent or to whom, creating mystery.
  - **\[ \] In-App Popup:** Upon next login after a failure, a modal appears with official, Soviet-style messaging: "CONSEQUENCE TRIGGERED. STATE DIRECTIVE HAS BEEN EXECUTED. GREAT DISHONOR COMES UPON YOU, COMRADE. LEARN FROM THIS FAILURE."
- **\[ \] Avatars:** The UI and notifications will feature Soviet KGB spy-style avatars to reinforce the app's authoritative personality.
  - **\[ \] Style:** High-contrast, graphic-style avatars drawn in stark, single-color (black or red) format reminiscent of woodblock prints or stencils. Custom SVG format maintains the unique Soviet Constructivist aesthetic.
  - **\[ \] Usage:** Consistently used in modals, emails, and notifications to provide personality while maintaining the official, state authority tone.

**\#\# 4\. Design & UI/UX Requests (Soviet Constructivist Style)**

### **4.1. Core Design Principles**

- **[✅] Authoritative State Surveillance Interface:** Dashboard successfully implements Soviet Constructivist principles with geometric precision and state authority. Features thick 6px borders, zero rounded corners, and intimidating official aesthetics that command respect and compliance.
- **\[ \] Direct & Imperative Communication:** All microcopy uses direct, imperative language with uppercase **STALINIST ONE** typography for headings and buttons (e.g., "SUBMIT PROOF," "COMMIT STAKES"). Tone of state authority enforcing discipline.
- **\[ \] Impactful Visual Feedback:** High-contrast feedback using `Success-Muted` (#5A7761) for success, `Primary-Red` (#DA291C) for failures. Minimalist, mechanical animations that feel like official stamp processes.
- **\[ \] Functional Clarity & Trust:** Zero ambiguity in high-stakes interactions. Confirmation modals use official document styling: "COMRADE, YOU ARE COMMITTING: **$100** AND **FILE: K-01.JPG**. FAILURE IS NOT AN OPTION. CONFIRM DIRECTIVE."

### **4.2. Visual Theme Requirements**

- **\[ \] Color Palette (Minimalist & High-Contrast):**
  - `Primary-Red`: `#DA291C` - Dominant color for actions, authority, alerts, failures
  - `Accent-Black`: `#000000` - Body text, secondary UI elements
  - `Background-Parchment`: `#F5EEDC` - Main background for aged document feel
  - `Container-Light`: `#FFFFFF` - Sparingly for containers needing contrast
  - `Success-Muted`: `#5A7761` - Militaristic green for functional success states

- **\[ \] Typography (Bold & Impactful):**
  - **Headings:** **Stalinist One** (Google Fonts) for all major UI titles, buttons. **Always UPPERCASE**
  - **Body Text:** **Roboto Condensed** (Google Fonts) for efficient, structured information display

- **\[ \] Layout & Spacing:** Strict 8-point grid system (all spacing in multiples of 8px) with consistent container padding (16px or 24px)

- **\[ \] Borders & Shadows (Critical Rule):** **Zero border radius** on all elements (`border-radius: 0px`). Simple solid black borders (1px-2px). **No shadows** - design relies on stark color contrast and strong geometric lines.

### **4.3. Component-Specific Requirements**

- **\[ \] Core Layout:** Simple UI focusing on three main components: large central calendar view, "IMMEDIATE DIRECTIVES" (upcoming deadlines) sidebar, and prominent dashboard action buttons.
- **\[ \] Dashboard:**
  - **\[ \] Calendar:** Rigid, stark grid layout with sharp 90-degree corners. Deadlines color-coded using the minimalist palette. No rounded elements.
  - **\[ \] Deadlines Sidebar:** "IMMEDIATE DIRECTIVES" list showing most critical upcoming deadlines. Each item clickable with direct, imperative descriptions.
  - **\[ \] Action Buttons:** Hard-edged rectangles with **zero border radius**. Primary buttons in `Primary-Red`, text in uppercase **STALINIST ONE**. Sharp, functional click animations only.
  - **\[ \] Stakes Display:** Always visible like official state records showing monetary amount and Kompromat file references.

- **\[ \] Modals & Pop-ups:** Designed as official communiqués with hard black borders, clear titles, structured content. Sharp fade-in animations only - no playful effects.

- **\[ \] Forms & Inputs:** Simple, rectangular fields with clear borders and zero rounded corners. Labels positioned directly above inputs in uppercase formatting.

- **\[ \] Submission Flow:**
  - **\[ \] Step 1:** User clicks deadline from calendar or sidebar - triggers instant modal without transitions.
  - **\[ \] Step 2:** Modal appears with official document styling showing requirements.
  - **\[ \] Step 3:** "SUBMIT PROOF" button leads to submission form with same stark, functional design principles.

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

**\#\# 6\. Iconography & Visual Elements**

- **\[ \] Icon Style:** Stark, single-color icons (black or red) reminiscent of woodblock prints or stencils. All custom SVG format.
- **\[ \] Security Metaphors:** "SECURE STATE ARCHIVE" for Kompromat storage with vault/locked cabinet iconography.
- **\[ \] Official Aesthetics:** Design elements that reinforce state authority theme - stamps, seals, official document styling.

**\#\# 7\. Technical Implementation**

- **\[ \] Tech Stack:** React and Vite (frontend), Supabase (backend).
- **\[ \] UI Framework:** Tailwind CSS for utility-first styling adhering to Soviet Constructivist principles.
- **\[ \] Typography Implementation:** Import **Stalinist One** and **Roboto Condensed** from Google Fonts.
- **\[ \] Icon System:** Custom SVG icons in single-color (black/red) woodblock print style.
- **\[ \] Avatar System:** Custom Soviet KGB spy-style avatars in high-contrast, graphic style.

**\#\# 8\. Legal & Compliance**

- **\[ \] Terms of Service:** Comprehensive legal page transparent about all consequence mechanisms, the app's intended "accountability" purpose, and future policy for retaining 50% of unclaimed funds. Must explicitly state the app is not for genuine blackmail but for self-imposed discipline through negative reinforcement.
