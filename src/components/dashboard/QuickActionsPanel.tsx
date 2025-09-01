import React, { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

interface CheckpointData {
  id: string
  title: string
  deadline: string
  status: string
  goals: {
    id: string
    title: string
    user_id: string
  }
}

const QuickActionsPanel: React.FC = () => {
  const { user, signOut } = useAuth()
  const [showSubmissionSelector, setShowSubmissionSelector] = useState(false)
  const [availableCheckpoints, setAvailableCheckpoints] = useState<CheckpointData[]>([])
  const [loadingCheckpoints, setLoadingCheckpoints] = useState(false)

  const handleRequestNewMission = () => {
    // TODO: Navigate to goal creation flow
    console.log('Opening goal creation flow...')
    // navigate('/goals/create')
  }

  const handleSubmitProof = async () => {
    setLoadingCheckpoints(true)
    try {
      // Load pending checkpoints for dropdown
      const { data, error } = await supabase
        .from('checkpoints')
        .select(`
          id,
          title,
          deadline,
          status,
          goals!inner(
            id,
            title,
            user_id
          )
        `)
        .eq('goals.user_id', user?.id)
        .eq('status', 'pending')
        .gte('deadline', new Date().toISOString())
        .order('deadline', { ascending: true })
        .limit(10)

      if (error) throw error
      setAvailableCheckpoints(data || [])
      setShowSubmissionSelector(true)
    } catch (error) {
      console.error('Error loading checkpoints:', error)
    } finally {
      setLoadingCheckpoints(false)
    }
  }

  const handleCheckpointSelect = (checkpoint: CheckpointData) => {
    // TODO: Open submission modal for specific checkpoint
    console.log('Opening submission modal for checkpoint:', checkpoint.id)
    setShowSubmissionSelector(false)
  }

  const handleViewAnalytics = () => {
    // TODO: Navigate to analytics page
    console.log('Opening analytics...')
    // navigate('/analytics')
  }

  const handleEmergencyExit = async () => {
    const confirmed = window.confirm(
      'WARNING: UNAUTHORIZED DEPARTURE FROM STATE NETWORK?\n\n' +
      'This action will terminate your session and return you to civilian status. ' +
      'All active surveillance will continue. Are you certain, Comrade?'
    )
    
    if (confirmed) {
      await signOut()
    }
  }

  return (
    <>
      <div className="bg-[#DA291C] border-2 border-[#000000]">
        {/* Header */}
        <div className="bg-[#000000] p-3 border-b-2 border-[#DA291C]">
          <h3 className="text-[#DA291C] font-['Stalinist_One'] text-sm uppercase tracking-wider">
            COMMAND ACTIONS
          </h3>
          <p className="text-[#F5EEDC] text-xs font-['Roboto_Condensed'] mt-1">
            AUTHORIZED OPERATIONS
          </p>
        </div>

        <div className="p-4 space-y-3">
          {/* Primary Actions */}
          <button
            onClick={handleRequestNewMission}
            className="w-full bg-[#000000] text-[#F5EEDC] border-2 border-[#FFFFFF] py-3 px-4 font-['Stalinist_One'] text-sm uppercase tracking-wide hover:bg-[#FFFFFF] hover:text-[#000000] transition-all duration-200 group"
          >
            <div className="flex items-center justify-center space-x-2">
              <span>REQUEST NEW MISSION</span>
              <span className="group-hover:text-[#DA291C]">⚡</span>
            </div>
          </button>

          <button
            onClick={handleSubmitProof}
            disabled={loadingCheckpoints}
            className="w-full bg-[#FFFFFF] text-[#000000] border-2 border-[#000000] py-3 px-4 font-['Stalinist_One'] text-sm uppercase tracking-wide hover:bg-[#5A7761] hover:text-[#FFFFFF] hover:border-[#5A7761] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-center justify-center space-x-2">
              <span>
                {loadingCheckpoints ? 'SCANNING...' : 'SUBMIT PROOF'}
              </span>
              <span className="group-hover:text-[#F5EEDC]">📋</span>
            </div>
          </button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={handleViewAnalytics}
              className="bg-[#333333] text-[#F5EEDC] border border-[#DA291C] py-2 px-3 font-['Roboto_Condensed'] text-xs uppercase hover:bg-[#DA291C] hover:text-[#000000] transition-colors"
            >
              INTEL REPORTS
            </button>
            
            <button
              onClick={() => console.log('Settings...')}
              className="bg-[#333333] text-[#F5EEDC] border border-[#DA291C] py-2 px-3 font-['Roboto_Condensed'] text-xs uppercase hover:bg-[#DA291C] hover:text-[#000000] transition-colors"
            >
              SETTINGS
            </button>
          </div>

          {/* Emergency Exit */}
          <div className="mt-4 pt-3 border-t border-[#000000]">
            <button
              onClick={handleEmergencyExit}
              className="w-full bg-transparent text-[#000000] border border-[#000000] py-2 px-3 font-['Roboto_Condensed'] text-xs uppercase hover:bg-[#000000] hover:text-[#DA291C] transition-colors"
            >
              ⚠️ EMERGENCY EXIT
            </button>
          </div>
        </div>

        {/* Warning Footer */}
        <div className="bg-[#000000] border-t-2 border-[#DA291C] p-2 text-center">
          <p className="text-[#DA291C] font-['Roboto_Condensed'] text-xs uppercase">
            ★ ALL ACTIONS MONITORED BY STATE ★
          </p>
        </div>
      </div>

      {/* Submission Selector Modal */}
      {showSubmissionSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#F5EEDC] border-2 border-[#000000] max-w-lg w-full mx-4 max-h-96">
            <div className="bg-[#DA291C] p-4 border-b-2 border-[#000000]">
              <h3 className="text-[#FFFFFF] font-['Stalinist_One'] text-lg uppercase">
                SELECT DIRECTIVE FOR SUBMISSION
              </h3>
              <p className="text-[#F5EEDC] text-xs font-['Roboto_Condensed'] mt-1">
                CHOOSE MISSION TO SUBMIT PROOF OF COMPLIANCE
              </p>
            </div>

            <div className="p-4 max-h-64 overflow-y-auto">
              {availableCheckpoints.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-[#888888] text-2xl mb-2">📋</div>
                  <p className="text-[#000000] font-['Roboto_Condensed'] text-sm uppercase mb-1">
                    NO PENDING DIRECTIVES
                  </p>
                  <p className="text-[#666666] font-['Roboto_Condensed'] text-xs">
                    Request new mission from Command Center
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableCheckpoints.map((checkpoint) => (
                    <button
                      key={checkpoint.id}
                      onClick={() => handleCheckpointSelect(checkpoint)}
                      className="w-full text-left bg-[#FFFFFF] border border-[#000000] p-3 hover:bg-[#DA291C] hover:text-[#FFFFFF] transition-colors group"
                    >
                      <div className="font-['Roboto_Condensed'] text-xs uppercase text-[#666666] group-hover:text-[#F5EEDC] mb-1">
                        MISSION: {checkpoint.goals.title}
                      </div>
                      <div className="font-['Stalinist_One'] text-sm uppercase text-[#000000] group-hover:text-[#FFFFFF] mb-2">
                        {checkpoint.title}
                      </div>
                      <div className="font-['Roboto_Condensed'] text-xs text-[#DA291C] group-hover:text-[#F5EEDC]">
                        DUE: {new Date(checkpoint.deadline).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }).toUpperCase()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-[#000000] p-4">
              <button
                onClick={() => setShowSubmissionSelector(false)}
                className="w-full bg-[#000000] text-[#F5EEDC] border border-[#DA291C] py-2 px-4 font-['Stalinist_One'] text-xs uppercase hover:bg-[#DA291C] hover:text-[#000000] transition-colors"
              >
                ABORT SELECTION
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default QuickActionsPanel