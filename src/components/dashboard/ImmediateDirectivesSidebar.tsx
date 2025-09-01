import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface Checkpoint {
  id: string
  title: string
  deadline: string
  goal_title: string
  urgency: 'critical' | 'warning' | 'standard'
  status: string
}

const ImmediateDirectivesSidebar: React.FC = () => {
  const { user } = useAuth()
  const [directives, setDirectives] = useState<Checkpoint[]>([])
  const [loading, setLoading] = useState(true)

  const loadUpcomingDirectives = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Get checkpoints for next 7 days
      const sevenDaysFromNow = new Date()
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
      
      const { data, error } = await supabase
        .from('checkpoints')
        .select(`
          id,
          title,
          deadline,
          status,
          goals!inner(
            title,
            user_id
          )
        `)
        .eq('goals.user_id', user.id)
        .neq('status', 'completed')
        .lte('deadline', sevenDaysFromNow.toISOString())
        .gte('deadline', new Date().toISOString())
        .order('deadline', { ascending: true })
        .limit(10)

      if (error) {
        console.warn('📋 [ImmediateDirectives] Checkpoints table not found, using empty array:', error)
        setDirectives([])
        return
      }

      // Calculate urgency based on time remaining
      const processedDirectives: Checkpoint[] = data.map((checkpoint: { id: string; title: string; deadline: string; status: string; goals: { title: string; user_id: string } }) => {
        const deadline = new Date(checkpoint.deadline)
        const hoursUntilDeadline = (deadline.getTime() - Date.now()) / (1000 * 60 * 60)
        
        let urgency: 'critical' | 'warning' | 'standard' = 'standard'
        if (hoursUntilDeadline <= 24) {
          urgency = 'critical'
        } else if (hoursUntilDeadline <= 72) {
          urgency = 'warning'
        }

        return {
          id: checkpoint.id,
          title: checkpoint.title,
          deadline: checkpoint.deadline,
          goal_title: checkpoint.goals.title,
          urgency,
          status: checkpoint.status
        }
      })

      setDirectives(processedDirectives)
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

  const handleDirectiveClick = (checkpoint: Checkpoint) => {
    // TODO: Open submission modal
    console.log('Opening submission for checkpoint:', checkpoint.id)
  }

  if (loading) {
    return (
      <div className="bg-[#000000] border-2 border-[#DA291C] h-full">
        <div className="bg-[#DA291C] p-4 border-b-2 border-[#000000]">
          <h2 className="text-[#FFFFFF] font-['Stalinist_One'] text-lg uppercase tracking-wider">
            IMMEDIATE DIRECTIVES
          </h2>
        </div>
        <div className="p-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#333333] h-16 animate-pulse border border-[#DA291C]"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#000000] border-2 border-[#DA291C] h-full">
      {/* Header */}
      <div className="bg-[#DA291C] p-4 border-b-2 border-[#000000]">
        <h2 className="text-[#FFFFFF] font-['Stalinist_One'] text-lg uppercase tracking-wider">
          IMMEDIATE DIRECTIVES
        </h2>
        <p className="text-[#F5EEDC] text-xs mt-1 font-['Roboto_Condensed']">
          NEXT 7 DAYS - COMPLIANCE REQUIRED
        </p>
      </div>

      {/* Directives List */}
      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {directives.length === 0 ? (
          <div className="text-center p-8">
            <div className="text-[#5A7761] text-lg mb-2">★</div>
            <p className="text-[#F5EEDC] text-sm font-['Roboto_Condensed']">
              NO IMMEDIATE DIRECTIVES
            </p>
            <p className="text-[#888888] text-xs mt-1">
              Request new mission from Command
            </p>
          </div>
        ) : (
          directives.map((directive) => (
            <div
              key={directive.id}
              onClick={() => handleDirectiveClick(directive)}
              className="bg-[#1a1a1a] border border-[#DA291C] p-3 cursor-pointer transition-all duration-200 hover:bg-[#DA291C] hover:text-[#000000] group"
            >
              {/* Urgency Badge */}
              <div className={`inline-block px-2 py-1 text-xs font-['Stalinist_One'] uppercase mb-2 ${getUrgencyColor(directive.urgency)}`}>
                {directive.urgency === 'critical' ? 'CRITICAL' : directive.urgency === 'warning' ? 'WARNING' : 'ACTIVE'}
              </div>

              {/* Goal Title */}
              <div className="text-[#F5EEDC] group-hover:text-[#000000] font-['Roboto_Condensed'] text-xs uppercase mb-1 truncate">
                MISSION: {directive.goal_title}
              </div>

              {/* Checkpoint Title */}
              <div className="text-[#FFFFFF] group-hover:text-[#000000] font-['Stalinist_One'] text-sm uppercase mb-2 leading-tight">
                {directive.title}
              </div>

              {/* Time Remaining */}
              <div className="text-[#DA291C] group-hover:text-[#000000] text-xs font-['Roboto_Condensed'] font-bold">
                {getTimeRemaining(directive.deadline)}
              </div>

              {/* Deadline */}
              <div className="text-[#888888] group-hover:text-[#333333] text-xs font-['Roboto_Condensed'] mt-1">
                DUE: {new Date(directive.deadline).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }).toUpperCase()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#DA291C] p-3 bg-[#1a1a1a]">
        <p className="text-[#DA291C] text-xs font-['Roboto_Condensed'] text-center">
          ★ CLICK DIRECTIVE TO SUBMIT PROOF ★
        </p>
      </div>
    </div>
  )
}

export default ImmediateDirectivesSidebar