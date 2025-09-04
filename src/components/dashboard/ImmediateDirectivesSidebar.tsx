import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import SubmissionModal from '../goals/SubmissionModal'

interface Checkpoint {
  id: string
  title: string
  deadline: string
  goal_title: string
  urgency: 'critical' | 'warning' | 'standard'
  status: string
  goal_id?: string
}

const ImmediateDirectivesSidebar: React.FC = () => {
  const { user } = useAuth()
  const [directives, setDirectives] = useState<Checkpoint[]>([])
  const [loading, setLoading] = useState(true)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [selectedGoalData, setSelectedGoalData] = useState<{goal: any, checkpoint?: any} | null>(null)

  const loadUpcomingDirectives = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Get checkpoints for next 7 days
      const now = new Date()
      const sevenDaysFromNow = new Date()
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
      
      console.log('🔍 [ImmediateDirectives] Loading directives for user:', user.id)
      console.log('🔍 [ImmediateDirectives] Date range:', now.toISOString(), 'to', sevenDaysFromNow.toISOString())

      // Load both checkpoints AND goal deadlines
      const [checkpointsResult, goalsResult] = await Promise.all([
        // Get checkpoints within 7 days
        supabase
          .from('checkpoints')
          .select(`
            id,
            title,
            deadline,
            status,
            goal_id,
            goals!inner(
              title,
              user_id
            )
          `)
          .eq('goals.user_id', user.id)
          .lte('deadline', sevenDaysFromNow.toISOString())
          .gte('deadline', now.toISOString()),

        // Get goal deadlines within 7 days
        supabase
          .from('goals')
          .select(`
            id,
            title,
            final_deadline,
            status,
            user_id
          `)
          .eq('user_id', user.id)
          .lte('final_deadline', sevenDaysFromNow.toISOString())
          .gte('final_deadline', now.toISOString())
      ])

      console.log('📊 [ImmediateDirectives] Checkpoints result:', checkpointsResult.data?.length || 0, 'items')
      console.log('📊 [ImmediateDirectives] Goals result:', goalsResult.data?.length || 0, 'items')
      
      if (checkpointsResult.error) {
        console.error('📋 [ImmediateDirectives] Checkpoints error:', checkpointsResult.error)
        console.error('📋 [ImmediateDirectives] Checkpoints error details:', {
          message: checkpointsResult.error.message,
          details: checkpointsResult.error.details,
          hint: checkpointsResult.error.hint,
          code: checkpointsResult.error.code
        })
      }
      
      if (goalsResult.error) {
        console.error('📋 [ImmediateDirectives] Goals error:', goalsResult.error)
        console.error('📋 [ImmediateDirectives] Goals error details:', {
          message: goalsResult.error.message,
          details: goalsResult.error.details,
          hint: goalsResult.error.hint,
          code: goalsResult.error.code
        })
      }
      
      // Log the raw data for debugging
      if (checkpointsResult.data) {
        console.log('📋 [ImmediateDirectives] Checkpoints raw data:', checkpointsResult.data)
      }
      if (goalsResult.data) {
        console.log('📋 [ImmediateDirectives] Goals raw data:', goalsResult.data)
      }

      const allDirectives: Checkpoint[] = []

      // Process checkpoints
      if (checkpointsResult.data) {
        checkpointsResult.data.forEach((checkpoint: any) => {
          const deadline = new Date(checkpoint.deadline)
          const hoursUntilDeadline = (deadline.getTime() - Date.now()) / (1000 * 60 * 60)
          
          let urgency: 'critical' | 'warning' | 'standard' = 'standard'
          if (hoursUntilDeadline <= 24) {
            urgency = 'critical'
          } else if (hoursUntilDeadline <= 72) {
            urgency = 'warning'
          }

          allDirectives.push({
            id: `checkpoint-${checkpoint.id}`,
            title: checkpoint.title,
            deadline: checkpoint.deadline,
            goal_title: Array.isArray(checkpoint.goals) ? checkpoint.goals[0]?.title : checkpoint.goals?.title,
            urgency,
            status: checkpoint.status,
            goal_id: checkpoint.goal_id
          })
        })
      }

      // Process goal deadlines
      if (goalsResult.data) {
        goalsResult.data.forEach((goal: any) => {
          const deadline = new Date(goal.final_deadline)
          const hoursUntilDeadline = (deadline.getTime() - Date.now()) / (1000 * 60 * 60)
          
          let urgency: 'critical' | 'warning' | 'standard' = 'standard'
          if (hoursUntilDeadline <= 24) {
            urgency = 'critical'
          } else if (hoursUntilDeadline <= 72) {
            urgency = 'warning'
          }

          allDirectives.push({
            id: `goal-${goal.id}`,
            title: `FINAL DIRECTIVE: ${goal.title}`,
            deadline: goal.final_deadline,
            goal_title: goal.title,
            urgency,
            status: goal.status
          })
        })
      }

      // Sort by deadline
      allDirectives.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      
      console.log('📋 [ImmediateDirectives] Final directives count:', allDirectives.length)
      setDirectives(allDirectives.slice(0, 10)) // Limit to 10 items

    } catch (error) {
      console.error('Error loading directives:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadUpcomingDirectives()
  }, [loadUpcomingDirectives])

  const getTimeRemaining = (deadline: string): string => {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const diffInHours = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours <= 0) return 'OVERDUE'
    if (diffInHours < 24) return `${diffInHours}H REMAINING`
    if (diffInHours < 48) return '1 DAY REMAINING'
    
    const days = Math.ceil(diffInHours / 24)
    return `${days} DAYS REMAINING`
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-[#DA291C] text-[#FFFFFF]'
      case 'warning': return 'bg-[#FF8C00] text-[#000000]'
      default: return 'bg-[#5A7761] text-[#FFFFFF]'
    }
  }

  const handleDirectiveClick = async (checkpoint: Checkpoint) => {
    try {
      // Load the full goal and checkpoint data for the submission modal
      if (checkpoint.id.startsWith('checkpoint-')) {
        const checkpointId = checkpoint.id.replace('checkpoint-', '')
        const [goalData, checkpointData] = await Promise.all([
          supabase.from('goals').select('*').eq('id', checkpoint.goal_id || '').single(),
          supabase.from('checkpoints').select('*').eq('id', checkpointId).single()
        ])
        
        if (goalData.data && checkpointData.data) {
          setSelectedGoalData({ goal: goalData.data, checkpoint: checkpointData.data })
          setShowSubmissionModal(true)
        }
      } else if (checkpoint.id.startsWith('goal-')) {
        const goalId = checkpoint.id.replace('goal-', '')
        const { data: goalData } = await supabase
          .from('goals')
          .select('*')
          .eq('id', goalId)
          .single()
        
        if (goalData) {
          setSelectedGoalData({ goal: goalData })
          setShowSubmissionModal(true)
        }
      }
    } catch (error) {
      console.error('Error loading goal data for submission:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[var(--color-container-light)] border border-[var(--color-border-primary)] h-16 animate-pulse p-3">
            <div className="bg-[var(--color-text-primary)] opacity-30 h-3 w-16 mb-2"></div>
            <div className="bg-[var(--color-text-primary)] opacity-30 h-2 w-full mb-1"></div>
            <div className="bg-[var(--color-text-primary)] opacity-30 h-4 w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (directives.length === 0) {
    return (
      <>
        {/* Soviet-style document icon */}
        <div className="mb-[var(--space-4)]">
          <svg className="w-12 h-12 mx-auto fill-[var(--color-text-primary)] opacity-30" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
        </div>
        <p className="text-[var(--font-size-base)] uppercase mb-[var(--space-2)] font-[var(--font-family-display)] tracking-wide font-bold">NO IMMEDIATE DIRECTIVES</p>
        <p className="text-[var(--font-size-sm)] font-[var(--font-family-body)] opacity-70">Request new mission from Command</p>
      </>
    )
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto w-full">
      {directives.map((directive) => (
        <div
          key={directive.id}
          onClick={() => handleDirectiveClick(directive)}
          className="bg-[var(--color-container-light)] border border-[var(--color-border-primary)] p-3 cursor-pointer transition-all duration-200 hover:bg-[var(--color-primary-crimson)] hover:text-[var(--color-background-beige)] group"
        >
          {/* Urgency Badge */}
          <div className={`inline-block px-2 py-1 text-xs font-[var(--font-family-display)] uppercase mb-2 border border-[var(--color-accent-black)] ${getUrgencyColor(directive.urgency)}`}>
            {directive.urgency === 'critical' ? 'CRITICAL' : directive.urgency === 'warning' ? 'WARNING' : 'ACTIVE'}
          </div>

          {/* Goal Title */}
          <div className="text-[var(--color-text-primary)] group-hover:text-[var(--color-background-beige)] font-[var(--font-family-body)] text-xs uppercase mb-1 truncate opacity-80">
            MISSION: {directive.goal_title}
          </div>

          {/* Checkpoint Title */}
          <div className="text-[var(--color-text-primary)] group-hover:text-[var(--color-background-beige)] font-[var(--font-family-display)] text-sm uppercase mb-2 leading-tight font-bold">
            {directive.title}
          </div>

          {/* Time Remaining */}
          <div className="text-[var(--color-primary-crimson)] group-hover:text-[var(--color-background-beige)] text-xs font-[var(--font-family-body)] font-bold">
            {getTimeRemaining(directive.deadline)}
          </div>

          {/* Deadline */}
          <div className="text-[var(--color-text-primary)] opacity-60 group-hover:text-[var(--color-background-beige)] group-hover:opacity-80 text-xs font-[var(--font-family-body)] mt-1">
            DUE: {new Date(directive.deadline).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }).toUpperCase()}
          </div>
        </div>
      ))}

      {/* Submission Modal */}
      {showSubmissionModal && selectedGoalData && (
        <SubmissionModal
          isOpen={showSubmissionModal}
          onClose={() => {
            setShowSubmissionModal(false)
            setSelectedGoalData(null)
          }}
          goal={selectedGoalData.goal}
          checkpoint={selectedGoalData.checkpoint}
          onSubmissionComplete={() => {
            setShowSubmissionModal(false)
            setSelectedGoalData(null)
            loadUpcomingDirectives() // Refresh data
          }}
        />
      )}
    </div>
  )
}

export default ImmediateDirectivesSidebar