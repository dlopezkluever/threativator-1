import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface SubmissionStatusNotification {
  id: string
  submissionId: string
  status: 'passed' | 'failed'
  feedbackText: string
  confidenceScore?: number
  aiAnalysisResult?: any
  submissionType: 'file_upload' | 'external_url' | 'text_description'
  submittedAt: string
  gradedAt: string
  checkpointTitle: string
  goalTitle: string
  checkpointId: string
}

export function useSubmissionStatusNotifications() {
  const { user } = useAuth()
  const [pendingNotification, setPendingNotification] = useState<SubmissionStatusNotification | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [notificationQueue, setNotificationQueue] = useState<SubmissionStatusNotification[]>([])
  const [isProcessingQueue, setIsProcessingQueue] = useState(false)
  const subscriptionRef = useRef<any>(null)

  // Load unacknowledged grading results - check for recent submissions that were graded
  const loadUnacknowledgedResults = async () => {
    if (!user?.id) return

    try {
      console.log('🔍 Checking for unacknowledged submission results...')

      // Look for submissions graded in the last 24 hours that haven't been shown
      const twentyFourHoursAgo = new Date()
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

      const { data: submissions, error } = await supabase
        .from('submissions')
        .select(`
          *,
          checkpoints (
            id,
            title,
            goals (
              id,
              title
            )
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['passed', 'failed'])
        .gte('graded_at', twentyFourHoursAgo.toISOString())
        .order('graded_at', { ascending: true })

      if (error) {
        console.error('Error loading submission results:', error)
        return
      }

      if (submissions && submissions.length > 0) {
        console.log(`📢 Found ${submissions.length} recent grading result(s)`)

        // Convert to notification format
        const notifications = submissions
          .filter(submission => submission.graded_at) // Only graded submissions
          .map(submission => ({
            id: `submission-${submission.id}`,
            submissionId: submission.id,
            status: submission.status as 'passed' | 'failed',
            feedbackText: submission.feedback_text || '',
            confidenceScore: submission.confidence_score,
            aiAnalysisResult: submission.ai_analysis_result,
            submissionType: submission.submission_type,
            submittedAt: submission.submitted_at,
            gradedAt: submission.graded_at,
            checkpointTitle: submission.checkpoints?.title || 'Unknown Checkpoint',
            goalTitle: submission.checkpoints?.goals?.title || 'Unknown Goal',
            checkpointId: submission.checkpoint_id
          })) as SubmissionStatusNotification[]

        setNotificationQueue(prev => [...prev, ...notifications])
      } else {
        console.log('✅ No recent grading results found')
      }
    } catch (error) {
      console.error('Error in loadUnacknowledgedResults:', error)
    }
  }

  // Process the notification queue (show one modal at a time)
  useEffect(() => {
    if (notificationQueue.length > 0 && !isProcessingQueue && !isModalOpen) {
      console.log('🎭 Starting submission result queue processing...')
      setIsProcessingQueue(true)

      // Take the first notification from the queue
      const nextNotification = notificationQueue[0]
      setPendingNotification(nextNotification)
      setIsModalOpen(true)

      console.log(`Showing ${nextNotification.status} result for: ${nextNotification.checkpointTitle}`)
    }
  }, [notificationQueue, isProcessingQueue, isModalOpen])

  // Load results on mount
  useEffect(() => {
    if (!user?.id) return

    // Small delay to ensure auth context is stable
    const timer = setTimeout(() => {
      loadUnacknowledgedResults()
    }, 500)

    return () => clearTimeout(timer)
  }, [user?.id])

  // Set up real-time subscription for submission status changes
  useEffect(() => {
    if (!user?.id) return

    console.log('📝 Setting up submission status subscription...')

    // Clean up existing subscription first
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
    }

    subscriptionRef.current = supabase
      .channel(`submissions-status-${user.id}-${Date.now()}`) // Unique channel name
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'submissions',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          const newSubmission = payload.new
          const oldSubmission = payload.old

          // Check if submission status just changed to passed or failed
          if (oldSubmission?.status !== 'passed' && newSubmission?.status === 'passed') {
            console.log('✅ SUBMISSION PASSED DETECTED:', newSubmission)
            await handleStatusChange(newSubmission, 'passed')
          } else if (oldSubmission?.status !== 'failed' && newSubmission?.status === 'failed') {
            console.log('❌ SUBMISSION FAILED DETECTED:', newSubmission)
            await handleStatusChange(newSubmission, 'failed')
          }
        }
      )
      .subscribe()

    return () => {
      console.log('📝 Cleaning up submission status subscription')
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [user?.id])

  // Handle status change by fetching full submission data
  const handleStatusChange = async (submission: any, status: 'passed' | 'failed') => {
    try {
      // Small delay to ensure database consistency
      setTimeout(async () => {
        // Fetch the specific submission with relations
        const { data: fullSubmission, error } = await supabase
          .from('submissions')
          .select(`
            *,
            checkpoints (
              id,
              title,
              goals (
                id,
                title
              )
            )
          `)
          .eq('id', submission.id)
          .single()

        if (!error && fullSubmission) {
          const notification: SubmissionStatusNotification = {
            id: `submission-${fullSubmission.id}-${Date.now()}`,
            submissionId: fullSubmission.id,
            status: status,
            feedbackText: fullSubmission.feedback_text || '',
            confidenceScore: fullSubmission.confidence_score,
            aiAnalysisResult: fullSubmission.ai_analysis_result,
            submissionType: fullSubmission.submission_type,
            submittedAt: fullSubmission.submitted_at,
            gradedAt: fullSubmission.graded_at || new Date().toISOString(),
            checkpointTitle: fullSubmission.checkpoints?.title || 'Unknown Checkpoint',
            goalTitle: fullSubmission.checkpoints?.goals?.title || 'Unknown Goal',
            checkpointId: fullSubmission.checkpoint_id
          }

          console.log(`📢 Adding ${status} notification to queue`)
          setNotificationQueue(prev => [...prev, notification])
        }
      }, 1000)
    } catch (error) {
      console.error('Error processing submission status change:', error)
    }
  }

  // Handle dismissing current notification and moving to next in queue
  const dismissNotification = () => {
    console.log('✅ Dismissing current submission result...')

    // Remove current notification from queue
    setNotificationQueue(prev => prev.slice(1))
    setPendingNotification(null)
    setIsModalOpen(false)
    setIsProcessingQueue(false)

    console.log(`Queue remaining: ${notificationQueue.length - 1} notifications`)
  }

  // Manual refresh function
  const refreshResults = () => {
    console.log('🔄 Manual refresh of submission results...')
    if (user?.id) {
      loadUnacknowledgedResults()
    }
  }

  return {
    pendingNotification,
    isModalOpen,
    dismissNotification,
    refreshResults,
    queueLength: notificationQueue.length,
    debugInfo: {
      queueLength: notificationQueue.length,
      currentNotification: pendingNotification?.id || null,
      isModalOpen,
      isProcessingQueue
    }
  }
}