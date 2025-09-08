// Centralized Email Notification Service
// Handles all email types with template integration and SendGrid delivery

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { 
  EmailTemplates,
  DeadlineReminderData,
  SubmissionResultData,
  ConsequenceNotificationData,
  GoalCompletionData 
} from './email-templates.ts'

export interface SendEmailResult {
  success: boolean
  messageId?: string
  recipient?: string
  error?: string
}

interface SendGridEmailPayload {
  personalizations: {
    to: { email: string; name?: string }[]
    subject: string
    custom_args?: Record<string, string>
  }[]
  from: {
    email: string
    name: string
  }
  content: {
    type: string
    value: string
  }[]
  categories?: string[]
  custom_args?: Record<string, string>
}

export class NotificationService {
  private readonly sendGridApiKey: string
  private readonly fromEmail: string
  private readonly fromName: string

  constructor() {
    this.sendGridApiKey = Deno.env.get('SENDGRID_API_KEY') || ''
    this.fromEmail = 'notifications@threativator.com' // Update with verified sender
    this.fromName = 'Threativator State Authority'
  }

  private async sendEmail(payload: SendGridEmailPayload): Promise<SendEmailResult> {
    if (!this.sendGridApiKey) {
      console.error('SENDGRID_API_KEY not configured')
      return { success: false, error: 'SendGrid not configured' }
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.sendGridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('SendGrid error:', response.status, errorData)
        return {
          success: false,
          error: `SendGrid failed: ${response.status} ${errorData}`
        }
      }

      const messageId = response.headers.get('X-Message-Id') || 'unknown'
      
      return {
        success: true,
        messageId,
        recipient: payload.personalizations[0].to[0].email
      }

    } catch (error) {
      console.error('Email send error:', error)
      return {
        success: false,
        error: `Email failed: ${error.message}`
      }
    }
  }

  // Send deadline reminder (24h or 1h before deadline)
  async sendDeadlineReminder(data: DeadlineReminderData, userId?: string): Promise<SendEmailResult> {
    // Get unsubscribe URL if userId provided
    if (userId && !data.unsubscribeUrl) {
      const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
      data.unsubscribeUrl = await getUnsubscribeUrl(supabase, userId)
    }
    
    const htmlContent = EmailTemplates.deadlineReminder(data)
    const isUrgent = data.hoursRemaining <= 1
    
    const payload: SendGridEmailPayload = {
      personalizations: [{
        to: [{
          email: data.recipientEmail!,
          name: data.recipientName
        }],
        subject: isUrgent 
          ? `🚨 CRITICAL: Final hour for ${data.goalTitle}`
          : `⚠️ URGENT: ${data.hoursRemaining}h remaining for ${data.goalTitle}`,
        custom_args: {
          notification_type: 'deadline_reminder',
          hours_remaining: data.hoursRemaining.toString(),
          goal_type: data.type
        }
      }],
      from: {
        email: this.fromEmail,
        name: this.fromName
      },
      content: [{
        type: 'text/html',
        value: htmlContent
      }],
      categories: ['notification', 'deadline_reminder', isUrgent ? 'urgent' : 'warning'],
      custom_args: {
        template: 'deadline_reminder',
        urgency_level: isUrgent ? 'critical' : 'warning'
      }
    }

    console.log(`Sending deadline reminder: ${data.hoursRemaining}h remaining for ${data.goalTitle}`)
    return this.sendEmail(payload)
  }

  // Send submission result notification
  async sendSubmissionResult(data: SubmissionResultData, userId?: string): Promise<SendEmailResult> {
    // Get unsubscribe URL if userId provided
    if (userId && !data.unsubscribeUrl) {
      const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
      data.unsubscribeUrl = await getUnsubscribeUrl(supabase, userId)
    }
    const htmlContent = EmailTemplates.submissionResult(data)
    const passed = data.result === 'passed'
    
    const payload: SendGridEmailPayload = {
      personalizations: [{
        to: [{
          email: data.recipientEmail!,
          name: data.recipientName
        }],
        subject: passed 
          ? `✅ Submission APPROVED: ${data.checkpointTitle}`
          : `❌ Submission REJECTED: ${data.checkpointTitle}`,
        custom_args: {
          notification_type: 'submission_result',
          result: data.result,
          submission_type: data.submissionType,
          confidence_score: data.confidenceScore?.toString() || 'n/a'
        }
      }],
      from: {
        email: this.fromEmail,
        name: this.fromName
      },
      content: [{
        type: 'text/html',
        value: htmlContent
      }],
      categories: ['notification', 'submission_result', passed ? 'success' : 'failure'],
      custom_args: {
        template: 'submission_result',
        outcome: passed ? 'approved' : 'rejected'
      }
    }

    console.log(`Sending submission result: ${data.result} for ${data.checkpointTitle}`)
    return this.sendEmail(payload)
  }

  // Send enhanced consequence notification
  async sendConsequenceNotification(data: ConsequenceNotificationData, userId?: string): Promise<SendEmailResult> {
    // Get unsubscribe URL if userId provided
    if (userId && !data.unsubscribeUrl) {
      const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
      data.unsubscribeUrl = await getUnsubscribeUrl(supabase, userId)
    }
    const htmlContent = EmailTemplates.consequence(data)
    
    const payload: SendGridEmailPayload = {
      personalizations: [{
        to: [{
          email: data.recipientEmail!,
          name: data.recipientName
        }],
        subject: data.wasSpared 
          ? `🍀 MERCY: The roulette favors you for ${data.goalTitle}`
          : `⚠️ CONSEQUENCE: Accountability protocol executed for ${data.goalTitle}`,
        custom_args: {
          notification_type: 'consequence',
          consequence_type: data.consequenceType,
          was_spared: data.wasSpared.toString(),
          is_russian_roulette: data.isRussianRoulette.toString()
        }
      }],
      from: {
        email: this.fromEmail,
        name: this.fromName
      },
      content: [{
        type: 'text/html',
        value: htmlContent
      }],
      categories: ['notification', 'consequence', data.wasSpared ? 'mercy' : data.consequenceType],
      custom_args: {
        template: 'consequence_notification',
        outcome: data.wasSpared ? 'spared' : 'executed'
      }
    }

    console.log(`Sending consequence notification: ${data.consequenceType} - ${data.wasSpared ? 'spared' : 'executed'}`)
    return this.sendEmail(payload)
  }

  // Send goal completion celebration
  async sendGoalCompletion(data: GoalCompletionData, userId?: string): Promise<SendEmailResult> {
    // Get unsubscribe URL if userId provided
    if (userId && !data.unsubscribeUrl) {
      const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
      data.unsubscribeUrl = await getUnsubscribeUrl(supabase, userId)
    }
    const htmlContent = EmailTemplates.goalCompletion(data)
    
    const payload: SendGridEmailPayload = {
      personalizations: [{
        to: [{
          email: data.recipientEmail!,
          name: data.recipientName
        }],
        subject: `🎖️ MISSION ACCOMPLISHED: ${data.goalTitle} completed!`,
        custom_args: {
          notification_type: 'goal_completion',
          completion_rate: data.completionRate.toString(),
          total_checkpoints: data.totalCheckpoints.toString()
        }
      }],
      from: {
        email: this.fromEmail,
        name: this.fromName
      },
      content: [{
        type: 'text/html',
        value: htmlContent
      }],
      categories: ['notification', 'goal_completion', 'success'],
      custom_args: {
        template: 'goal_completion',
        outcome: 'success'
      }
    }

    console.log(`Sending goal completion: ${data.goalTitle}`)
    return this.sendEmail(payload)
  }

  // Send test email
  async sendTestEmail(recipientEmail: string): Promise<SendEmailResult> {
    const htmlContent = EmailTemplates.test(recipientEmail)
    
    const payload: SendGridEmailPayload = {
      personalizations: [{
        to: [{
          email: recipientEmail
        }],
        subject: '🔧 TEST: Threativator notification system verification',
        custom_args: {
          notification_type: 'test',
          template: 'test_email'
        }
      }],
      from: {
        email: this.fromEmail,
        name: this.fromName
      },
      content: [{
        type: 'text/html',
        value: htmlContent
      }],
      categories: ['test', 'development'],
      custom_args: {
        template: 'test',
        purpose: 'system_verification'
      }
    }

    console.log(`Sending test email to: ${recipientEmail}`)
    return this.sendEmail(payload)
  }

  // Check if SendGrid is properly configured
  isConfigured(): boolean {
    return !!this.sendGridApiKey && !!this.fromEmail
  }

  // Get configuration status for debugging
  getConfigStatus() {
    return {
      hasApiKey: !!this.sendGridApiKey,
      fromEmail: this.fromEmail,
      fromName: this.fromName
    }
  }
}

