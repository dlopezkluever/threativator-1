// Test Email Templates Edge Function
// Tests all email template types with sample data

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { NotificationService, formatEmailDate } from '../shared/notification-service.ts'

interface TestEmailRequest {
  templateType: 'deadline_reminder' | 'submission_result' | 'consequence' | 'goal_completion' | 'test' | 'all'
  recipientEmail: string
  recipientName?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { templateType, recipientEmail, recipientName = 'Test Comrade' } = await req.json() as TestEmailRequest

    console.log(`Testing email template: ${templateType} for ${recipientEmail}`)

    const notificationService = new NotificationService()
    
    // Check if SendGrid is configured
    if (!notificationService.isConfigured()) {
      return new Response(
        JSON.stringify({ 
          error: 'SendGrid not configured', 
          config: notificationService.getConfigStatus() 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const results: any[] = []

    // Test deadline reminder (24h)
    if (templateType === 'deadline_reminder' || templateType === 'all') {
      const deadlineReminderResult = await notificationService.sendDeadlineReminder({
        recipientName,
        recipientEmail,
        goalTitle: 'Complete React Learning Project',
        checkpointTitle: 'Build Authentication System',
        deadline: formatEmailDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
        hoursRemaining: 24,
        submissionUrl: 'https://threativator.com/dashboard?submit=checkpoint-123',
        type: 'checkpoint'
      })
      results.push({ type: 'deadline_reminder_24h', ...deadlineReminderResult })
    }

    // Test urgent deadline reminder (1h)
    if (templateType === 'deadline_reminder' || templateType === 'all') {
      const urgentReminderResult = await notificationService.sendDeadlineReminder({
        recipientName,
        recipientEmail,
        goalTitle: 'Complete React Learning Project',
        checkpointTitle: 'Deploy to Production',
        deadline: formatEmailDate(new Date(Date.now() + 60 * 60 * 1000)),
        hoursRemaining: 1,
        submissionUrl: 'https://threativator.com/dashboard?submit=goal-456',
        type: 'goal'
      })
      results.push({ type: 'deadline_reminder_1h', ...urgentReminderResult })
    }

    // Test submission result - passed
    if (templateType === 'submission_result' || templateType === 'all') {
      const submissionPassedResult = await notificationService.sendSubmissionResult({
        recipientName,
        recipientEmail,
        goalTitle: 'Complete React Learning Project',
        checkpointTitle: 'Build Authentication System',
        submissionType: 'file_upload',
        result: 'passed',
        feedback: 'Excellent implementation! Your JWT authentication system meets all security requirements. The password hashing is properly implemented and the session management is secure.',
        confidenceScore: 0.92,
        submissionUrl: 'https://threativator.com/dashboard?view=checkpoint-123',
        canResubmit: false
      })
      results.push({ type: 'submission_passed', ...submissionPassedResult })
    }

    // Test submission result - failed
    if (templateType === 'submission_result' || templateType === 'all') {
      const submissionFailedResult = await notificationService.sendSubmissionResult({
        recipientName,
        recipientEmail,
        goalTitle: 'Complete React Learning Project',
        checkpointTitle: 'Implement User Dashboard',
        submissionType: 'external_url',
        result: 'failed',
        feedback: 'The submitted dashboard lacks required functionality. Missing: responsive design, data visualization components, and user profile management. Please address these issues.',
        confidenceScore: 0.34,
        submissionUrl: 'https://threativator.com/dashboard?resubmit=checkpoint-124',
        canResubmit: true
      })
      results.push({ type: 'submission_failed', ...submissionFailedResult })
    }

    // Test consequence - monetary penalty
    if (templateType === 'consequence' || templateType === 'all') {
      const monetaryConsequenceResult = await notificationService.sendConsequenceNotification({
        recipientName,
        recipientEmail,
        consequenceType: 'monetary',
        amount: 50.00,
        charity: 'doctors_without_borders',
        goalTitle: 'Complete React Learning Project',
        isRussianRoulette: true,
        wasSpared: false
      })
      results.push({ type: 'consequence_monetary', ...monetaryConsequenceResult })
    }

    // Test consequence - humiliation email
    if (templateType === 'consequence' || templateType === 'all') {
      const humiliationConsequenceResult = await notificationService.sendConsequenceNotification({
        recipientName,
        recipientEmail,
        consequenceType: 'humiliation_email',
        kompromatFilename: 'embarrassing_college_photo.jpg',
        goalTitle: 'Complete React Learning Project',
        isRussianRoulette: false,
        wasSpared: false
      })
      results.push({ type: 'consequence_humiliation', ...humiliationConsequenceResult })
    }

    // Test consequence - mercy (Russian Roulette spared)
    if (templateType === 'consequence' || templateType === 'all') {
      const mercyResult = await notificationService.sendConsequenceNotification({
        recipientName,
        recipientEmail,
        consequenceType: 'monetary',
        amount: 25.00,
        charity: 'red_cross',
        goalTitle: 'Complete React Learning Project',
        isRussianRoulette: true,
        wasSpared: true
      })
      results.push({ type: 'consequence_mercy', ...mercyResult })
    }

    // Test goal completion
    if (templateType === 'goal_completion' || templateType === 'all') {
      const goalCompletionResult = await notificationService.sendGoalCompletion({
        recipientName,
        recipientEmail,
        goalTitle: 'Complete React Learning Project',
        completedAt: formatEmailDate(new Date()),
        totalCheckpoints: 8,
        completionRate: 100,
        nextSteps: 'Consider starting your next challenge: Build a Full-Stack E-commerce Application. The State Authority encourages continuous growth and skill development.'
      })
      results.push({ type: 'goal_completion', ...goalCompletionResult })
    }

    // Test basic system test
    if (templateType === 'test' || templateType === 'all') {
      const testResult = await notificationService.sendTestEmail(recipientEmail)
      results.push({ type: 'test_email', ...testResult })
    }

    // Calculate success rate
    const successCount = results.filter(r => r.success).length
    const totalCount = results.length
    const successRate = totalCount > 0 ? (successCount / totalCount) * 100 : 0

    console.log(`Email test completed: ${successCount}/${totalCount} successful (${successRate}%)`)

    return new Response(
      JSON.stringify({
        success: successRate === 100,
        message: `Email template test completed: ${successCount}/${totalCount} emails sent successfully`,
        successRate: `${successRate}%`,
        results,
        config: notificationService.getConfigStatus()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Email template test error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Email template test failed', 
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

// Example usage:
/*
POST https://your-project.supabase.co/functions/v1/testEmailTemplates
{
  "templateType": "all",
  "recipientEmail": "test@example.com",
  "recipientName": "Test User"
}

Or test individual templates:
{
  "templateType": "deadline_reminder",
  "recipientEmail": "test@example.com",
  "recipientName": "Test User"  
}
*/