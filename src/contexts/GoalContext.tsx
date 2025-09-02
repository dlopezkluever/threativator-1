import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'
import { Tables } from '../lib/supabase'

export type Goal = Tables<'goals'> & {
  checkpoints?: Checkpoint[]
}

export type Checkpoint = {
  id: string
  goal_id: string
  title: string
  description: string | null
  deadline: string
  order_position: number
  requirements: string | null
  status: 'pending' | 'submitted' | 'passed' | 'failed' | 'overdue'
  created_at: string
  completed_at: string | null
}

interface GoalContextType {
  goals: Goal[]
  loading: boolean
  error: string | null
  refreshGoals: () => Promise<void>
  getGoalsWithUpcomingDeadlines: (days?: number) => Goal[]
  getGoalById: (id: string) => Goal | undefined
}

const GoalContext = createContext<GoalContextType | undefined>(undefined)

export const useGoals = () => {
  const context = useContext(GoalContext)
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalProvider')
  }
  return context
}

interface GoalProviderProps {
  children: ReactNode
}

export const GoalProvider: React.FC<GoalProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      refreshGoals()
      setupRealtimeSubscription()
    } else {
      setGoals([])
      setLoading(false)
    }
  }, [user])

  const refreshGoals = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Fetch goals with checkpoints
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select(`
          *,
          checkpoints (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (goalsError) throw goalsError

      setGoals(goalsData || [])
    } catch (err) {
      console.error('Error fetching goals:', err)
      setError(err instanceof Error ? err.message : 'Failed to load goals')
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    if (!user) return

    const channel = supabase
      .channel('goals-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'goals',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('Goal changed:', payload)
          refreshGoals()
        }
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'checkpoints'
        }, 
        (payload) => {
          console.log('Checkpoint changed:', payload)
          refreshGoals()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const getGoalsWithUpcomingDeadlines = (days: number = 7): Goal[] => {
    const now = new Date()
    const targetDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000))

    return goals.filter(goal => {
      // Check final deadline
      const finalDeadline = new Date(goal.final_deadline)
      if (finalDeadline >= now && finalDeadline <= targetDate) {
        return true
      }

      // Check checkpoint deadlines
      if (goal.checkpoints) {
        return goal.checkpoints.some(checkpoint => {
          const checkpointDeadline = new Date(checkpoint.deadline)
          return checkpointDeadline >= now && 
                 checkpointDeadline <= targetDate && 
                 checkpoint.status === 'pending'
        })
      }

      return false
    })
  }

  const getGoalById = (id: string): Goal | undefined => {
    return goals.find(goal => goal.id === id)
  }

  const value: GoalContextType = {
    goals,
    loading,
    error,
    refreshGoals,
    getGoalsWithUpcomingDeadlines,
    getGoalById
  }

  return (
    <GoalContext.Provider value={value}>
      {children}
    </GoalContext.Provider>
  )
}

export default GoalProvider