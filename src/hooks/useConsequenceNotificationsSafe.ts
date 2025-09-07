import { useState, useEffect, useRef } from 'react'
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

export function useConsequenceNotificationsSafe() {
  const { user } = useAuth()
  const [pendingConsequence, setPendingConsequence] = useState<ConsequenceNotification | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [consequenceQueue, setConsequenceQueue] = useState<ConsequenceNotification[]>([])
  const [isProcessingQueue, setIsProcessingQueue] = useState(false)
  const subscriptionRef = useRef<any>(null)
  const submissionSubscriptionRef = useRef<any>(null)

  // Load unacknowledged consequences - simplified version
  const loadUnacknowledgedConsequences = async () => {
    if (!user?.id) return

    try {
      console.log('🔍 Checking for unacknowledged consequences...')
      
      // Use direct table query instead of RPC to avoid auth context issues
      const { data: consequences, error } = await supabase
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
        .is('acknowledged_at', null)
        .eq('execution_status', 'completed')
        .order('triggered_at', { ascending: true })

      if (error) {
        console.error('Error loading consequences:', error)
        return
      }

      if (consequences && consequences.length > 0) {
        console.log(`📢 Found ${consequences.length} unacknowledged consequence(s)`)
        
        // Convert to proper format and add to queue
        const formattedConsequences = consequences.map(consequence => ({
          ...consequence,
          failure_type: consequence.checkpoint_id ? 'checkpoint' : 'final_deadline',
          goal_title: consequence.goals?.title,
          checkpoint_title: consequence.checkpoints?.title
        })) as ConsequenceNotification[]
        
        setConsequenceQueue(formattedConsequences)
        
        // Mark all as shown (but not acknowledged)
        for (const consequence of consequences) {
          await supabase
            .from('consequences')
            .update({ notification_shown: true })
            .eq('id', consequence.id)
            .eq('user_id', user.id)
        }
      } else {
        console.log('✅ No unacknowledged consequences found')
      }
    } catch (error) {
      console.error('Error in loadUnacknowledgedConsequences:', error)
    }
  }

  // Process the consequence queue (show one modal at a time)
  useEffect(() => {
    if (consequenceQueue.length > 0 && !isProcessingQueue && !isModalOpen) {
      console.log('🎭 Starting consequence queue processing...')
      setIsProcessingQueue(true)
      
      // Take the first consequence from the queue
      const nextConsequence = consequenceQueue[0]
      setPendingConsequence(nextConsequence)
      setIsModalOpen(true)
      
      console.log(`Showing consequence: ${nextConsequence.failure_type} for ${nextConsequence.goal_title || nextConsequence.checkpoint_title}`)
    }
  }, [consequenceQueue, isProcessingQueue, isModalOpen])

  // Load consequences on mount - safe pattern
  useEffect(() => {
    if (!user?.id) return
    
    // Small delay to ensure auth context is stable
    const timer = setTimeout(() => {
      loadUnacknowledgedConsequences()
    }, 500)
    
    return () => clearTimeout(timer)
  }, [user?.id])

  // Set up real-time subscription for NEW consequences - safer pattern
  useEffect(() => {
    if (!user?.id) return

    console.log('🔴 Setting up consequence subscription...')

    // Clean up existing subscription first
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
    }

    subscriptionRef.current = supabase
      .channel(`consequences-${user.id}-${Date.now()}`) // Unique channel name
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
          
          // Only process successfully executed consequences
          if (payload.new.execution_status === 'completed') {
            // Small delay to ensure database consistency
            setTimeout(async () => {
              try {
                // Fetch the specific consequence with relations
                const { data: newConsequence, error } = await supabase
                  .from('consequences')
                  .select(`
                    *,
                    goals!left (id, title),
                    checkpoints!left (id, title)
                  `)
                  .eq('id', payload.new.id)
                  .single()

                if (!error && newConsequence) {
                  const formattedConsequence: ConsequenceNotification = {
                    ...newConsequence,
                    failure_type: newConsequence.checkpoint_id ? 'checkpoint' : 'final_deadline',
                    goal_title: newConsequence.goals?.title,
                    checkpoint_title: newConsequence.checkpoints?.title
                  }

                  console.log('📢 Adding new consequence to queue')
                  setConsequenceQueue(prev => [...prev, formattedConsequence])
                  
                  // Mark as shown
                  await supabase
                    .from('consequences')
                    .update({ notification_shown: true })
                    .eq('id', newConsequence.id)
                }
              } catch (error) {
                console.error('Error processing new consequence:', error)
              }
            }, 1000)
          }
        }
      )
      .subscribe()

    return () => {
      console.log('🔴 Cleaning up consequence subscription')
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [user?.id])

  // Set up submission grading failure detection - safer pattern  
  useEffect(() => {
    if (!user?.id) return

    console.log('📝 Setting up submission grading subscription...')

    // Clean up existing subscription first
    if (submissionSubscriptionRef.current) {
      submissionSubscriptionRef.current.unsubscribe()
    }

    submissionSubscriptionRef.current = supabase
      .channel(`submissions-${user.id}-${Date.now()}`) // Unique channel name
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

          // Check if submission just changed to failed
          if (oldSubmission?.status !== 'failed' && newSubmission?.status === 'failed') {
            console.log('💀 SUBMISSION GRADING FAILURE DETECTED:', newSubmission)
            
            // Create pseudo-consequence for grading failure
            const gradingFailure: ConsequenceNotification = {
              id: `grading-failure-${newSubmission.id}-${Date.now()}`,
              consequence_type: 'grading_failure' as any,
              triggered_at: new Date().toISOString(),
              execution_status: 'completed',
              execution_details: {
                triggered: true,
                reason: 'Submission failed grading',
                submission_id: newSubmission.id,
                feedback: newSubmission.feedback_text || 'Submission did not meet requirements'
              },
              goal_id: newSubmission.goal_id || 'unknown',
              failure_type: 'checkpoint',
              checkpoint_title: 'Submission Grading',
              goal_title: 'Grading Failure'
            }

            console.log('📢 Adding grading failure to queue')
            setConsequenceQueue(prev => [...prev, gradingFailure])
          }
        }
      )
      .subscribe()

    return () => {
      console.log('📝 Cleaning up submission subscription')
      if (submissionSubscriptionRef.current) {
        submissionSubscriptionRef.current.unsubscribe()
        submissionSubscriptionRef.current = null
      }
    }
  }, [user?.id])

  // Handle dismissing current consequence and moving to next in queue
  const dismissConsequence = async () => {
    console.log('✅ Dismissing current consequence...')
    
    if (pendingConsequence) {
      // For grading failures, no database record to acknowledge
      if (!pendingConsequence.id.startsWith('grading-failure-')) {
        try {
          // Mark as acknowledged in database
          const { error } = await supabase
            .from('consequences')
            .update({ acknowledged_at: new Date().toISOString() })
            .eq('id', pendingConsequence.id)
            .eq('user_id', user?.id)
          
          if (error) {
            console.error('Error acknowledging consequence:', error)
          } else {
            console.log('✅ Consequence acknowledged in database')
          }
        } catch (error) {
          console.error('Error in acknowledge process:', error)
        }
      }
    }

    // Remove current consequence from queue
    setConsequenceQueue(prev => prev.slice(1))
    setPendingConsequence(null)
    setIsModalOpen(false)
    setIsProcessingQueue(false)
    
    console.log(`Queue remaining: ${consequenceQueue.length - 1} consequences`)
  }

  // Get consequence history (for debugging/admin)
  const getConsequenceHistory = async () => {
    if (!user?.id) return []

    try {
      const { data, error } = await supabase
        .from('consequences')
        .select(`
          *,
          goals!left (id, title),
          checkpoints!left (id, title)
        `)
        .eq('user_id', user.id)
        .order('triggered_at', { ascending: false })

      if (error) {
        console.error('Error fetching consequence history:', error)
        return []
      }

      return data?.map(consequence => ({
        ...consequence,
        failure_type: consequence.checkpoint_id ? 'checkpoint' : 'final_deadline'
      })) || []
    } catch (error) {
      console.error('Error in getConsequenceHistory:', error)
      return []
    }
  }

  // Manual refresh function
  const refreshConsequences = () => {
    console.log('🔄 Manual refresh of consequences...')
    if (user?.id) {
      loadUnacknowledgedConsequences()
    }
  }

  return {
    pendingConsequence,
    isModalOpen,
    dismissConsequence,
    getConsequenceHistory,
    refreshConsequences,
    queueLength: consequenceQueue.length,
    debugInfo: {
      queueLength: consequenceQueue.length,
      currentConsequence: pendingConsequence?.id || null,
      isModalOpen,
      isProcessingQueue
    }
  }
}