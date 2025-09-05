import { useState, useEffect } from 'react'
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
}

export function useConsequenceNotifications() {
  const { user } = useAuth()
  const [pendingConsequence, setPendingConsequence] = useState<ConsequenceNotification | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date>(new Date())

  // Check for new consequences on component mount and periodically
  useEffect(() => {
    if (!user) return

    const checkForNewConsequences = async () => {
      try {
        // Query for consequences triggered since last check
        const { data: consequences, error } = await supabase
          .from('consequences')
          .select(`
            *,
            checkpoints!left (
              id,
              title
            ),
            goals!left (
              id,
              title,
              final_deadline
            )
          `)
          .eq('user_id', user.id)
          .gte('triggered_at', lastChecked.toISOString())
          .order('triggered_at', { ascending: false })
          .limit(1)

        if (error) {
          console.error('Error checking for consequences:', error)
          return
        }

        if (consequences && consequences.length > 0) {
          const latestConsequence = consequences[0]
          
          // Determine if this is a checkpoint or final deadline failure
          const failureType = latestConsequence.checkpoint_id ? 'checkpoint' : 'final_deadline'
          
          setPendingConsequence({
            ...latestConsequence,
            failure_type: failureType
          })
          setIsModalOpen(true)
        }

        setLastChecked(new Date())
      } catch (error) {
        console.error('Error in consequence check:', error)
      }
    }

    // Initial check
    checkForNewConsequences()

    // Set up periodic checking every 30 seconds
    const interval = setInterval(checkForNewConsequences, 30000)

    return () => clearInterval(interval)
  }, [user, lastChecked])

  // Set up real-time subscription for immediate notifications
  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel('consequence-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'consequences',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('New consequence detected:', payload.new)
          
          // Fetch full consequence data with relations
          const { data: consequenceData, error } = await supabase
            .from('consequences')
            .select(`
              *,
              checkpoints!left (
                id,
                title
              ),
              goals!left (
                id,
                title,
                final_deadline
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (error) {
            console.error('Error fetching consequence details:', error)
            return
          }

          const failureType = consequenceData.checkpoint_id ? 'checkpoint' : 'final_deadline'
          
          setPendingConsequence({
            ...consequenceData,
            failure_type: failureType
          })
          setIsModalOpen(true)
          
          // Play ominous sound effect if available
          try {
            const audio = new Audio('/sounds/consequence-alert.mp3')
            audio.volume = 0.3
            audio.play().catch(() => {
              // Ignore errors if sound file doesn't exist or can't play
            })
          } catch (error) {
            // Ignore audio errors
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const dismissConsequence = () => {
    setIsModalOpen(false)
    setPendingConsequence(null)
  }

  const getConsequenceHistory = async () => {
    if (!user) return []

    try {
      const { data, error } = await supabase
        .from('consequences')
        .select(`
          *,
          checkpoints!left (
            id,
            title
          ),
          goals (
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
  }

  // Manual trigger for testing
  const triggerTestConsequence = async () => {
    if (!user) return

    const testConsequence: ConsequenceNotification = {
      id: 'test-' + Date.now(),
      consequence_type: 'monetary',
      triggered_at: new Date().toISOString(),
      execution_status: 'completed',
      execution_details: {
        triggered: true,
        amount_transferred: 25.00,
        charity: 'doctors_without_borders',
        stripe_transaction_id: 'test_transaction_123'
      },
      goal_id: 'test-goal',
      monetary_amount: 25.00,
      charity_destination: 'doctors_without_borders',
      failure_type: 'checkpoint'
    }

    setPendingConsequence(testConsequence)
    setIsModalOpen(true)
  }

  return {
    pendingConsequence,
    isModalOpen,
    dismissConsequence,
    getConsequenceHistory,
    triggerTestConsequence
  }
}