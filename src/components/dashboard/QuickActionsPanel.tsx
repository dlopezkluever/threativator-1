import React, { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { SovietCard, SovietButton, SovietBanner } from '../ui'

interface CheckpointData {
  id: string
  title: string
  deadline: string
  status: string
  goals: {
    id: string
    title: string
    user_id: string
  } | {
    id: string
    title: string
    user_id: string
  }[]
}

const QuickActionsPanel: React.FC = () => {
  const { user, signOut } = useAuth()
  const [showSubmissionSelector, setShowSubmissionSelector] = useState(false)
  const [availableCheckpoints, setAvailableCheckpoints] = useState<CheckpointData[]>([])
  const [loadingCheckpoints, setLoadingCheckpoints] = useState(false)

  const handleRequestNewMission = async () => {
    // Check if user has sufficient collateral for mission creation
    try {
      // Quick check for user profile and collateral
      const { data: profile } = await supabase
        .from('users')
        .select('holding_cell_balance')
        .eq('id', user?.id)
        .single()

      const { data: kompromat } = await supabase
        .from('kompromat')
        .select('id')
        .eq('user_id', user?.id)
        .limit(1)

      const hasFinancialCollateral = profile?.holding_cell_balance && profile.holding_cell_balance > 0
      const hasKompromat = kompromat && kompromat.length > 0

      if (!hasFinancialCollateral && !hasKompromat) {
        // Show clearance requirement modal
        alert(`⚠️ INSUFFICIENT SECURITY CLEARANCE ⚠️

To establish new directives, operatives must demonstrate commitment through collateral. 

MINIMUM REQUIREMENTS (choose one or both):
• ESTABLISH FINANCIAL COLLATERAL - Deposit funds for penalties
• UPLOAD CLASSIFIED MATERIAL - Provide compromising content

Please establish security clearance before requesting missions, Comrade.`)
        return
      }

      // Proceed to goal creation
      console.log('Security clearance verified, opening goal creation flow...')
      // navigate('/goals/create')
    } catch (error) {
      console.log('Unable to verify clearance, allowing mission request anyway')
      // navigate('/goals/create')
    }
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

  const handleEstablishFinancialCollateral = () => {
    // TODO: Open Stripe payment modal/page
    console.log('Opening financial collateral setup...')
    // Could navigate to /onboarding?step=stripe or open modal
  }

  const handleUploadKompromat = () => {
    // TODO: Open Kompromat upload modal/page
    console.log('Opening kompromat upload...')
    // Could navigate to /onboarding?step=kompromat or open modal
  }

  const handleRecruitContacts = () => {
    // TODO: Open contacts management modal/page
    console.log('Opening contact recruitment...')
    // Could navigate to /onboarding?step=contacts or open modal
  }

  const handleConnectSocialMedia = () => {
    // TODO: Open social media connection modal/page
    console.log('Opening social media integration...')
    // Could navigate to /onboarding?step=social or open modal
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
      <SovietCard variant="danger" size="md" className="overflow-hidden">
        <SovietBanner type="classified" className="-m-[var(--card-padding)] mb-[var(--card-padding)]">
          <div>
            <h3 className="text-[var(--font-size-sm)] mb-1">
              COMMAND ACTIONS
            </h3>
            <p className="text-[var(--color-text-light)] text-[var(--font-size-xs)] font-[var(--font-family-body)] normal-case opacity-90">
              AUTHORIZED OPERATIONS
            </p>
          </div>
        </SovietBanner>

        <div className="space-y-[var(--space-3)]">
          {/* Primary Actions */}
          <SovietButton
            variant="command"
            size="md"
            onClick={handleRequestNewMission}
            className="w-full"
            icon={<span>⚡</span>}
          >
            REQUEST NEW MISSION
          </SovietButton>

          <SovietButton
            variant="action"
            size="md"
            onClick={handleSubmitProof}
            disabled={loadingCheckpoints}
            isLoading={loadingCheckpoints}
            className="w-full"
            icon={<span>📋</span>}
          >
            {loadingCheckpoints ? 'SCANNING...' : 'SUBMIT PROOF'}
          </SovietButton>

          {/* Security Clearance Actions */}
          <div className="border-t-[var(--border-width-thin)] border-[var(--color-text-light)] pt-[var(--space-3)] mt-[var(--space-3)]">
            <div className="text-[var(--color-text-light)] font-[var(--font-family-display)] text-[var(--font-size-xs)] uppercase mb-[var(--space-3)] text-center tracking-wider">
              SECURITY CLEARANCE
            </div>
            
            <div className="grid grid-cols-1 gap-[var(--space-2)]">
              <SovietButton
                variant="success"
                size="sm"
                onClick={handleEstablishFinancialCollateral}
                className="w-full text-[var(--font-size-xs)] font-[var(--font-family-body)]">
                💰 ESTABLISH FINANCIAL COLLATERAL
              </SovietButton>
              
              <SovietButton
                variant="ghost"
                size="sm"
                onClick={handleUploadKompromat}
                className="w-full text-[var(--font-size-xs)] font-[var(--font-family-body)] bg-[var(--color-text-secondary)] text-[var(--color-text-light)] border-[var(--color-primary-red)] hover:bg-[var(--color-primary-red)]">
                📁 UPLOAD CLASSIFIED MATERIAL
              </SovietButton>
              
              <SovietButton
                variant="ghost"
                size="sm"
                onClick={handleRecruitContacts}
                className="w-full text-[var(--font-size-xs)] font-[var(--font-family-body)] bg-[var(--color-text-secondary)] text-[var(--color-text-light)] border-[var(--color-primary-red)] hover:bg-[var(--color-primary-red)]">
                👥 RECRUIT CONTACTS
              </SovietButton>
              
              <SovietButton
                variant="ghost"
                size="sm"
                onClick={handleConnectSocialMedia}
                className="w-full text-[var(--font-size-xs)] font-[var(--font-family-body)] bg-[var(--color-text-secondary)] text-[var(--color-text-light)] border-[var(--color-primary-red)] hover:bg-[var(--color-primary-red)]">
                📱 CONNECT SOCIAL PLATFORMS
              </SovietButton>
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-[var(--space-2)] mt-[var(--space-4)]">
            <SovietButton
              variant="ghost"
              size="sm"
              onClick={handleViewAnalytics}
              className="text-[var(--font-size-xs)] font-[var(--font-family-body)] bg-[var(--color-text-secondary)] text-[var(--color-text-light)] border-[var(--color-primary-red)] hover:bg-[var(--color-primary-red)]">
              INTEL REPORTS
            </SovietButton>
            
            <SovietButton
              variant="ghost"
              size="sm"
              onClick={() => console.log('Settings...')}
              className="text-[var(--font-size-xs)] font-[var(--font-family-body)] bg-[var(--color-text-secondary)] text-[var(--color-text-light)] border-[var(--color-primary-red)] hover:bg-[var(--color-primary-red)]">
              SETTINGS
            </SovietButton>
          </div>

          {/* Emergency Exit */}
          <div className="mt-[var(--space-4)] pt-[var(--space-3)] border-t-[var(--border-width-thin)] border-[var(--color-text-light)]">
            <SovietButton
              variant="ghost"
              size="sm"
              onClick={handleEmergencyExit}
              className="w-full bg-transparent text-[var(--color-text-light)] border-[var(--color-text-light)] hover:bg-[var(--color-text-light)] hover:text-[var(--color-primary-red)] font-[var(--font-family-body)]">
              ⚠️ EMERGENCY EXIT
            </SovietButton>
          </div>
        </div>

        {/* Warning Footer */}
        <SovietBanner type="classified" className="-m-[var(--card-padding)] mt-[var(--card-padding)] bg-[var(--color-accent-black)] text-[var(--color-primary-red)] border-t-[var(--color-primary-red)] border-x-0 border-b-0 text-center">
          <span className="text-[var(--font-size-xs)]">
            ★ ALL ACTIONS MONITORED BY STATE ★
          </span>
        </SovietBanner>
      </SovietCard>

      {/* Submission Selector Modal */}
      {showSubmissionSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[var(--z-index-modal)]">
          <SovietCard variant="secondary" size="md" className="max-w-lg w-full mx-4 max-h-96 overflow-hidden">
            <SovietBanner type="alert" className="-m-[var(--card-padding)] mb-[var(--card-padding)]">
              <div>
                <h3 className="text-[var(--font-size-lg)] mb-1">
                  SELECT DIRECTIVE FOR SUBMISSION
                </h3>
                <p className="text-[var(--color-text-light)] text-[var(--font-size-xs)] font-[var(--font-family-body)] normal-case opacity-90">
                  CHOOSE MISSION TO SUBMIT PROOF OF COMPLIANCE
                </p>
              </div>
            </SovietBanner>

            <div className="max-h-64 overflow-y-auto">
              {availableCheckpoints.length === 0 ? (
                <div className="text-center py-[var(--space-8)]">
                  <div className="text-[var(--color-text-muted)] text-2xl mb-[var(--space-2)]">📋</div>
                  <p className="text-[var(--color-text-primary)] font-[var(--font-family-body)] text-[var(--font-size-sm)] uppercase mb-[var(--space-1)]">
                    NO PENDING DIRECTIVES
                  </p>
                  <p className="text-[var(--color-text-muted)] font-[var(--font-family-body)] text-[var(--font-size-xs)]">
                    Request new mission from Command Center
                  </p>
                </div>
              ) : (
                <div className="space-y-[var(--space-3)]">
                  {availableCheckpoints.map((checkpoint) => (
                    <SovietButton
                      key={checkpoint.id}
                      variant="ghost"
                      size="md"
                      onClick={() => handleCheckpointSelect(checkpoint)}
                      className="w-full text-left justify-start bg-[var(--color-container-light)] text-[var(--color-text-primary)] border-[var(--color-border-primary)] hover:bg-[var(--color-primary-red)] hover:text-[var(--color-text-light)] font-[var(--font-family-body)]">
                      <div className="flex flex-col items-start gap-1">
                        <div className="text-[var(--font-size-xs)] uppercase opacity-70">
                          MISSION: {Array.isArray(checkpoint.goals) ? checkpoint.goals[0]?.title : checkpoint.goals?.title}
                        </div>
                        <div className="font-[var(--font-family-display)] text-[var(--font-size-sm)] uppercase">
                          {checkpoint.title}
                        </div>
                        <div className="text-[var(--font-size-xs)] opacity-80">
                          DUE: {new Date(checkpoint.deadline).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }).toUpperCase()}
                        </div>
                      </div>
                    </SovietButton>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t-[var(--border-width-thin)] border-[var(--color-border-primary)] pt-[var(--space-4)] -mx-[var(--card-padding)] -mb-[var(--card-padding)] px-[var(--card-padding)] pb-[var(--card-padding)]">
              <SovietButton
                variant="command"
                size="sm"
                onClick={() => setShowSubmissionSelector(false)}
                className="w-full">
                ABORT SELECTION
              </SovietButton>
            </div>
          </SovietCard>
        </div>
      )}
    </>
  )
}

export default QuickActionsPanel