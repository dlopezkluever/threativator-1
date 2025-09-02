import React, { useState, useEffect, useCallback } from 'react'
import { Calendar, momentLocalizer, Event } from 'react-big-calendar'
import moment from 'moment'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
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
          const now = new Date()
          let status: 'pending' | 'completed' | 'failed' | 'overdue' = 'pending'
          
          if (goal.status === 'completed') status = 'completed'
          else if (goal.status === 'failed') status = 'failed'
          else if (deadline < now) status = 'overdue'

          calendarEvents.push({
            id: `goal-${goal.id}`,
            title: `FINAL DIRECTIVE: ${goal.title.toUpperCase()}`,
            start: deadline,
            end: deadline,
            allDay: false,
            type: 'goal',
            status,
            goal_id: goal.id,
            mission_priority: goal.priority || 'standard'
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
            title: `CHECKPOINT: ${checkpoint.title.toUpperCase()}`,
            start: deadline,
            end: deadline,
            allDay: false,
            type: 'checkpoint',
            status,
            goal_id: checkpoint.goal_id,
            mission_priority: checkpoint.goals.priority || 'standard'
          })
        }
      })

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
        textTransform: 'uppercase',
        padding: '2px 4px'
      }
    }
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    // TODO: Open appropriate modal (submission or details)
    console.log('Event clicked:', event)
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
            font-family: 'Roboto Condensed', sans-serif !important;
            background: white !important;
            border: none !important;
            height: 100% !important;
          }

          .rbc-month-view {
            border: 2px solid #000000 !important;
            background: white !important;
            height: 400px !important;
          }
          
          .rbc-header {
            background-color: #000000 !important;
            color: #F5EEDC !important;
            font-family: 'Stalinist One', sans-serif !important;
            text-transform: uppercase !important;
            font-weight: normal !important;
            padding: 8px !important;
            border: 1px solid #C11B17 !important;
            border-radius: 0px !important;
            font-size: 12px !important;
          }
          
          .rbc-date-cell {
            border-right: 1px solid #000000 !important;
            border-bottom: 1px solid #000000 !important;
            min-height: 60px !important;
            padding: 4px !important;
            background: white !important;
          }

          .rbc-date-cell a {
            color: #000000 !important;
            font-family: 'Stalinist One', sans-serif !important;
            font-size: 12px !important;
            text-decoration: none !important;
            font-weight: normal !important;
          }
          
          .rbc-today {
            background-color: #C11B17 !important;
          }

          .rbc-today a {
            color: #F5EEDC !important;
          }
          
          .rbc-off-range {
            background-color: #f8f8f8 !important;
            color: #999999 !important;
          }

          .rbc-off-range a {
            color: #999999 !important;
          }
          
          .rbc-toolbar {
            margin-bottom: 16px !important;
            padding: 8px 0 !important;
            background: #F5EEDC !important;
            border-bottom: 2px solid #000000 !important;
          }
          
          .rbc-btn-group {
            display: inline-flex !important;
          }

          .rbc-btn-group button {
            background-color: #000000 !important;
            color: #F5EEDC !important;
            border: 1px solid #C11B17 !important;
            font-family: 'Stalinist One', sans-serif !important;
            text-transform: uppercase !important;
            font-size: 10px !important;
            padding: 8px 12px !important;
            border-radius: 0px !important;
            margin: 0 !important;
          }
          
          .rbc-btn-group button:hover {
            background-color: #C11B17 !important;
            color: #F5EEDC !important;
          }
          
          .rbc-btn-group button.rbc-active {
            background-color: #C11B17 !important;
            color: #F5EEDC !important;
          }

          .rbc-toolbar-label {
            font-family: 'Stalinist One', sans-serif !important;
            text-transform: uppercase !important;
            color: #000000 !important;
            font-size: 16px !important;
            font-weight: normal !important;
          }

          .rbc-event {
            border-radius: 0px !important;
            border: 1px solid #000000 !important;
            font-size: 10px !important;
            font-weight: bold !important;
            text-transform: uppercase !important;
          }

          .rbc-month-row + .rbc-month-row {
            border-top: 1px solid #000000 !important;
          }
        `}
      </style>
      
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '400px', fontFamily: 'Roboto Condensed, sans-serif' }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleEventClick}
        views={['month']}
        defaultView="month"
        showMultiDayTimes={false}
        step={60}
        timeslots={1}
        popup={false}
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
            `${moment(start).format('MMM DD')} - ${moment(end).format('MMM DD YYYY')}`.toUpperCase()
        }}
      />
      
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#F5EEDC] border-2 border-[#000000] max-w-md w-full mx-4 p-6">
            <div className="bg-[#DA291C] -m-6 mb-4 p-4 border-b-2 border-[#000000]">
              <h3 className="text-[#FFFFFF] font-['Stalinist_One'] text-lg uppercase">
                MISSION DETAILS
              </h3>
            </div>
            
            <div className="space-y-3 font-['Roboto_Condensed']">
              <div>
                <span className="text-[#000000] text-xs uppercase font-bold">TYPE:</span>
                <span className="text-[#DA291C] ml-2 uppercase">{selectedEvent.type}</span>
              </div>
              <div>
                <span className="text-[#000000] text-xs uppercase font-bold">MISSION:</span>
                <div className="text-[#000000] mt-1">{selectedEvent.title}</div>
              </div>
              <div>
                <span className="text-[#000000] text-xs uppercase font-bold">STATUS:</span>
                <span className="text-[#DA291C] ml-2 uppercase">{selectedEvent.status}</span>
              </div>
              <div>
                <span className="text-[#000000] text-xs uppercase font-bold">DEADLINE:</span>
                <div className="text-[#000000] mt-1">
                  {moment(selectedEvent.start).format('dddd, MMMM DD, YYYY [at] h:mm A')}
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 bg-[#000000] text-[#F5EEDC] border border-[#DA291C] py-2 px-4 font-['Stalinist_One'] text-xs uppercase hover:bg-[#DA291C] hover:text-[#000000] transition-colors"
              >
                CLOSE
              </button>
              {selectedEvent.status === 'pending' && (
                <button
                  onClick={() => {
                    // TODO: Open submission modal
                    setSelectedEvent(null)
                  }}
                  className="flex-1 bg-[#DA291C] text-[#FFFFFF] border border-[#000000] py-2 px-4 font-['Stalinist_One'] text-xs uppercase hover:bg-[#5A7761] transition-colors"
                >
                  SUBMIT PROOF
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default OperationalCalendar