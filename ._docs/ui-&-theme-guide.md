# **Threativator: UI & Interaction Design Rules**

This document outlines the core principles and component-specific rules for the Threativator user interface. The goal is to create an experience that is intuitive, trustworthy, and perfectly aligned with our "Bold & Playful" design style.

### **1\. Core Design Principles**

1. **Gamify Everything:** The UI must treat the user's journey as a high-stakes game.
   - **Clear Feedback:** Every interaction should have a visible or animated response. Use Magic UI for celebratory animations (e.g., confetti on success) and tense animations (e.g., a "shake" effect on a failed submission).
   - **Visible Stakes:** The dashboard must always display the core stakes for the active goal: the dollar amount committed and a visual (e.g., blurred thumbnail) of the "Major Kompromat."
   - **High-Impact Moments:** Key events like the "Russian Roulette" must be treated as significant UI moments. Use a dedicated, animated sequence (like a spinning wheel or card flip) to reveal the outcome.
2. **Personality-Driven Design:** The app's "quirky" personality must shine through in every element.
   - **Avatars are Active Participants:** Avatars should appear in modals, notifications, and emails with expressions that match the context (e.g., a happy avatar for success, a stern one for a warning).
   - **Microcopy is Witty:** All button text, labels, and helper text should align with the app's voice. Avoid generic text. For example, use "Prove It" instead of "Submit," or "Up the Stakes" instead of "Add Funds."
3. **Clarity and Trust Above All:** The high-stakes nature of the app requires zero ambiguity.
   - **Unambiguous Confirmation:** Before a user commits to a goal, a final confirmation modal must explicitly list every stake and consequence (e.g., "You are committing **$100** and **\[Kompromat_Name.jpg\]**. Are you absolutely sure?").
   - **Visual Hierarchy:** The most critical, time-sensitive information (the very next deadline) must be the most visually dominant element on the dashboard.
   - **Secure Visual Cues:** Use lock icons and explicit text like "End-to-End Encrypted" in the "Kompromat Holding System" to visually reassure the user of their data's security.

### **2\. Component-Specific Rules**

- **Buttons:**
  - **Primary:** Used for the main positive action on a page (e.g., "Activate Goal," "Submit Proof").
  - **Secondary:** Used for less critical actions (e.g., "Manage Contacts," "View History").
  - **Danger:** Reserved exclusively for actions with significant, potentially negative consequences (e.g., the final confirmation button for a consequence, deleting an account).
  - **Animation:** All buttons should have a satisfying "squish" or "pop" animation from Magic UI on click.
- **Modals & Pop-ups:**
  - **Usage:** Reserved for critical, focused tasks that interrupt the main flow, such as the submission form, the final goal confirmation, and the post-failure notification.
  - **Animation:** Modals should enter the screen with a playful "bounce" or "fade-in" animation.
- **Dashboard & Calendar:**
  - **Hierarchy:** The "Upcoming Deadlines" sidebar is the primary call to action. The calendar provides secondary, long-term context.
  - **Interactivity:** Hovering over a deadline on the calendar should display a tooltip with more details. Clicking a deadline (in either view) must always trigger the submission modal.
- **Notifications & Feedback:**
  - **Style:** Use toast-style notifications for non-blocking feedback (e.g., "Funds successfully added").
  - **Consistency:** Always pair the notification with the appropriate avatar and semantic color (green for success, red for error).

# **Threativator: Visual Theme & Style Guide**

This document defines the specific visual elements that create the "Bold & Playful" theme for Threativator. It serves as the single source of truth for all colors, typography, and styling.

### **1\. Color Palette**

The color palette is designed to be energetic, clear, and supportive of the app's gamified nature.

- **Primary:**
  - `Primary-Blue`: `#5D5FEF` \- Used for primary buttons, active links, and key interactive elements.
- **Secondary & Accents:**
  - `Accent-Yellow`: `#FFC700` \- Used for highlighting secondary information or creating visual interest.
  - `Accent-Pink`: `#F45B69` \- A playful accent for illustrations or special promotions.
- **Semantic Colors (Critical for Status):**
  - `Success-Green`: `#34D399` \- Used for successful submissions, completed goals, and positive feedback.
  - `Warning-Orange`: `#F59E0B` \- Used for upcoming deadlines (within 48 hours) and gentle warnings.
  - `Danger-Red`: `#EF4444` \- Used for failed submissions, missed deadlines, errors, and danger-zone actions.
- **Greyscale:**
  - `Background`: `#F3F4F6` (Light Gray) \- The main background color for the app.
  - `Container`: `#FFFFFF` (White) \- For cards, modals, and main content areas.
  - `Text-Primary`: `#111827` (Near Black) \- For headings and primary text.
  - `Text-Secondary`: `#6B7280` (Medium Gray) \- For subheadings and descriptive text.
  - `Borders`: `#D1D5DB` (Gray) \- For dividers and input field borders.

### **2\. Typography**

The typography is chosen to be friendly, rounded, and highly legible.

- **Heading Font:** **Fredoka One**
  - **Usage:** For all `<h1>`, `<h2>`, `<h3>` tags, and major UI text like dashboard titles. Its rounded, bold nature gives the app a cartoonish and friendly personality.
  - **Import:** From Google Fonts.
- **Body Font:** **Inter**
  - **Usage:** For all paragraphs, labels, and smaller text. It is a highly legible and clean sans-serif that pairs perfectly with the expressive heading font.
  - **Import:** From Google Fonts.

### **3\. Iconography & Illustrations**

- **Style:** All icons and the character avatars will follow a consistent cartoon style characterized by:
  - Thick, bold outlines.
  - Minimal internal detail.
  - Friendly and expressive features.
- **Source:** To be provided and added to the project's asset library. Icons should be in SVG format for scalability.

### **4\. Layout & Spacing**

- **8-Point Grid System:** All spacing (margins, padding) and element sizing should be in multiples of 8px (e.g., `8px`, `16px`, `24px`, `32px`). This ensures consistent and rhythmic layouts.
- **Container Padding:** Standard content containers (like the main dashboard cards) should use `24px` or `32px` of internal padding.

### **5\. Borders & Shadows**

- **Border Radius:** Use a generous border-radius to maintain a soft, friendly aesthetic.
  - `Standard`: `12px` \- For buttons and input fields.
  - `Large`: `16px` \- For larger containers like modals and cards.
- **Shadows:** Use hard, distinct shadows to give elements a "sticker-like" or tangible feel.
  - **Style:** A crisp, dark shadow with minimal blur and a slight offset.
  - **Tailwind Example:** `shadow-md` or a custom-defined hard shadow.
