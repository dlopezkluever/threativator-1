// Email Template System for Threativator Notifications
// Soviet Constructivist themed HTML email templates

export interface EmailTemplateData {
  recipientName: string
  recipientEmail?: string
  unsubscribeUrl?: string
}

export interface DeadlineReminderData extends EmailTemplateData {
  goalTitle: string
  checkpointTitle?: string
  deadline: string
  hoursRemaining: number
  submissionUrl: string
  type: 'goal' | 'checkpoint'
}

export interface SubmissionResultData extends EmailTemplateData {
  goalTitle: string
  checkpointTitle: string
  submissionType: 'file_upload' | 'external_url' | 'text_description'
  result: 'passed' | 'failed'
  feedback?: string
  confidenceScore?: number
  submissionUrl: string
  canResubmit: boolean
}

export interface ConsequenceNotificationData extends EmailTemplateData {
  consequenceType: 'monetary' | 'humiliation_email' | 'humiliation_social'
  amount?: number
  charity?: string
  kompromatFilename?: string
  goalTitle: string
  isRussianRoulette: boolean
  wasSpared: boolean
}

export interface GoalCompletionData extends EmailTemplateData {
  goalTitle: string
  completedAt: string
  totalCheckpoints: number
  completionRate: number
  nextSteps?: string
}

// Base email styling constants
const BASE_STYLES = {
  body: `
    font-family: 'Roboto Condensed', 'Arial', sans-serif; 
    background: #F5EEDC; 
    margin: 0; 
    padding: 20px;
    color: #000000;
  `,
  container: `
    max-width: 600px; 
    margin: 0 auto; 
    background: white; 
    border: 6px solid #000000;
    border-radius: 0;
  `,
  header: `
    background: #C11B17; 
    color: #F5EEDC; 
    padding: 24px; 
    text-align: center;
    font-family: 'Stalinist One', 'Arial Black', sans-serif;
    font-weight: 900;
    font-size: 20px;
    letter-spacing: 3px;
    text-transform: uppercase;
  `,
  content: `
    padding: 32px;
    background: white;
    color: #000000;
    line-height: 1.6;
  `,
  stamp: `
    background: #C11B17; 
    color: #F5EEDC; 
    padding: 12px 24px; 
    display: inline-block; 
    font-weight: bold;
    margin: 20px 0;
    border: 3px solid #000000;
    font-family: 'Stalinist One', 'Arial Black', sans-serif;
    text-transform: uppercase;
    letter-spacing: 1px;
  `,
  successStamp: `
    background: #5A7761; 
    color: #F5EEDC; 
    padding: 12px 24px; 
    display: inline-block; 
    font-weight: bold;
    margin: 20px 0;
    border: 3px solid #000000;
    font-family: 'Stalinist One', 'Arial Black', sans-serif;
    text-transform: uppercase;
    letter-spacing: 1px;
  `,
  warning: `
    background: #5A7761; 
    color: #F5EEDC; 
    padding: 16px; 
    margin: 24px 0;
    border: 3px solid #000000;
    font-weight: bold;
  `,
  button: `
    display: inline-block;
    background: #C11B17;
    color: #F5EEDC;
    padding: 16px 32px;
    text-decoration: none;
    border: 3px solid #000000;
    font-family: 'Stalinist One', 'Arial Black', sans-serif;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 20px 0;
  `,
  footer: `
    background: #000000; 
    color: #F5EEDC; 
    padding: 20px; 
    text-align: center; 
    font-size: 12px;
    font-weight: bold;
    letter-spacing: 1px;
  `
}

