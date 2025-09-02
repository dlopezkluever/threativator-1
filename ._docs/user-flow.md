# **Threativator User Flow: Operation Discipline (Dashboard-First)**

This document outlines the streamlined user journey through the Threativator application, from initial recruitment to immediate access to the operational command center. Our USSR-style spy operatives provide immediate access to the discipline network—no bureaucratic delays.

## **The Soviet Spy Experience**

Throughout the entire application, users interact with our menacing USSR-style spy avatar who delivers threatening communications:

- **Landing Page Recruitment:** "Trust us, your motivation issues will be a thing of the past; we'll make sure of it, at all costs."
- **Email Notifications:** Feature the spy logo with threatening messages like "You have 3 days to complete your mission: {DIRECTIVE NAME}, or else, let's just say, there will be consequences. Remember, we have more than enough unfortunate material to ruin you."
- **Interface Personality:** All interactions maintain the authoritative, state-controlled tone with terms like "DIRECTIVES," "OPERATIVES," "STATE INTELLIGENCE," and "KOMPROMAT."
- **Visual Design:** IMPLEMENTED Soviet Constructivist state surveillance interface with crimson (#C11B17), black (#000000), and beige (#F5EEDC) colors. Features 6px propaganda borders, zero border radius, and **STALINIST ONE** typography with forced loading for maximum authoritative impact.

## **1.0 New Recruit: Immediate Command Center Access**

This flow describes the streamlined recruitment process with immediate access to operational capabilities. No forced onboarding—operatives explore the command center and establish security clearance as needed.

- **1.1. Recruitment Registration:** New operative creates secure credentials (email/password) to access the State Discipline Network.
- **1.2. Immediate Command Center Access:** Upon authentication, operatives are granted immediate access to the OPERATIONAL COMMAND CENTER with IMPLEMENTED interface visibility:
  - **IMMEDIATE DIRECTIVES:** 25% width sidebar with 280px minimum, document icon for empty states, thick borders
  - **OPERATIONAL CALENDAR:** 75% width month/week calendar with proper grid structure, 450px height, deadline-focused (no hourly slots)
  - **STATE COLLATERAL:** 25% width panel (1:2:1 ratio) with military green status displays and thick propaganda borders  
  - **COMMAND ACTIONS:** 50% width panel with 3x2 button grid, 64px button height, 14px readable text, Stalinist One typography

## **2.0 Progressive Security Clearance (On-Demand)**

Security clearance is established progressively as operatives attempt to access restricted operations. No forced sequence—operatives choose their path to operational readiness.

- **2.1. STATE COLLATERAL Section Always Visible:**
  - **HOLDING CELL BALANCE:** Shows $0.00 with prominent [+ ESTABLISH FINANCIAL COLLATERAL] button
  - **SECURE STATE ARCHIVE:** Shows 0 FILES with prominent [+ UPLOAD CLASSIFIED MATERIAL] button
  - **Contact Network:** Shows 0 OPERATIVES with [+ RECRUIT CONTACTS] button
  - **Social Networks:** Shows DISCONNECTED with [+ CONNECT SOCIAL PLATFORMS] button

- **2.2. On-Demand Feature Access:**
  - **Financial Collateral Setup:** Opens when operative clicks [+ ESTABLISH FINANCIAL COLLATERAL]
    - Stripe payment method collection with Soviet-themed interface
    - Initial deposit to STATE HOLDING CELL with ominous warnings
    - "This is not a game, Comrade. Real stakes, real consequences."
  
  - **Kompromat Upload:** Opens when operative clicks [+ UPLOAD CLASSIFIED MATERIAL]
    - Drag-and-drop interface for embarrassing content
    - Severity classification (MINOR/MAJOR) with explanations
    - "We require insurance of your compliance. Choose your most unfortunate material."
  
  - **Contact Recruitment:** Opens when operative clicks [+ RECRUIT CONTACTS]
    - Add contacts with role classification (WITNESS/CONSEQUENCE TARGET)
    - "Choose wisely—these contacts may receive evidence of your failures."
  
  - **Social Media Integration:** Opens when operative clicks [+ CONNECT SOCIAL PLATFORMS]
    - Optional Twitter/X OAuth integration
    - "For maximum embarrassment reach, should disciplinary action be required."

## **3.0 Mission Assignment & Security Clearance Gates**

This flow describes the contextual security requirements when operatives attempt to establish new directives. No forced setup—requirements are presented only when needed.

- **3.1. Request New Mission:** Operative clicks "REQUEST NEW MISSION" button from COMMAND ACTIONS panel.

- **3.2. Security Clearance Verification:** System performs automatic clearance check:
  - **IF (sufficient_collateral):** Proceed directly to mission definition
  - **IF (insufficient_collateral):** Display clearance requirement modal

- **3.3. Clearance Requirement Modal (if insufficient):**
  ```
  ⚠️ INSUFFICIENT SECURITY CLEARANCE ⚠️
  
  To establish new directives, operatives must demonstrate commitment 
  through collateral. The State requires insurance of compliance.
  
  MINIMUM REQUIREMENTS (choose one or both):
  [+ ESTABLISH FINANCIAL COLLATERAL] - Deposit funds for penalties
  [+ UPLOAD CLASSIFIED MATERIAL] - Provide compromising content
  
  [CANCEL MISSION REQUEST] [PROCEED TO CLEARANCE]
  ```

- **3.4. Mission Definition (after clearance):**
  - **Path A (Standard Operations):** Select "CLASSIFIED DIRECTIVE" templates with pre-configured parameters
  - **Path B (Special Assignment):** Define custom mission with State Grader verification protocols
  
- **3.5. Progressive Mission Configuration:**
  - **Operational Milestones:** Define checkpoints or request AI-generated surveillance intervals
  - **Resource Allocation:** Select collateral amounts and penalty recipients from available inventory
  - **Verification Authority:** Choose AI Grader or Human Operative based on recruited contacts
  
- **3.6. Mission Authorization:** Review and confirm directive with full consequence understanding
- **3.7. Active Surveillance:** Mission appears in IMMEDIATE DIRECTIVES and OPERATIONAL CALENDAR

## **4.0 Active Operations: Surveillance & Compliance Protocol**

This flow describes the primary surveillance loop: operative reporting and verification of mission progress.

- **4.1. State Communication:** The operative receives classified email transmission as deadline approaches. The USSR spy avatar delivers the threat: "You have 3 days to complete your mission: {DIRECTIVE NAME}, or else, let's just say, there will be consequences. Remember, we have more than enough unfortunate material to ruin you."
- **3.2. Report for Verification:**
  - Operative accesses DIRECTIVE CONTROL DASHBOARD.
  - Clicks on approaching deadline in OPERATIONAL CALENDAR or "IMMEDIATE DIRECTIVES" sidebar.
- **3.3. Submit Mission Evidence:**
  - Official communiqué modal appears with submission requirements and warning protocols.
  - Operative clicks "SUBMIT PROOF OF COMPLIANCE," uploads required evidence, and confirms transmission to State Intelligence.
- **3.4. State Verification Process:**
  - **If State AI Grader:** Submission undergoes automated intelligence analysis. Operative sees "EVIDENCE UNDER REVIEW" status with ominous warning: "State analysts are examining your submission. Deception will be detected."
  - **If Human Operative:** Designated contact receives classified email with unique verification link to vote "MISSION ACCOMPLISHED" or "OPERATIVE FAILED." Status shows "AWAITING WITNESS TESTIMONY."
- **3.5. Outcome - Mission Accomplished:**
  - Operative receives "DIRECTIVE COMPLETED" transmission with grudging approval: "Acceptable work, Comrade. The State acknowledges your compliance... for now."
  - Deadline marked as "MISSION ACCOMPLISHED" (`Success-Muted` green) on command dashboard.
  - Surveillance continues to next checkpoint, or complete directive marked "OPERATIONAL SUCCESS" if final deadline achieved.
- **3.6. Outcome - Intelligence Rejection:**
  - Operative receives "SUBMISSION REJECTED" transmission: "Your pathetic attempt fails to meet State standards. Disciplinary protocols may be activated unless immediate corrective action is taken."
  - Deadline marked as "UNDER INVESTIGATION" (`Primary-Red`) on dashboard.
  - Operative may **resubmit evidence** before deadline or **appeal to higher authority** (see Flow 4.2).

## **4.0 Disciplinary Action Protocol: Consequence Enforcement**

This flow describes the various punishment mechanisms activated when operative compliance fails. Remember, we have methods to ensure discipline.

- **4.1. Failure by Missing Operational Deadline:**
  - State surveillance detects deadline violation with no successful compliance.
  - Disciplinary action triggers automatically ("ROULETTE OF CONSEQUENCES" for checkpoints, guaranteed punishment for final deadlines).
  - Operative receives ominous "GREAT DISHONOR" transmission: "The State is disappointed, Comrade. Disciplinary measures have been implemented. You will learn the extent of your shame in due time."
  - Upon next access, official modal appears: "CONSEQUENCE TRIGGERED. STATE DIRECTIVE HAS BEEN EXECUTED. GREAT DISHONOR COMES UPON YOU, COMRADE. LEARN FROM THIS FAILURE."
  - Failed deadline archived to "DISCIPLINARY RECORD," surveillance continues or directive marked "OPERATIVE FAILURE."
- **4.2. Intelligence Rejection (Appeal Protocol):**
  - State AI rejects submission but deadline remains active.
  - Operative clicks "APPEAL TO HIGHER AUTHORITY" button.
  - System demands: "Find a trusted associate willing to vouch for your work. They must register with State Intelligence and stake their reputation on your behalf."
  - Associate creates operative account, locates mission file, and clicks "VOUCH FOR COMRADE."
  - AI rejection overridden, submission upgraded to "VERIFIED BY WITNESS." Both operatives notified of successful appeal.
- **4.3. Witness Testimony Against Operative:**
  - Designated human operative votes "MISSION FAILED" on submission evidence.
  - This verdict is FINAL and cannot be appealed—"The State trusts its operatives completely."
  - Submission marked as "CONDEMNED BY WITNESS." Operative must provide new evidence before deadline expires or face full disciplinary action as described in Flow 4.1.
