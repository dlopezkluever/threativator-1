import React, { useState, useEffect, useCallback } from 'react'
import { Calendar, momentLocalizer, Event } from 'react-big-calendar'
import moment from 'moment'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import BaseModal from '../modals/BaseModal'
import SubmissionModal from '../goals/SubmissionModal'
import { Button } from '../ui/button'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

interface CalendarEvent extends Event {
  id: string
  type: 'goal' | 'checkpoint'
  status: 'pending' | 'completed' | 'failed' | 'overdue'
  goal_id?: string
  mission_priority?: string
  title: string
}

const OperationalCalendar: React.FC = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [selectedGoalData, setSelectedGoalData] = useState<{goal: any, checkpoint?: any} | null>(null)

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
        console.warn('📅 [OperationalCalendar] Goals table not found, using empty array:', goalsError)
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
        console.warn('📅 [OperationalCalendar] Checkpoints table not found, using empty array:', checkpointsError)
      } else {
        checkpoints = checkpointsData || []
      }

      // Process events
      const calendarEvents: CalendarEvent[] = []

      // Add goal deadlines
      goals.forEach((goal: { id: string; title: string; final_deadline?: string; status: string; priority?: string }) => {
        if (goal.final_deadline) {
          const deadline = new Date(goal.final_deadline)
          console.log('📅 [OperationalCalendar] Processing goal:', goal.title, 'deadline:', deadline)
          const now = new Date()
          let status: 'pending' | 'completed' | 'failed' | 'overdue' = 'pending'
          
          if (goal.status === 'completed') status = 'completed'
          else if (goal.status === 'failed') status = 'failed'
          else if (deadline < now) status = 'overdue'

          const eventData: CalendarEvent = {
            id: `goal-${goal.id}`,
            title: `FINAL DIRECTIVE: ${goal.title.toUpperCase()}`,
            start: deadline,
            end: deadline,
            allDay: true,
            type: 'goal' as const,
            status,
            goal_id: goal.id,
            mission_priority: goal.priority || 'standard'
          }
          
          console.log('📅 [OperationalCalendar] Adding goal event:', eventData)
          calendarEvents.push(eventData)
        }
      })

      // Add checkpoint deadlines
      checkpoints.forEach((checkpoint: { id: string; title: string; deadline?: string; status: string; goal_id: string; goals: { title: string; priority?: string } }) => {
        if (checkpoint.deadline) {
          const deadline = new Date(checkpoint.deadline)
          console.log('📅 [OperationalCalendar] Processing checkpoint:', checkpoint.title, 'deadline:', deadline)
          const now = new Date()
          let status: 'pending' | 'completed' | 'failed' | 'overdue' = 'pending'
          
          if (checkpoint.status === 'completed') status = 'completed'
          else if (checkpoint.status === 'failed') status = 'failed'
          else if (deadline < now) status = 'overdue'

          const eventData: CalendarEvent = {
            id: `checkpoint-${checkpoint.id}`,
            title: `CHECKPOINT: ${checkpoint.title.toUpperCase()}`,
            start: deadline,
            end: deadline,
            allDay: true,
            type: 'checkpoint' as const,
            status,
            goal_id: checkpoint.goal_id,
            mission_priority: checkpoint.goals.priority || 'standard'
          }
          
          console.log('📅 [OperationalCalendar] Adding checkpoint event:', eventData)
          calendarEvents.push(eventData)
        }
      })

      console.log('📅 [OperationalCalendar] Final calendar events:', calendarEvents.length, 'events')
      console.log('📅 [OperationalCalendar] Events data:', calendarEvents)
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

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#5A7761' // default success-muted
    let color = '#FFFFFF'
    const border = '1px solid #000000'

    switch (event.status) {
      case 'completed':
        backgroundColor = '#5A7761'
        color = '#FFFFFF'
        break
      case 'failed':
      case 'overdue':
        backgroundColor = '#DA291C'
        color = '#FFFFFF'
        break
      case 'pending':
        backgroundColor = event.type === 'goal' ? '#DA291C' : '#000000'
        color = '#FFFFFF'
        break
    }

    return {
      style: {
        backgroundColor,
        color,
        border,
        borderRadius: '0px', // Soviet style - no rounded corners
        fontSize: '10px',
        fontFamily: 'Roboto Condensed, sans-serif',
        fontWeight: 'bold',
        textTransform: 'uppercase' as const,
        padding: '2px 4px'
      }
    }
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    console.log('Event clicked:', event)
  }

  const handleSubmitProof = async (event: CalendarEvent) => {
    try {
      // Load the full goal and checkpoint data for the submission modal
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
        // For goal clicks, find the final checkpoint (highest order_position)
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
          // Fallback: if somehow no checkpoints exist, show error
          console.error('No checkpoints found for goal - this should not happen with auto-created final checkpoints')
          setSelectedGoalData({ goal: goalData })
        }
      }

      setSelectedEvent(null)
      setShowSubmissionModal(true)
    } catch (error) {
      console.error('Error loading goal data for submission:', error)
    }
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
      <style>
        {`
          .rbc-calendar {
            font-family: 'Roboto Condensed', sans-serif;
            background: white;
            border: 2px solid #000000;
            height: 500px;
          }

          .rbc-header {
            background-color: #000000;
            color: #F5EEDC;
            font-family: 'Stalinist One', sans-serif;
            text-transform: uppercase;
            font-size: 12px;
            padding: 8px;
            border: 1px solid #C11B17;
          }
          
          .rbc-toolbar {
            margin-bottom: 16px;
            padding: 8px 0;
            background: #F5EEDC;
            border-bottom: 2px solid #000000;
          }
          
          .rbc-btn-group button {
            background-color: #000000;
            color: #F5EEDC;
            border: 1px solid #C11B17;
            font-family: 'Stalinist One', sans-serif;
            text-transform: uppercase;
            font-size: 10px;
            padding: 8px 12px;
          }
          
          .rbc-btn-group button:hover,
          .rbc-btn-group button.rbc-active {
            background-color: #C11B17;
            color: #F5EEDC;
          }

          .rbc-toolbar-label {
            font-family: 'Stalinist One', sans-serif;
            text-transform: uppercase;
            color: #000000;
            font-size: 16px;
          }

          .rbc-today {
            background-color: #C11B17;
          }

          .rbc-event {
            border-radius: 0px;
            border: 1px solid #000000;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            font-family: 'Roboto Condensed', sans-serif;
            cursor: pointer;
            padding: 2px 4px;
          }
        `}
      </style>
      
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '500px', fontFamily: 'Roboto Condensed, sans-serif' }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleEventClick}
        views={['month', 'week']}
        defaultView="month"
        showMultiDayTimes={false}
        step={60}
        timeslots={1}
        popup={true}
        drilldownView={null}
        messages={{
          today: 'TODAY',
          previous: 'PREV',
          next: 'NEXT',
          month: 'MONTH',
          week: 'WEEK',
          day: 'DAY',
          agenda: 'AGENDA'
        }}
        formats={{
          monthHeaderFormat: (date: Date) => moment(date).format('MMMM YYYY').toUpperCase(),
          dayHeaderFormat: (date: Date) => moment(date).format('dddd MMM DD').toUpperCase(),
          dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) => 
            `${moment(start).format('MMM DD')} - ${moment(end).format('MMM DD YYYY')}`.toUpperCase(),
          dayFormat: (date: Date) => moment(date).format('DD')
        }}
      />
      
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
                {moment(selectedEvent.start).format('dddd, MMMM DD, YYYY [at] h:mm A')}
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

export default OperationalCalendar