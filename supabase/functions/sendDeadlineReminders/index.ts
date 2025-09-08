// Send Deadline Reminders Edge Function
// Automatically sends 24h and 1h reminder emails for upcoming deadlines

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { NotificationService, formatEmailDate, calculateHoursRemaining, shouldSendNotification } from '../shared/notification-service.ts'

interface DeadlineItem {
  item_type: 'checkpoint' | 'goal'
  item_id: string
  user_id: string
  user_email: string
  user_display_name: string
  title: string
  goal_title: string
  deadline_date: string
  hours_until_deadline: number
  reminder_type: '24h' | '1h'
  submission_url: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Authenticate using service role
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.includes('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const token = authHeader.split('Bearer ')[1]
    
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabase = createClient(supabaseUrl, token, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('Starting deadline reminder processing...')

    // Initialize notification service
    const notificationService = new NotificationService()
    
    if (!notificationService.isConfigured()) {
      console.error('Notification service not configured')
      return new Response(
        JSON.stringify({ 
          error: 'SendGrid not configured',
          config: notificationService.getConfigStatus()
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get upcoming deadlines that need reminders
    const { data: upcomingDeadlines, error: deadlineError } = await supabase
      .rpc('find_upcoming_deadlines')

    if (deadlineError) {
      console.error('Error finding upcoming deadlines:', deadlineError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to find upcoming deadlines',
          details: deadlineError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const deadlines = upcomingDeadlines as DeadlineItem[] || []
    console.log(`Found ${deadlines.length} upcoming deadlines needing reminders`)

    const results = []
    let sentCount = 0
    let errorCount = 0

    // Process each deadline
    for (const deadline of deadlines) {
      try {
        console.log(`Processing ${deadline.reminder_type} reminder for ${deadline.item_type}: ${deadline.title}`)

        // Check if user wants to receive this type of notification
        const shouldSend = await shouldSendNotification(
          supabase, 
          deadline.user_id, 
          'deadline_reminders'
        )

        if (!shouldSend) {
          console.log(`User ${deadline.user_email} has disabled deadline reminders`)
          results.push({
            item: `${deadline.item_type}:${deadline.item_id}`,
            reminder_type: deadline.reminder_type,
            status: 'skipped',
            reason: 'notifications_disabled'
          })
          continue
        }

        // Calculate exact hours remaining
        const exactHoursRemaining = calculateHoursRemaining(deadline.deadline_date)
        
        // Send the reminder email
        const emailResult = await notificationService.sendDeadlineReminder({
          recipientName: deadline.user_display_name,
          recipientEmail: deadline.user_email,
          goalTitle: deadline.goal_title,
          checkpointTitle: deadline.item_type === 'checkpoint' ? deadline.title : undefined,
          deadline: formatEmailDate(deadline.deadline_date),
          hoursRemaining: exactHoursRemaining,
          submissionUrl: deadline.submission_url,
          type: deadline.item_type
        })

        if (emailResult.success) {
          // Mark reminder as sent in database
          await supabase.rpc('mark_reminder_sent', {
            p_item_type: deadline.item_type,
            p_item_id: deadline.item_id,
            p_reminder_type: deadline.reminder_type
          })

          // Log the notification
          await supabase.rpc('log_notification', {
            p_user_id: deadline.user_id,
            p_goal_id: deadline.item_type === 'goal' ? deadline.item_id : null,
            p_checkpoint_id: deadline.item_type === 'checkpoint' ? deadline.item_id : null,
            p_notification_type: 'deadline_reminder',
            p_reminder_type: deadline.reminder_type,
            p_recipient_email: deadline.user_email,
            p_subject: `${deadline.reminder_type === '1h' ? 'CRITICAL' : 'URGENT'}: ${exactHoursRemaining}h remaining for ${deadline.goal_title}`,
            p_sendgrid_message_id: emailResult.messageId || null,
            p_deadline_date: deadline.deadline_date,
            p_hours_until_deadline: exactHoursRemaining
          })

          sentCount++
          console.log(`✅ Sent ${deadline.reminder_type} reminder for ${deadline.title} to ${deadline.user_email}`)
          
          results.push({
            item: `${deadline.item_type}:${deadline.item_id}`,
            title: deadline.title,
            recipient: deadline.user_email,
            reminder_type: deadline.reminder_type,
            hours_remaining: exactHoursRemaining,
            status: 'sent',
            message_id: emailResult.messageId
          })
        } else {
          errorCount++
          console.error(`❌ Failed to send reminder for ${deadline.title}:`, emailResult.error)
          
          results.push({
            item: `${deadline.item_type}:${deadline.item_id}`,
            title: deadline.title,
            recipient: deadline.user_email,
            reminder_type: deadline.reminder_type,
            status: 'failed',
            error: emailResult.error
          })
        }

      } catch (error) {
        errorCount++
        console.error(`Error processing deadline ${deadline.item_id}:`, error)
        
        results.push({
          item: `${deadline.item_type}:${deadline.item_id}`,
          title: deadline.title,
          status: 'error',
          error: error.message
        })
      }
    }

    const successRate = deadlines.length > 0 ? (sentCount / deadlines.length) * 100 : 100

    console.log(`Deadline reminder processing completed: ${sentCount}/${deadlines.length} sent (${successRate.toFixed(1)}%)`)

    return new Response(
      JSON.stringify({
        success: errorCount === 0,
        message: `Processed ${deadlines.length} deadline reminders: ${sentCount} sent, ${errorCount} failed`,
        stats: {
          total_found: deadlines.length,
          sent: sentCount,
          failed: errorCount,
          success_rate: `${successRate.toFixed(1)}%`
        },
        results
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Deadline reminder system error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Deadline reminder system failed', 
        details: error.message,
        stack: error.stack 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

/* 
Example manual trigger:
POST https://your-project.supabase.co/functions/v1/sendDeadlineReminders
Authorization: Bearer your-service-role-key
Content-Type: application/json

{}

This function is designed to be called automatically via pg_cron every hour:
SELECT trigger_deadline_reminders();
*/