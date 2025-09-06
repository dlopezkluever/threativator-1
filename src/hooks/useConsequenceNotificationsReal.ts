import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface ConsequenceNotification {
  id: string
  consequence_type: string
  triggered_at: string
  execution_status: string
  execution_details: any
  checkpoint_id?: string
  goal_id: string
  monetary_amount?: number
  charity_destination?: string
  kompromat_id?: string
  failure_type: 'checkpoint' | 'final_deadline'
  goal_title?: string
  checkpoint_title?: string
}

export function useConsequenceNotificationsReal() {
  const { user } = useAuth()
  const [pendingConsequence, setPendingConsequence] = useState<ConsequenceNotification | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [consequenceQueue, setConsequenceQueue] = useState<ConsequenceNotification[]>([])
  const [isProcessingQueue, setIsProcessingQueue] = useState(false)

  // Load unacknowledged consequences on mount and user login
  const loadUnacknowledgedConsequences = useCallback(async () => {
    if (!user) return

    try {
      console.log('🔍 Checking for unacknowledged consequences...')
      
      const { data: consequences, error } = await supabase
        .rpc('get_unacknowledged_consequences', { user_uuid: user.id })

      if (error) {
        console.error('Error loading unacknowledged consequences:', error)
        return
      }

      if (consequences && consequences.length > 0) {
        console.log(`📢 Found ${consequences.length} unacknowledged consequence(s)`)
        
        // Add to queue and start processing
        setConsequenceQueue(consequences)
        
        // Mark all as shown (but not acknowledged)
        for (const consequence of consequences) {
          await supabase.rpc('mark_consequence_shown', { consequence_id: consequence.id })
        }
      } else {
        console.log('✅ No unacknowledged consequences found')
      }
    } catch (error) {
      console.error('Error in loadUnacknowledgedConsequences:', error)
    }
  }, [user])

  // Process the consequence queue (show one modal at a time)
  useEffect(() => {
    if (consequenceQueue.length > 0 && !isProcessingQueue && !isModalOpen) {
      console.log('🎭 Starting consequence queue processing...')
      setIsProcessingQueue(true)
      
      // Take the first consequence from the queue
      const nextConsequence = consequenceQueue[0]
      setPendingConsequence(nextConsequence)
      setIsModalOpen(true)
      
      console.log(`Showing consequence: ${nextConsequence.failure_type} for ${nextConsequence.goal_title}`)
    }
  }, [consequenceQueue, isProcessingQueue, isModalOpen])

  // Load unacknowledged consequences on component mount and user change
  useEffect(() => {
    loadUnacknowledgedConsequences()
  }, [loadUnacknowledgedConsequences])

  // Set up real-time subscription for NEW consequences
  useEffect(() => {
    if (!user) return

    console.log('🔴 Setting up real-time consequence subscription...')

    const subscription = supabase
      .channel(`consequence-realtime-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'consequences',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('🚨 NEW CONSEQUENCE DETECTED:', payload.new)
          
          // Only show if execution was successful
          if (payload.new.execution_status === 'completed') {
            // Fetch full consequence data
            const { data: consequenceData, error } = await supabase
              .rpc('get_unacknowledged_consequences', { user_uuid: user.id })

            if (error) {
              console.error('Error fetching new consequence details:', error)
              return
            }

            // Find the new consequence in the results
            const newConsequence = consequenceData?.find(c => c.id === payload.new.id)
            
            if (newConsequence) {
              console.log('📢 Adding new consequence to queue')
              setConsequenceQueue(prev => [...prev, newConsequence])
              
              // Mark as shown immediately
              await supabase.rpc('mark_consequence_shown', { consequence_id: newConsequence.id })
              
              // Play alert sound if available
              try {
                const audio = new Audio('/sounds/consequence-alert.mp3')
                audio.volume = 0.3
                audio.play().catch(() => {
                  console.log('Audio not available or failed to play')
                })
              } catch (error) {
                // Ignore audio errors
              }
            }
          }
        }
      )
      .subscribe()

    return () => {
      console.log('🔴 Cleaning up consequence subscription')
      subscription.unsubscribe()
    }
  }, [user])

  // Set up real-time submission grading failure detection
  useEffect(() => {
    if (!user) return

    console.log('📝 Setting up submission grading failure subscription...')

    const submissionSubscription = supabase
      .channel(`submission-failures-${user.id}`)
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

          // Check if submission just changed from pending to failed
          if (oldSubmission.status !== 'failed' && newSubmission.status === 'failed') {
            console.log('💀 SUBMISSION GRADING FAILURE DETECTED:', newSubmission)
            
            // Create a pseudo-consequence for UI notification
            const gradingFailure: ConsequenceNotification = {
              id: `grading-failure-${newSubmission.id}`,
              consequence_type: 'grading_failure' as any,
              triggered_at: new Date().toISOString(),
              execution_status: 'completed',
              execution_details: {
                triggered: true,
                reason: 'Submission failed grading',
                submission_id: newSubmission.id,
                feedback: newSubmission.feedback_text || 'Submission did not meet requirements'
              },
              goal_id: 'unknown', // We'd need to join to get this
              failure_type: 'checkpoint',
              checkpoint_title: 'Submission Grading'
            }

            console.log('📢 Adding grading failure to queue')
            setConsequenceQueue(prev => [...prev, gradingFailure])
          }
        }
      )
      .subscribe()

    return () => {
      console.log('📝 Cleaning up submission subscription')
      submissionSubscription.unsubscribe()
    }
  }, [user])

  // Handle dismissing current consequence and moving to next in queue
  const dismissConsequence = useCallback(async () => {
    console.log('✅ Dismissing current consequence...')
    
    if (pendingConsequence && pendingConsequence.id.startsWith('grading-failure-')) {
      // For grading failures, just dismiss (no database record to acknowledge)
      console.log('Dismissing grading failure notification')
    } else if (pendingConsequence) {
      // For real consequences, mark as acknowledged in database
      try {
        const { error } = await supabase.rpc('acknowledge_consequence', { 
          consequence_id: pendingConsequence.id 
        })
        
        if (error) {
          console.error('Error acknowledging consequence:', error)
        } else {
          console.log('✅ Consequence acknowledged in database')
        }
      } catch (error) {
        console.error('Error in acknowledge_consequence:', error)
      }
    }

    // Remove current consequence from queue
    setConsequenceQueue(prev => prev.slice(1))
    setPendingConsequence(null)
    setIsModalOpen(false)
    setIsProcessingQueue(false)
    
    console.log(`Queue remaining: ${consequenceQueue.length - 1} consequences`)
  }, [pendingConsequence, consequenceQueue.length])

  // Get consequence history (for debugging/admin)
  const getConsequenceHistory = useCallback(async () => {
    if (!user) return []

    try {
      const { data, error } = await supabase
        .from('consequences')
        .select(`
          *,
          goals!left (
            id,
            title
          ),
          checkpoints!left (
            id,
            title
          )
        `)
        .eq('user_id', user.id)
        .order('triggered_at', { ascending: false })

      if (error) {
        console.error('Error fetching consequence history:', error)
        return []
      }

      return data.map(consequence => ({
        ...consequence,
        failure_type: consequence.checkpoint_id ? 'checkpoint' : 'final_deadline'
      }))
    } catch (error) {
      console.error('Error in getConsequenceHistory:', error)
      return []
    }
  }, [user])

  // Manual refresh function to check for new consequences
  const refreshConsequences = useCallback(() => {
    console.log('🔄 Manual refresh of consequences...')
    loadUnacknowledgedConsequences()
  }, [loadUnacknowledgedConsequences])

  // Debug info
  const debugInfo = {
    queueLength: consequenceQueue.length,
    currentConsequence: pendingConsequence?.id || null,
    isModalOpen,
    isProcessingQueue
  }

  return {
    pendingConsequence,
    isModalOpen,
    dismissConsequence,
    getConsequenceHistory,
    refreshConsequences,
    queueLength: consequenceQueue.length,
    debugInfo
  }
}