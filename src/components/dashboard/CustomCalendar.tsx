import React, { useState, useEffect, useCallback } from 'react'
import moment from 'moment'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import BaseModal from '../modals/BaseModal'
import SubmissionModal from '../goals/SubmissionModal'
import { Button } from '../ui/button'

interface CalendarEvent {
  id: string
  type: 'goal' | 'checkpoint'
  status: 'pending' | 'completed' | 'failed' | 'overdue'
  goal_id?: string
  title: string
  date: Date
}

interface EventCardProps {
  event: CalendarEvent
  onClick: (event: CalendarEvent) => void
}

// Week view card component - larger with more details
const WeekEventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const getBgColor = () => {
    switch (event.status) {
      case 'completed': return '#5A7761'
      case 'failed':
      case 'overdue': return '#DA291C'
      case 'pending': return event.type === 'goal' ? '#DA291C' : '#000000'
      default: return '#000000'
    }
  }

  const formatTitle = (title: string) => {
    const prefix = title.startsWith('FINAL:') ? 'FINAL:' : 
                   title.startsWith('CHK:') ? 'CHK:' : ''
    const restOfTitle = prefix ? title.substring(prefix.length).trim() : title
    
    return { prefix, restOfTitle }
  }

  const { prefix, restOfTitle } = formatTitle(event.title)

  return (
    <div
      onClick={() => onClick(event)}
      className="w-full mb-2 p-3 cursor-pointer hover:opacity-80"
      style={{
        backgroundColor: getBgColor(),
        border: '1px solid #000000',
        borderRadius: '0px',
        color: '#F5EEDC',
        minHeight: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
      title={event.title}
    >
      <div className="flex-1">
        {prefix && (
          <div style={{
            fontFamily: 'Stalinist One, Arial Black, sans-serif',
            fontSize: '10px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '4px'
          }}>
            {prefix}
          </div>
        )}
        <div style={{
          fontFamily: 'Roboto Condensed, sans-serif',
          fontSize: '12px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          lineHeight: '1.3',
          wordWrap: 'break-word'
        }}>
          {restOfTitle.length > 50 ? `${restOfTitle.substring(0, 50)}...` : restOfTitle}
        </div>
      </div>
      
      {/* Due date at bottom */}
      <div style={{
        fontFamily: 'Roboto Condensed, sans-serif',
        fontSize: '10px',
        fontWeight: 'normal',
        opacity: 0.9,
        marginTop: '8px',
        borderTop: '1px solid rgba(245, 238, 220, 0.3)',
        paddingTop: '4px'
      }}>
        DUE: {moment(event.date).format('MMM DD')}
      </div>
    </div>
  )
}

// Month view card component - compact
const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const getBgColor = () => {
    switch (event.status) {
      case 'completed': return '#5A7761'
      case 'failed':
      case 'overdue': return '#DA291C'
      case 'pending': return event.type === 'goal' ? '#DA291C' : '#000000'
      default: return '#000000'
    }
  }

  const formatTitle = (title: string) => {
    // Extract prefix and rest of title
    const prefix = title.startsWith('FINAL:') ? 'FINAL:' : 
                   title.startsWith('CHK:') ? 'CHK:' : ''
    const restOfTitle = prefix ? title.substring(prefix.length).trim() : title
    
    return { prefix, restOfTitle }
  }

  const { prefix, restOfTitle } = formatTitle(event.title)

  return (
    <div
      onClick={() => onClick(event)}
      className="w-full mb-1 px-2 py-1 cursor-pointer hover:opacity-80"
      style={{
        backgroundColor: getBgColor(),
        border: '1px solid #000000',
        borderRadius: '0px',
        color: '#F5EEDC', // Beige text for better contrast
        minHeight: '16px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden' // Prevent horizontal scrollbars
      }}
      title={event.title}
    >
      <div className="w-full overflow-hidden">
        {prefix && (
          <span
            style={{
              fontFamily: 'Stalinist One, Arial Black, sans-serif',
              fontSize: '8px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            {prefix}
          </span>
        )}
        {prefix && <span> </span>}
        <span
          style={{
            fontFamily: 'Roboto Condensed, sans-serif',
            fontSize: '9px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {restOfTitle.length > 15 ? `${restOfTitle.substring(0, 15)}...` : restOfTitle}
        </span>
      </div>
    </div>
  )
}

const CustomCalendar: React.FC = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [selectedGoalData, setSelectedGoalData] = useState<{goal: any, checkpoint?: any} | null>(null)
  const [currentDate, setCurrentDate] = useState(moment())
  const [view, setView] = useState<'month' | 'week'>('month')

  const loadCalendarData = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)

      // Load Goals
      let goals: any[] = []
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)

      if (goalsError) {
        console.warn('📅 [CustomCalendar] Goals table not found, using empty array:', goalsError)
      } else {
        goals = goalsData || []
      }

      // Load Checkpoints
      let checkpoints: any[] = []
      const { data: checkpointsData, error: checkpointsError } = await supabase
        .from('checkpoints')
        .select(`
          *,
          goals!inner(
            id,
            title,
            user_id,
            priority
          )
        `)
        .eq('goals.user_id', user.id)

      if (checkpointsError) {
        console.warn('📅 [CustomCalendar] Checkpoints table not found, using empty array:', checkpointsError)
      } else {
        checkpoints = checkpointsData || []
      }

      // Process events
      const calendarEvents: CalendarEvent[] = []

      // Add goal deadlines
      goals.forEach((goal: { id: string; title: string; final_deadline?: string; status: string; priority?: string }) => {
        if (goal.final_deadline) {
          const deadline = new Date(goal.final_deadline)
          const now = new Date()
          let status: 'pending' | 'completed' | 'failed' | 'overdue' = 'pending'
          
          if (goal.status === 'completed') status = 'completed'
          else if (goal.status === 'failed') status = 'failed'
          else if (deadline < now) status = 'overdue'

          calendarEvents.push({
            id: `goal-${goal.id}`,
            title: `FINAL: ${goal.title.toUpperCase()}`,
            date: deadline,
            type: 'goal' as const,
            status,
            goal_id: goal.id
          })
        }
      })

      // Add checkpoint deadlines
      checkpoints.forEach((checkpoint: { id: string; title: string; deadline?: string; status: string; goal_id: string; goals: { title: string; priority?: string } }) => {
        if (checkpoint.deadline) {
          const deadline = new Date(checkpoint.deadline)
          const now = new Date()
          let status: 'pending' | 'completed' | 'failed' | 'overdue' = 'pending'
          
          if (checkpoint.status === 'completed') status = 'completed'
          else if (checkpoint.status === 'failed') status = 'failed'
          else if (deadline < now) status = 'overdue'

          calendarEvents.push({
            id: `checkpoint-${checkpoint.id}`,
            title: `CHK: ${checkpoint.title.toUpperCase()}`,
            date: deadline,
            type: 'checkpoint' as const,
            status,
            goal_id: checkpoint.goal_id
          })
        }
      })

      console.log('📅 [CustomCalendar] Loaded events:', calendarEvents.length)
      setEvents(calendarEvents)
    } catch (error) {
      console.error('Error loading calendar data:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadCalendarData()
  }, [loadCalendarData])

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
  }

  const handleSubmitProof = async (event: CalendarEvent) => {
    try {
      const { data: goalData } = await supabase
        .from('goals')
        .select('*')
        .eq('id', event.goal_id)
        .single()

      if (event.type === 'checkpoint') {
        const checkpointId = event.id.replace('checkpoint-', '')
        const { data: checkpointData } = await supabase
          .from('checkpoints')
          .select('*')
          .eq('id', checkpointId)
          .single()
        
        setSelectedGoalData({ goal: goalData, checkpoint: checkpointData })
      } else {
        const { data: finalCheckpoint } = await supabase
          .from('checkpoints')
          .select('*')
          .eq('goal_id', event.goal_id)
          .order('order_position', { ascending: false })
          .limit(1)
          .single()
          
        if (finalCheckpoint) {
          setSelectedGoalData({ goal: goalData, checkpoint: finalCheckpoint })
        } else {
          setSelectedGoalData({ goal: goalData })
        }
      }

      setSelectedEvent(null)
      setShowSubmissionModal(true)
    } catch (error) {
      console.error('Error loading goal data for submission:', error)
    }
  }

  const getEventsForDate = (date: moment.Moment): CalendarEvent[] => {
    return events.filter(event => 
      moment(event.date).isSame(date, 'day')
    )
  }

  const renderMonthView = () => {
    const startOfMonth = currentDate.clone().startOf('month')
    const endOfMonth = currentDate.clone().endOf('month')
    const startOfWeek = startOfMonth.clone().startOf('week')
    const endOfWeek = endOfMonth.clone().endOf('week')

    const days = []
    let current = startOfWeek.clone()

    while (current.isSameOrBefore(endOfWeek)) {
      days.push(current.clone())
      current.add(1, 'day')
    }

    const weeks = []
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7))
    }

    return (
      <div className="grid grid-rows-6 gap-0 border-2 border-black bg-white" style={{ height: '550px' }}>
        {/* Header Row */}
        <div className="grid grid-cols-7 gap-0">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
            <div key={day} className="bg-black text-beige p-2 text-center text-xs font-bold border border-red-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Rows */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-0 flex-1">
            {week.map(day => {
              const dayEvents = getEventsForDate(day)
              const isToday = day.isSame(moment(), 'day')
              const isCurrentMonth = day.isSame(currentDate, 'month')

              return (
                <div 
                  key={day.format('YYYY-MM-DD')} 
                  className={`border border-black p-1 overflow-y-auto ${
                    isToday ? 'bg-red-600 text-white' : 
                    isCurrentMonth ? 'bg-white' : 'bg-gray-100'
                  }`}
                >
                  <div className={`text-sm font-bold mb-1 ${isToday ? 'text-white' : 'text-black'}`}>
                    {day.format('D')}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map(event => (
                      <EventCard key={event.id} event={event} onClick={handleEventClick} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  const renderWeekView = () => {
    const startOfWeek = currentDate.clone().startOf('week')
    const days = []
    
    for (let i = 0; i < 7; i++) {
      days.push(startOfWeek.clone().add(i, 'days'))
    }

    return (
      <div className="border-2 border-black bg-white" style={{ height: '500px' }}>
        {/* Header */}
        <div className="grid grid-cols-7 gap-0 border-b-2 border-black">
          {days.map(day => (
            <div key={day.format('YYYY-MM-DD')} className="bg-black text-beige p-3 text-center text-sm font-bold border border-red-600">
              <div>{day.format('dddd')}</div>
              <div>{day.format('MMM DD')}</div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-7 gap-0" style={{ height: '450px' }}>
          {days.map(day => {
            const dayEvents = getEventsForDate(day)
            const isToday = day.isSame(moment(), 'day')

            return (
              <div 
                key={day.format('YYYY-MM-DD')} 
                className={`border-r border-black p-2 overflow-y-auto ${
                  isToday ? 'bg-red-50' : 'bg-white'
                }`}
              >
                <div className="space-y-2">
                  {dayEvents.map(event => (
                    <WeekEventCard key={event.id} event={event} onClick={handleEventClick} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F5EEDC]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-[#DA291C] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#000000] font-['Roboto_Condensed'] text-sm mt-2 uppercase">
            Loading Operational Data...
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Toolbar */}
      <div className="mb-4 p-2 bg-[#F5EEDC] border-b-2 border-black flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate(currentDate.clone().subtract(view === 'month' ? 1 : 1, view))}
            className="bg-black text-beige px-3 py-1 border border-red-600 text-xs font-bold uppercase hover:bg-red-600"
          >
            PREV
          </button>
          <button
            onClick={() => setCurrentDate(moment())}
            className="bg-black text-beige px-3 py-1 border border-red-600 text-xs font-bold uppercase hover:bg-red-600"
          >
            TODAY
          </button>
          <button
            onClick={() => setCurrentDate(currentDate.clone().add(view === 'month' ? 1 : 1, view))}
            className="bg-black text-beige px-3 py-1 border border-red-600 text-xs font-bold uppercase hover:bg-red-600"
          >
            NEXT
          </button>
        </div>

        <div className="font-bold text-black text-lg uppercase">
          {view === 'month' 
            ? currentDate.format('MMMM YYYY')
            : `${currentDate.clone().startOf('week').format('MMM DD')} - ${currentDate.clone().endOf('week').format('MMM DD YYYY')}`
          }
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setView('month')}
            className={`px-3 py-1 border border-red-600 text-xs font-bold uppercase ${
              view === 'month' ? 'bg-red-600 text-white' : 'bg-black text-beige hover:bg-red-600'
            }`}
          >
            MONTH
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-3 py-1 border border-red-600 text-xs font-bold uppercase ${
              view === 'week' ? 'bg-red-600 text-white' : 'bg-black text-beige hover:bg-red-600'
            }`}
          >
            WEEK
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      {view === 'month' ? renderMonthView() : renderWeekView()}

      {/* Event Detail Modal */}
      <BaseModal 
        isOpen={!!selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
        title="🎯 MISSION DETAILS"
        size="default"
      >
        {selectedEvent && (
          <div className="space-y-4 font-['Roboto_Condensed']">
            <div>
              <span className="text-[var(--color-text-primary)] text-sm uppercase font-bold">TYPE:</span>
              <span className="text-[var(--color-primary-crimson)] ml-2 uppercase font-bold">{selectedEvent.type}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-primary)] text-sm uppercase font-bold">MISSION:</span>
              <div className="text-[var(--color-text-primary)] mt-2 text-base">{selectedEvent.title}</div>
            </div>
            <div>
              <span className="text-[var(--color-text-primary)] text-sm uppercase font-bold">STATUS:</span>
              <span className={`ml-2 uppercase font-bold ${
                selectedEvent.status === 'completed' ? 'text-[#5A7761]' :
                selectedEvent.status === 'failed' || selectedEvent.status === 'overdue' ? 'text-[var(--color-primary-crimson)]' :
                'text-[var(--color-primary-crimson)]'
              }`}>{selectedEvent.status}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-primary)] text-sm uppercase font-bold">DEADLINE:</span>
              <div className="text-[var(--color-text-primary)] mt-2 text-base">
                {moment(selectedEvent.date).format('dddd, MMMM DD, YYYY')}
              </div>
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button
                variant="ghost"
                onClick={() => setSelectedEvent(null)}
                className="flex-1"
              >
                CLOSE
              </Button>
              {selectedEvent.status === 'pending' && (
                <Button
                  variant="command"
                  onClick={() => handleSubmitProof(selectedEvent)}
                  className="flex-1"
                >
                  SUBMIT PROOF
                </Button>
              )}
            </div>
          </div>
        )}
      </BaseModal>

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
            loadCalendarData() // Refresh data
          }}
        />
      )}
    </>
  )
}

export default CustomCalendar