// Singleton instance for easy imports
export const notificationService = new NotificationService()

// Helper function to format dates for emails
export function formatEmailDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  })
}

// Helper function to calculate hours until deadline
export function calculateHoursRemaining(deadline: Date | string): number {
  const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline
  const now = new Date()
  const diffMs = deadlineDate.getTime() - now.getTime()
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60)))
}

// Helper function to check if user should receive notifications
export async function shouldSendNotification(
  supabase: any, 
  userId: string, 
  notificationType: string
): Promise<boolean> {
  try {
    // Use database function to check preferences
    const { data: shouldReceive, error } = await supabase
      .rpc('should_receive_notification', {
        p_user_id: userId,
        p_notification_type: notificationType
      })

    if (error) {
      console.log('Error checking notification preferences, defaulting to enabled:', error)
      return true
    }

    return shouldReceive === true
  } catch (error) {
    // If function doesn't exist or fails, default to enabled
    console.log('Notification preferences function not available, defaulting to enabled')
    return true
  }
}

// Helper function to get unsubscribe URL for user
export async function getUnsubscribeUrl(
  supabase: any,
  userId: string
): Promise<string> {
  try {
    const { data: unsubscribeUrl, error } = await supabase
      .rpc('get_unsubscribe_url', {
        p_user_id: userId
      })

    if (error) {
      console.log('Error getting unsubscribe URL:', error)
      return 'https://threativator.com/settings#notifications'
    }

    return unsubscribeUrl || 'https://threativator.com/settings#notifications'
  } catch (error) {
    console.log('Unsubscribe URL function not available')
    return 'https://threativator.com/settings#notifications'
  }
}

export default NotificationService