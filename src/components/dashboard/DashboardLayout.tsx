import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useGoals } from '../../contexts/GoalContext'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card'
import { Button } from '../ui/button'
import { supabase } from '../../lib/supabase'
import OperationalCalendar from './OperationalCalendar'
import VisibleStakesDisplay from './VisibleStakesDisplay'
import ImmediateDirectivesSidebar from './ImmediateDirectivesSidebar'
import { useModalState, MODAL_NAMES } from '../../hooks/useModalState'
import { useConsequenceNotifications } from '../../hooks/useConsequenceNotifications'
import PaymentModal from '../modals/PaymentModal'
import KompromatModal from '../modals/KompromatModal'
import ContactModal from '../modals/ContactModal'
import SocialMediaModal from '../modals/SocialMediaModal'
import ConsequenceModal from './ConsequenceModal'

const DashboardLayout: React.FC = () => {
  const { user, signOut } = useAuth()
  const { } = useGoals()
  const navigate = useNavigate()
  
  // Modal state management
  const [, modalControl] = useModalState([
    MODAL_NAMES.PAYMENT,
    MODAL_NAMES.KOMPROMAT,
    MODAL_NAMES.CONTACT,
    MODAL_NAMES.SOCIAL_MEDIA
  ])

  // Consequence notifications
  const {
    pendingConsequence,
    isModalOpen: isConsequenceModalOpen,
    dismissConsequence,
    triggerTestConsequence
  } = useConsequenceNotifications()


  // Action handlers
  const handleRequestNewMission = async () => {
    try {
      // Get balance from auth.users.raw_user_meta_data
      const balance = user?.user_metadata?.holding_cell_balance || 0

      const { data: kompromat } = await supabase
        .from('kompromat')
        .select('id')
        .eq('user_id', user?.id)
        .limit(1)

      const hasFinancialCollateral = balance > 0
      const hasKompromat = kompromat && kompromat.length > 0

      if (!hasFinancialCollateral && !hasKompromat) {
        alert(`⚠️ INSUFFICIENT SECURITY CLEARANCE ⚠️\n\nTo establish new directives, operatives must demonstrate commitment through collateral.\n\nMINIMUM REQUIREMENTS (choose one or both):\n• ESTABLISH FINANCIAL COLLATERAL - Deposit funds for penalties\n• UPLOAD CLASSIFIED MATERIAL - Provide compromising content\n\nPlease establish security clearance before requesting missions, Comrade.`)
        return
      }

      // Navigate to goal creation
      navigate('/create-goal')
    } catch (error) {
      console.log('Unable to verify clearance, allowing mission request anyway')
      navigate('/create-goal')
    }
  }


  const handleEstablishCollateral = () => {
    modalControl.openModal(MODAL_NAMES.PAYMENT)
  }

  const handleUploadKompromat = () => {
    modalControl.openModal(MODAL_NAMES.KOMPROMAT)
  }

  const handleRecruitContacts = () => {
    modalControl.openModal(MODAL_NAMES.CONTACT)
  }

  const handleSocialMedia = () => {
    modalControl.openModal(MODAL_NAMES.SOCIAL_MEDIA)
  }

  const handleEmergencyExit = async () => {
    const confirmed = window.confirm('WARNING: UNAUTHORIZED DEPARTURE FROM STATE NETWORK?\n\nThis action will terminate your session and return you to civilian status. All active surveillance will continue. Are you certain, Comrade?')
    if (confirmed) {
      await signOut()
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-main-crimson)] text-body">
      {/* Header - Dominant Kompromator Banner */}
      <header className="bg-[var(--color-background-beige)] border-b-[6px] border-[var(--color-accent-black)]">
        <div className="container mx-auto px-[var(--space-6)] py-[var(--space-6)] max-w-[var(--container-max-width)]">
          <div className="flex justify-between items-center">
            
            {/* Left: Dominant KOMPROMATOR Title */}
            <div className="flex items-center gap-[var(--space-6)]">
              {/* Soviet Star Icon - Larger */}
              <div className="w-16 h-16 bg-[var(--color-primary-crimson)] flex items-center justify-center border-[var(--border-width-thick)] border-[var(--color-accent-black)]">
                <svg className="w-10 h-10 fill-[var(--color-accent-black)]" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              
              {/* Main Title */}
              <div className="flex flex-col">
                <h1 className="text-propaganda-title text-[var(--color-primary-crimson)]">
                  KOMPROMATOR
                </h1>
                <div className="text-[var(--color-text-primary)] text-[var(--font-size-base)] font-[var(--font-family-body)] uppercase tracking-wide opacity-80 mt-1" style={{color: 'var(--color-text-primary)'}}>
                  STATE DISCIPLINE NETWORK
                </div>
              </div>
            </div>
            
            {/* Right: User Status */}
            <div className="flex flex-col items-end gap-2 text-right">
              <div className="text-[var(--color-text-primary)] text-[var(--font-size-sm)] font-[var(--font-family-body)] uppercase font-bold" style={{color: 'var(--color-text-primary)'}}>
                OPERATIONAL COMMAND CENTER
              </div>
              <div className="flex items-center gap-[var(--space-3)]">
                <div className="text-[var(--color-text-primary)] text-[var(--font-size-sm)] font-[var(--font-family-body)]" style={{color: 'var(--color-text-primary)'}}>
                  <span className="uppercase font-bold">OPERATIVE:</span> <span className="text-[var(--color-primary-crimson)] font-bold">{user?.email?.split('@')[0].toUpperCase()}</span>
                </div>
                <div className="w-[2px] h-6 bg-[var(--color-primary-crimson)]"></div>
                <div className="text-[var(--color-primary-crimson)] font-[var(--font-family-display)] text-[var(--font-size-sm)] uppercase tracking-wide">
                  UNDER SURVEILLANCE
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </header>

      {/* Main Dashboard - 2-Column Layout inspired by reference */}
      <div className="container mx-auto px-[var(--space-4)] py-[var(--space-4)] max-w-[var(--container-max-width)]">
        
        {/* Primary Row: Calendar (75%) + Tasks Sidebar (25%) - FORCE HORIZONTAL */}
        <div className="flex gap-[var(--space-4)] min-h-[calc(100vh-200px)] mb-[var(--space-4)]">
          
          {/* Left: IMMEDIATE DIRECTIVES Sidebar (25% width) */}
          <div className="w-1/4 min-w-[280px]">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>IMMEDIATE DIRECTIVES</CardTitle>
                <CardDescription>NEXT 7 DAYS - COMPLIANCE REQUIRED</CardDescription>
              </CardHeader>
              <CardContent className="text-center flex-1 flex flex-col justify-center">
                <ImmediateDirectivesSidebar />
              </CardContent>
              <CardFooter className="justify-center text-center">
                <p className="text-[var(--color-primary-crimson)] text-[var(--font-size-xs)] uppercase font-[var(--font-family-display)] tracking-wide">
                  ★ CLICK DIRECTIVE TO SUBMIT PROOF ★
                </p>
              </CardFooter>
            </Card>
          </div>

          {/* Right: OPERATIONAL CALENDAR (75% width) */}
          <div className="flex-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>OPERATIONAL CALENDAR</CardTitle>
                <CardDescription>ALL DIRECTIVES UNDER STATE MONITORING</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-[var(--space-2)]">
                <div className="h-full min-h-[500px] bg-white border-[var(--border-width-medium)] border-[var(--color-border-primary)]">
                  <OperationalCalendar />
                </div>
              </CardContent>
            </Card>
          </div>
          
        </div>

        {/* Bottom Row: State Management - FORCE HORIZONTAL */}
        <div className="flex gap-[var(--space-4)] h-[250px]">
          
          {/* State Collateral (25% width) */}
          <div className="flex-[1]">
            <Card className="h-full">
              <CardHeader className="py-[var(--space-3)]">
                <CardTitle>STATE COLLATERAL</CardTitle>
                <CardDescription>ASSETS UNDER STATE CONTROL</CardDescription>
              </CardHeader>
              <CardContent className="py-[var(--space-3)]">
                <VisibleStakesDisplay />
              </CardContent>
            </Card>
          </div>

          {/* Command Actions (50% width) */}
          <div className="flex-[2]">
            <Card className="h-full">
              <CardHeader className="py-[var(--space-3)]">
                <CardTitle>COMMAND ACTIONS</CardTitle>
                <CardDescription>AUTHORIZED OPERATIONS</CardDescription>
              </CardHeader>
              <CardContent className="py-[var(--space-3)]">
                <div className="grid grid-cols-3 gap-[var(--space-2)] h-full">
                  <Button variant="command" size="default" onClick={handleRequestNewMission} className="h-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-xl">⚡</span>
                      <span className="text-[var(--font-size-sm)] font-bold leading-tight">NEW MISSION</span>
                    </div>
                  </Button>
                  <Button variant="success" size="default" onClick={handleEstablishCollateral} className="h-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-xl">💰</span>
                      <span className="text-[var(--font-size-sm)] font-bold leading-tight">COLLATERAL</span>
                    </div>
                  </Button>
                  <Button variant="ghost" size="default" onClick={handleUploadKompromat} className="h-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-xl">📁</span>
                      <span className="text-[var(--font-size-sm)] font-bold leading-tight">KOMPROMAT</span>
                    </div>
                  </Button>
                  <Button variant="ghost" size="default" onClick={handleRecruitContacts} className="h-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-xl">👥</span>
                      <span className="text-[var(--font-size-sm)] font-bold leading-tight">CONTACTS</span>
                    </div>
                  </Button>
                  <Button variant="ghost" size="default" onClick={handleSocialMedia} className="h-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-xl">🔗</span>
                      <span className="text-[var(--font-size-sm)] font-bold leading-tight">SOCIAL</span>
                    </div>
                  </Button>
                  <Button variant="danger" size="default" onClick={triggerTestConsequence} className="h-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-xl">🎭</span>
                      <span className="text-[var(--font-size-sm)] font-bold leading-tight">TEST DISHONOR</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Classified Intel (25% width) */}
          <div className="flex-[1]">
            <Card className="h-full">
              <CardHeader className="py-[var(--space-3)]">
                <CardTitle>CLASSIFIED INTEL</CardTitle>
                <CardDescription>OPERATIONAL STATUS</CardDescription>
              </CardHeader>
              <CardContent className="space-y-[var(--space-4)] py-[var(--space-3)]">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--font-size-base)] font-[var(--font-family-body)] uppercase font-bold">ACTIVE MISSIONS:</span>
                  <span className="text-[var(--color-primary-crimson)] font-[var(--font-family-display)] text-[var(--font-size-xl)] font-bold">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--font-size-base)] font-[var(--font-family-body)] uppercase font-bold">COMPLIANCE RATE:</span>
                  <span className="text-[var(--color-success-muted)] font-[var(--font-family-display)] text-[var(--font-size-lg)] font-bold">N/A</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--font-size-base)] font-[var(--font-family-body)] uppercase font-bold">SECURITY LEVEL:</span>
                  <span className="text-[var(--color-primary-crimson)] font-[var(--font-family-display)] text-[var(--font-size-xl)] font-bold">MAXIMUM</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
        </div>
        
      </div>

      {/* Bottom Status Bar - Compressed */}
      <footer className="bg-[var(--color-background-beige)] border-t-[6px] border-[var(--color-accent-black)]">
        <div className="container mx-auto px-[var(--space-4)] py-[var(--space-1)] max-w-[var(--container-max-width)]">
          <div className="flex justify-between items-center">
            {/* Left: System Status */}
            <div className="flex items-center gap-[var(--space-4)] text-[var(--color-text-primary)] text-[var(--font-size-sm)] font-[var(--font-family-body)]">
              <span className="uppercase font-bold">STATE NETWORK: <span className="text-[var(--color-success-muted)]">ACTIVE</span></span>
              <span className="uppercase font-bold">SURVEILLANCE: <span className="text-[var(--color-success-muted)]">ENABLED</span></span>
              <span className="uppercase font-bold">CONSEQUENCES: <span className="text-[var(--color-primary-crimson)]">ARMED</span></span>
            </div>
            
            {/* Right: Warning Message */}
            <div className="flex items-center gap-[var(--space-2)] text-[var(--color-primary-crimson)] font-[var(--font-family-display)] text-[var(--font-size-sm)] uppercase tracking-wide font-bold">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="whitespace-nowrap">🔐 MILITARY-GRADE ENCRYPTION</span>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PaymentModal 
        isOpen={modalControl.isModalOpen(MODAL_NAMES.PAYMENT)} 
        onClose={() => modalControl.closeModal(MODAL_NAMES.PAYMENT)} 
      />
      <KompromatModal 
        isOpen={modalControl.isModalOpen(MODAL_NAMES.KOMPROMAT)} 
        onClose={() => modalControl.closeModal(MODAL_NAMES.KOMPROMAT)} 
      />
      <ContactModal 
        isOpen={modalControl.isModalOpen(MODAL_NAMES.CONTACT)} 
        onClose={() => modalControl.closeModal(MODAL_NAMES.CONTACT)} 
      />
      <SocialMediaModal 
        isOpen={modalControl.isModalOpen(MODAL_NAMES.SOCIAL_MEDIA)} 
        onClose={() => modalControl.closeModal(MODAL_NAMES.SOCIAL_MEDIA)} 
      />
      
      {/* Consequence Modal */}
      <ConsequenceModal
        isOpen={isConsequenceModalOpen}
        onClose={dismissConsequence}
        consequence={pendingConsequence}
        failureType={pendingConsequence?.failure_type || 'checkpoint'}
      />
    </div>
  )
}

export default DashboardLayout