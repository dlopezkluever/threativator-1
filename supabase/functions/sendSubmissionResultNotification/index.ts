// Send Submission Result Notification Edge Function
// Handles email notifications for both AI and human grading results

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { NotificationService, shouldSendNotification } from '../shared/notification-service.ts'

interface SubmissionResultRequest {
  submission_id: string
  old_status?: string
  new_status?: string
  graded_at?: string
  test_mode?: boolean
}

interface SubmissionWithData {
  id: string
  user_id: string
  submission_type: 'file_upload' | 'external_url' | 'text_description'
  status: string
  feedback_text?: string
  confidence_score?: number
  graded_at?: string
  checkpoints: {
    id: string
    title: string
    deadline: string
    status: string
    goals: {
      id: string
      title: string
    }
  }
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

    const requestData = await req.json() as SubmissionResultRequest
    const { submission_id, test_mode = false } = requestData

    if (!submission_id) {
      return new Response(
        JSON.stringify({ error: 'submission_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Processing submission result notification for: ${submission_id}`)

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

    // Get submission with related data
    const { data: submissionData, error: submissionError } = await supabase
      .from('submissions')
      .select(`
        id,
        user_id,
        submission_type,
        status,
        feedback_text,
        confidence_score,
        graded_at,
        checkpoints!inner (
          id,
          title,
          deadline,
          status,
          goals!inner (
            id,
            title
          )
        )
      `)
      .eq('id', submission_id)
      .single()

    if (submissionError || !submissionData) {
      console.error('Submission not found:', submissionError)
      return new Response(
        JSON.stringify({ error: 'Submission not found', details: submissionError }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const submission = submissionData as SubmissionWithData

    // Only process passed/failed statuses
    if (!['passed', 'failed'].includes(submission.status)) {
      return new Response(
        JSON.stringify({ 
          message: 'No notification needed - submission status is not passed/failed',
          status: submission.status 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user data
    const { data: userRecord } = await supabase.auth.admin.getUserById(submission.user_id)
    const userData = userRecord?.user

    if (!userData || !userData.email) {
      console.log('No user email found, skipping notification')
      return new Response(
        JSON.stringify({ message: 'No user email found, notification skipped' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user wants submission result notifications
    if (!test_mode) {
      const shouldSend = await shouldSendNotification(
        supabase,
        submission.user_id,
        'submission_results'
      )

      if (!shouldSend) {
        console.log(`User ${userData.email} has disabled submission result notifications`)
        return new Response(
          JSON.stringify({ message: 'User has disabled submission result notifications' }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Calculate if user can resubmit (deadline hasn't passed)
    const now = new Date()
    const deadline = new Date(submission.checkpoints.deadline)
    const canResubmit = deadline > now && submission.checkpoints.status === 'pending'

    // Send the notification
    const emailResult = await notificationService.sendSubmissionResult({
      recipientName: userData.raw_user_meta_data?.display_name || 'Comrade',
      recipientEmail: userData.email,
      goalTitle: submission.checkpoints.goals.title,
      checkpointTitle: submission.checkpoints.title,
      submissionType: submission.submission_type,
      result: submission.status as 'passed' | 'failed',
      feedback: submission.feedback_text || 'No feedback provided',
      confidenceScore: submission.confidence_score,
      submissionUrl: `https://threativator.com/dashboard?view=checkpoint-${submission.checkpoints.id}`,
      canResubmit
    })

    // Log the notification
    const logResult = await supabase.rpc('log_notification', {
      p_user_id: submission.user_id,
      p_goal_id: submission.checkpoints.goals.id,
      p_checkpoint_id: submission.checkpoints.id,
      p_notification_type: 'submission_result',
      p_reminder_type: 'immediate',
      p_recipient_email: userData.email,
      p_subject: submission.status === 'passed' 
        ? `✅ Submission APPROVED: ${submission.checkpoints.title}`
        : `❌ Submission REJECTED: ${submission.checkpoints.title}`,
      p_sendgrid_message_id: emailResult.messageId || null,
      p_deadline_date: submission.checkpoints.deadline,
      p_hours_until_deadline: Math.max(0, Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60)))
    })

    if (emailResult.success) {
      console.log(`✅ Sent submission result notification for ${submission.checkpoints.title} to ${userData.email}`)
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Submission result notification sent successfully',
          recipient: userData.email,
          submission_id: submission.id,
          result: submission.status,
          message_id: emailResult.messageId
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } else {
      console.error(`❌ Failed to send submission result notification:`, emailResult.error)
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to send notification email',
          details: emailResult.error
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (error) {
    console.error('Submission result notification error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Submission result notification failed', 
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
Example usage:
POST https://your-project.supabase.co/functions/v1/sendSubmissionResultNotification
Authorization: Bearer your-service-role-key
Content-Type: application/json

{
  "submission_id": "uuid-here",
  "old_status": "pending",
  "new_status": "passed",
  "graded_at": "2024-01-01T00:00:00Z"
}

Or for testing:
{
  "submission_id": "uuid-here",
  "test_mode": true
}
*/