// Base HTML template structure
function createBaseTemplate(headerText: string, content: string, unsubscribeUrl?: string): string {
  const unsubscribeLink = unsubscribeUrl || 'https://threativator.com/settings#notifications'
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${headerText}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
</head>
<body style="${BASE_STYLES.body}">
    <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
            ⚠️ ${headerText} ⚠️
        </div>
        
        <div style="${BASE_STYLES.content}">
            ${content}
        </div>
        
        <div style="${BASE_STYLES.footer}">
            THREATIVATOR STATE AUTHORITY - ACCOUNTABILITY DIVISION<br>
            "DISCIPLINE THROUGH CONSEQUENCES"<br>
            <a href="${unsubscribeLink}" style="color: #F5EEDC; font-size: 10px;">Manage Notifications</a>
        </div>
    </div>
</body>
</html>
  `.trim()
}

// Template: 24-hour deadline reminder
export function createDeadlineReminderTemplate(data: DeadlineReminderData): string {
  const isUrgent = data.hoursRemaining <= 1
  const urgencyText = isUrgent ? 'CRITICAL' : 'URGENT'
  const headerText = `${urgencyText} DEADLINE DIRECTIVE`
  
  const content = `
    <p><strong>ATTENTION COMRADE ${data.recipientName.toUpperCase()},</strong></p>
    
    <div style="${isUrgent ? BASE_STYLES.stamp : BASE_STYLES.warning}">
        ${data.hoursRemaining <= 1 ? 'FINAL HOUR WARNING' : `${data.hoursRemaining} HOURS REMAINING`}
    </div>
    
    <p>This is an <strong>OFFICIAL REMINDER</strong> from the Threativator State Authority.</p>
    
    <p><strong>${data.type.toUpperCase()} DEADLINE APPROACHING:</strong></p>
    <ul>
        <li><strong>Goal:</strong> ${data.goalTitle}</li>
        ${data.checkpointTitle ? `<li><strong>Checkpoint:</strong> ${data.checkpointTitle}</li>` : ''}
        <li><strong>Deadline:</strong> ${data.deadline}</li>
        <li><strong>Time Remaining:</strong> ${data.hoursRemaining} ${data.hoursRemaining === 1 ? 'hour' : 'hours'}</li>
    </ul>
    
    <div style="${BASE_STYLES.warning}">
        <strong>STATE REMINDER:</strong><br>
        Failure to meet this deadline will trigger your pre-authorized accountability protocol. 
        ${data.type === 'goal' ? 'This is a FINAL DEADLINE - consequences are GUARANTEED.' : 'Checkpoint failure carries a 33% consequence probability (Russian Roulette).'}
    </div>
    
    <p style="text-align: center;">
        <a href="${data.submissionUrl}" style="${BASE_STYLES.button}">
            SUBMIT PROOF NOW
        </a>
    </p>
    
    <p style="margin-top: 32px; font-size: 14px; color: #666;">
        <em>Remember: Great achievements require great discipline. The State Authority enforces what willpower alone cannot.</em>
    </p>
    
    <p style="color: #666; font-size: 12px; margin-top: 32px;">
        This reminder was automatically generated based on your goal deadlines. 
        You can manage your notification preferences in your account settings.
    </p>
  `
  
  return createBaseTemplate(headerText, content, data.unsubscribeUrl)
}

// Template: Submission result notification
export function createSubmissionResultTemplate(data: SubmissionResultData): string {
  const passed = data.result === 'passed'
  const headerText = passed ? 'SUBMISSION ACCEPTED' : 'SUBMISSION REJECTED'
  
  const content = `
    <p><strong>ATTENTION COMRADE ${data.recipientName.toUpperCase()},</strong></p>
    
    <div style="${passed ? BASE_STYLES.successStamp : BASE_STYLES.stamp}">
        ${passed ? 'PROOF VALIDATED' : 'PROOF INSUFFICIENT'}
    </div>
    
    <p>Your submission for <strong>${data.goalTitle}</strong> - <strong>${data.checkpointTitle}</strong> has been processed.</p>
    
    <p><strong>GRADING RESULTS:</strong></p>
    <ul>
        <li><strong>Submission Type:</strong> ${data.submissionType.replace('_', ' ').toUpperCase()}</li>
        <li><strong>Result:</strong> <strong style="color: ${passed ? '#5A7761' : '#C11B17'};">${data.result.toUpperCase()}</strong></li>
        ${data.confidenceScore ? `<li><strong>AI Confidence:</strong> ${Math.round(data.confidenceScore * 100)}%</li>` : ''}
    </ul>
    
    ${data.feedback ? `
    <div style="${passed ? BASE_STYLES.warning.replace('#5A7761', '#5A7761') : BASE_STYLES.warning}">
        <strong>GRADING FEEDBACK:</strong><br>
        ${data.feedback}
    </div>
    ` : ''}
    
    ${passed ? `
    <p style="color: #5A7761; font-weight: bold;">
        🎖️ <strong>CHECKPOINT COMPLETED:</strong> Your submission meets the required standards. 
        The State Authority acknowledges your discipline and commitment.
    </p>
    ` : `
    <p style="color: #C11B17; font-weight: bold;">
        ⚠️ <strong>RESUBMISSION REQUIRED:</strong> Your proof does not meet the established criteria.
    </p>
    
    ${data.canResubmit ? `
    <div style="${BASE_STYLES.warning}">
        <strong>CORRECTIVE ACTION AVAILABLE:</strong><br>
        You may resubmit improved proof before the deadline. Address the feedback above and try again.
        Alternatively, you may appeal this decision by having a trusted contact vouch for your work.
    </div>
    
    <p style="text-align: center;">
        <a href="${data.submissionUrl}" style="${BASE_STYLES.button}">
            RESUBMIT PROOF
        </a>
    </p>
    ` : `
    <div style="${BASE_STYLES.warning}">
        <strong>DEADLINE PASSED:</strong><br>
        The submission window has closed. Your accountability protocol may now be triggered.
    </div>
    `}
    `}
    
    <p style="margin-top: 32px; font-size: 14px; color: #666;">
        <em>The State Authority grades all submissions objectively against your predetermined criteria. 
        Consistency and fairness serve the revolution.</em>
    </p>
  `
  
  return createBaseTemplate(headerText, content, data.unsubscribeUrl)
}

// Template: Consequence notification (enhanced version of existing)
export function createConsequenceNotificationTemplate(data: ConsequenceNotificationData): string {
  const { consequenceType, wasSpared, isRussianRoulette } = data
  
  let headerText = ''
  let content = ''
  
  if (wasSpared && isRussianRoulette) {
    headerText = 'STATE SHOWS MERCY'
    content = `
      <p><strong>ATTENTION COMRADE ${data.recipientName.toUpperCase()},</strong></p>
      
      <div style="${BASE_STYLES.successStamp}">
          THE ROULETTE FAVORS YOU
      </div>
      
      <p>Your checkpoint failure triggered the <strong>Russian Roulette Protocol</strong> (33% probability).</p>
      
      <div style="${BASE_STYLES.warning}">
          <strong>FORTUNE SMILES UPON YOU:</strong><br>
          The State Authority has decided to show mercy. Your consequence has been 
          deferred, but your discipline record remains under surveillance.
      </div>
      
      <p><strong>Goal:</strong> ${data.goalTitle}</p>
      
      <p style="margin-top: 32px; font-weight: bold; color: #5A7761;">
          🍀 <strong>REMEMBER THIS MERCY:</strong> The roulette will spin again on future failures. 
          Use this reprieve to strengthen your resolve and meet your remaining deadlines.
      </p>
    `
  } else {
    headerText = 'CONSEQUENCE EXECUTED'
    
    if (consequenceType === 'monetary') {
      content = `
        <p><strong>ATTENTION COMRADE ${data.recipientName.toUpperCase()},</strong></p>
        
        <div style="${BASE_STYLES.stamp}">
            MONETARY PENALTY EXECUTED
        </div>
        
        <p>Your failure to meet the deadline has triggered your pre-authorized accountability protocol.</p>
        
        <p><strong>PENALTY DETAILS:</strong></p>
        <ul>
            <li><strong>Amount:</strong> $${data.amount?.toFixed(2)}</li>
            <li><strong>Recipient:</strong> ${data.charity?.replace('_', ' ').toUpperCase()}</li>
            <li><strong>Failed Goal:</strong> ${data.goalTitle}</li>
            <li><strong>Trigger:</strong> ${isRussianRoulette ? 'Russian Roulette (33%)' : 'Final Deadline (100%)'}</li>
        </ul>
        
        <div style="${BASE_STYLES.warning}">
            <strong>FUNDS TRANSFERRED:</strong><br>
            Your penalty has been automatically sent to the designated charity. 
            A receipt will be provided for your records. The State Authority enforces what willpower alone cannot.
        </div>
        
        <p style="margin-top: 32px; font-weight: bold; color: #C11B17;">
            💸 <strong>GREAT DISHONOR:</strong> Your lack of discipline has cost you financially. 
            Learn from this failure and strengthen your resolve for future commitments.
        </p>
      `
    } else if (consequenceType === 'humiliation_email') {
      content = `
        <p><strong>ATTENTION COMRADE ${data.recipientName.toUpperCase()},</strong></p>
        
        <div style="${BASE_STYLES.stamp}">
            HUMILIATION PROTOCOL EXECUTED
        </div>
        
        <p>Your failure to meet the deadline has triggered your pre-authorized accountability protocol.</p>
        
        <p><strong>CONSEQUENCE DETAILS:</strong></p>
        <ul>
            <li><strong>Type:</strong> Kompromat Dispatch</li>
            <li><strong>Material:</strong> ${data.kompromatFilename}</li>
            <li><strong>Failed Goal:</strong> ${data.goalTitle}</li>
            <li><strong>Trigger:</strong> ${isRussianRoulette ? 'Russian Roulette (33%)' : 'Final Deadline (100%)'}</li>
        </ul>
        
        <div style="${BASE_STYLES.warning}">
            <strong>SHAME MATERIAL DEPLOYED:</strong><br>
            Your compromising material has been dispatched to a random contact from your consequence targets. 
            The State Authority maintains strict confidentiality about recipient identity.
        </div>
        
        <p style="margin-top: 32px; font-weight: bold; color: #C11B17;">
            😳 <strong>GREAT DISHONOR:</strong> Your procrastination has brought public shame. 
            Let this consequence remind you why discipline matters more than comfort.
        </p>
      `
    } else if (consequenceType === 'humiliation_social') {
      content = `
        <p><strong>ATTENTION COMRADE ${data.recipientName.toUpperCase()},</strong></p>
        
        <div style="${BASE_STYLES.stamp}">
            SOCIAL MEDIA CONSEQUENCE EXECUTED
        </div>
        
        <p>Your failure to meet the deadline has triggered your pre-authorized accountability protocol.</p>
        
        <p><strong>CONSEQUENCE DETAILS:</strong></p>
        <ul>
            <li><strong>Type:</strong> Social Media Posting</li>
            <li><strong>Material:</strong> ${data.kompromatFilename}</li>
            <li><strong>Failed Goal:</strong> ${data.goalTitle}</li>
            <li><strong>Platform:</strong> Twitter/X</li>
            <li><strong>Trigger:</strong> ${isRussianRoulette ? 'Russian Roulette (33%)' : 'Final Deadline (100%)'}</li>
        </ul>
        
        <div style="${BASE_STYLES.warning}">
            <strong>PUBLIC SHAME DEPLOYED:</strong><br>
            Your compromising material has been posted to your connected social media account. 
            The post includes official Threativator accountability messaging for maximum impact.
        </div>
        
        <p style="margin-top: 32px; font-weight: bold; color: #C11B17;">
            📱 <strong>MAXIMUM DISHONOR:</strong> Your failure is now public knowledge. 
            Use this humiliation as fuel for future success and unwavering commitment.
        </p>
      `
    }
  }
  
  const commonFooter = `
    <p style="margin-top: 40px; font-size: 14px; color: #666;">
        <em>The State Authority executes consequences with mathematical precision. 
        Fear of failure drives excellence where motivation fails.</em>
    </p>
    
    <p style="color: #666; font-size: 12px; margin-top: 32px;">
        This consequence was voluntarily pre-authorized by you as part of your Threativator accountability protocol. 
        All penalties serve the greater purpose of personal discipline and achievement.
    </p>
  `
  
  return createBaseTemplate(headerText, content + commonFooter)
}

// Template: Goal completion celebration
export function createGoalCompletionTemplate(data: GoalCompletionData): string {
  const headerText = 'MISSION ACCOMPLISHED'
  
  const content = `
    <p><strong>CONGRATULATIONS COMRADE ${data.recipientName.toUpperCase()},</strong></p>
    
    <div style="${BASE_STYLES.successStamp}">
        GOAL SUCCESSFULLY COMPLETED
    </div>
    
    <p>The State Authority is pleased to announce the successful completion of your accountability mission.</p>
    
    <p><strong>ACHIEVEMENT SUMMARY:</strong></p>
    <ul>
        <li><strong>Goal:</strong> ${data.goalTitle}</li>
        <li><strong>Completed:</strong> ${data.completedAt}</li>
        <li><strong>Checkpoints:</strong> ${data.totalCheckpoints} total</li>
        <li><strong>Success Rate:</strong> ${data.completionRate}%</li>
    </ul>
    
    <div style="${BASE_STYLES.warning.replace('#5A7761', '#5A7761')}">
        <strong>STATE COMMENDATION:</strong><br>
        Your discipline and commitment have proven superior to the forces of procrastination. 
        This victory demonstrates the power of systematic accountability and fear-based motivation.
    </div>
    
    <p style="color: #5A7761; font-weight: bold; margin-top: 32px;">
        🎖️ <strong>HONOR TO THE DISCIPLINED:</strong> You have conquered your goals through superior will and systematic consequences. 
        The revolution is built on such dedication to completion.
    </p>
    
    ${data.nextSteps ? `
    <div style="${BASE_STYLES.warning.replace('#5A7761', '#5A7761')}">
        <strong>NEXT MISSION GUIDANCE:</strong><br>
        ${data.nextSteps}
    </div>
    ` : ''}
    
    <p style="margin-top: 40px; font-size: 14px; color: #666;">
        <em>Success breeds success. Channel this momentum into your next accountability mission. 
        The State Authority stands ready to enforce your future commitments.</em>
    </p>
  `
  
  return createBaseTemplate(headerText, content, data.unsubscribeUrl)
}

// Test email template (for development)
export function createTestEmailTemplate(recipientEmail: string): string {
  const headerText = 'SYSTEM TEST DIRECTIVE'
  
  const content = `
    <p><strong>SYSTEM TEST SUCCESSFUL</strong></p>
    
    <div style="${BASE_STYLES.successStamp}">
        EMAIL DELIVERY VERIFIED
    </div>
    
    <p>This is a test email from the Threativator notification system.</p>
    
    <p><strong>TEST PARAMETERS:</strong></p>
    <ul>
        <li><strong>Recipient:</strong> ${recipientEmail}</li>
        <li><strong>Template System:</strong> Operational</li>
        <li><strong>SendGrid Integration:</strong> Functional</li>
        <li><strong>Soviet Styling:</strong> Applied</li>
    </ul>
    
    <div style="${BASE_STYLES.warning}">
        <strong>DEVELOPMENT STATUS:</strong><br>
        All email templates are rendering correctly with proper Soviet Constructivist styling. 
        The notification system is ready for production deployment.
    </div>
    
    <p style="margin-top: 32px; color: #5A7761; font-weight: bold;">
        ✅ <strong>TEMPLATE SYSTEM OPERATIONAL:</strong> All notification types are ready for automated delivery.
    </p>
  `
  
  return createBaseTemplate(headerText, content, data.unsubscribeUrl)
}

// Utility function to inline CSS for better email client compatibility
export function inlineStyles(htmlContent: string): string {
  // This is a simplified version - in production, you might want to use a proper CSS inlining library
  // For now, we're using inline styles directly in the templates above
  return htmlContent
}

// Export all template functions
export const EmailTemplates = {
  deadlineReminder: createDeadlineReminderTemplate,
  submissionResult: createSubmissionResultTemplate,
  consequence: createConsequenceNotificationTemplate,
  goalCompletion: createGoalCompletionTemplate,
  test: createTestEmailTemplate
}