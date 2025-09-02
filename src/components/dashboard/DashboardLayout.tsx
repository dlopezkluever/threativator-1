import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { supabase } from '../../lib/supabase'
import OperationalCalendar from './OperationalCalendar'
import VisibleStakesDisplay from './VisibleStakesDisplay'

const DashboardLayout: React.FC = () => {
  const { user, signOut } = useAuth()

  // Action handlers
  const handleRequestNewMission = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
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
        alert(`⚠️ INSUFFICIENT SECURITY CLEARANCE ⚠️\n\nTo establish new directives, operatives must demonstrate commitment through collateral.\n\nMINIMUM REQUIREMENTS (choose one or both):\n• ESTABLISH FINANCIAL COLLATERAL - Deposit funds for penalties\n• UPLOAD CLASSIFIED MATERIAL - Provide compromising content\n\nPlease establish security clearance before requesting missions, Comrade.`)
        return
      }

      console.log('Security clearance verified, opening goal creation flow...')
    } catch (error) {
      console.log('Unable to verify clearance, allowing mission request anyway')
    }
  }

  const handleSubmitProof = () => {
    console.log('Opening proof submission...')
  }

  const handleEstablishCollateral = () => {
    console.log('Opening financial collateral setup...')
  }

  const handleUploadKompromat = () => {
    console.log('Opening kompromat upload...')
  }

  const handleRecruitContacts = () => {
    console.log('Opening contact recruitment...')
  }

  const handleEmergencyExit = async () => {
    const confirmed = window.confirm('WARNING: UNAUTHORIZED DEPARTURE FROM STATE NETWORK?\n\nThis action will terminate your session and return you to civilian status. All active surveillance will continue. Are you certain, Comrade?')
    if (confirmed) {
      await signOut()
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background-parchment)] text-body">
      {/* Header - Official State Banner */}
      <header className="bg-[var(--color-accent-black)] border-b-[var(--border-width-medium)] border-[var(--color-primary-red)]">
        <div className="container mx-auto px-[var(--space-4)] py-[var(--header-padding)] max-w-[var(--container-max-width)]">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-[var(--space-4)]">
              <div className="w-8 h-8 bg-[var(--color-primary-red)] flex items-center justify-center border-[var(--border-width-thin)] border-[var(--color-accent-black)]">
                <svg className="w-5 h-5 fill-[var(--color-accent-black)]" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h1 className="text-[var(--color-text-light)] font-[var(--font-family-display)] text-[var(--font-size-xl)] uppercase tracking-wider">
                OPERATIONAL COMMAND CENTER
              </h1>
            </div>
            <div className="flex items-center gap-[var(--space-4)] text-[var(--color-text-light)] text-[var(--font-size-sm)] font-[var(--font-family-body)]">
              <span>OPERATIVE: {user?.email?.split('@')[0].toUpperCase()}</span>
              <div className="w-[1px] h-4 bg-[var(--color-primary-red)]"></div>
              <span className="text-[var(--color-primary-red)] font-bold">UNDER SURVEILLANCE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Command Center - Proper Grid Layout with shadcn */}
      <div className="container mx-auto px-[var(--space-4)] py-[var(--space-4)] max-w-[var(--container-max-width)]">
        
        {/* Top Row: 3-Column Layout - Sidebars + Calendar */}
        <div className="grid grid-cols-12 gap-[var(--space-4)] min-h-[calc(100vh-200px)] mb-[var(--space-4)]">
          
          {/* Left Sidebar: IMMEDIATE DIRECTIVES (2 cols) */}
          <div className="col-span-12 md:col-span-2">
            <Card className="h-full bg-[var(--color-accent-black)]">
              <CardHeader className="pb-[var(--space-2)]">
                <CardTitle>IMMEDIATE DIRECTIVES</CardTitle>
              </CardHeader>
              <CardContent className="text-[var(--color-text-light)] text-center flex-1 flex flex-col justify-center">
                <div className="mb-[var(--space-2)] text-2xl opacity-75">📋</div>
                <p className="text-[var(--font-size-xs)] uppercase mb-[var(--space-1)] font-[var(--font-family-body)]">NO IMMEDIATE DIRECTIVES</p>
                <p className="text-[10px] opacity-60 font-[var(--font-family-body)]">Request new mission from Command</p>
              </CardContent>
              <CardFooter className="justify-center text-center">
                <p className="text-[var(--color-primary-red)] text-[9px] uppercase font-[var(--font-family-body)]">
                  ★ CLICK DIRECTIVE TO SUBMIT PROOF ★
                </p>
              </CardFooter>
            </Card>
          </div>

          {/* Center: OPERATIONAL CALENDAR (8 cols) */}
          <div className="col-span-12 md:col-span-8">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>OPERATIONAL CALENDAR</CardTitle>
                <CardDescription>ALL DIRECTIVES UNDER STATE MONITORING</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <OperationalCalendar />
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: STATE COLLATERAL (2 cols) */}
          <div className="col-span-12 md:col-span-2">
            <Card className="h-full bg-[var(--color-accent-black)]">
              <CardHeader className="pb-[var(--space-2)]">
                <CardTitle>STATE COLLATERAL</CardTitle>
              </CardHeader>
              <CardContent className="text-[var(--color-text-light)] flex-1">
                <VisibleStakesDisplay />
              </CardContent>
            </Card>
          </div>
          
        </div>

        {/* Bottom Row: Command Actions Panel */}
        <div className="grid grid-cols-12 gap-[var(--space-4)]">
          
          {/* Command Actions Panel (9 cols) */}
          <div className="col-span-12 md:col-span-9">
            <Card className="bg-[var(--color-primary-red)]">
              <CardHeader className="pb-[var(--space-2)]">
                <CardTitle>COMMAND ACTIONS</CardTitle>
                <CardDescription>AUTHORIZED OPERATIONS</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-[var(--space-2)]">
                  <Button variant="command" size="sm" onClick={handleRequestNewMission}>
                    ⚡ NEW MISSION
                  </Button>
                  <Button variant="action" size="sm" onClick={handleSubmitProof}>
                    📋 SUBMIT PROOF
                  </Button>
                  <Button variant="success" size="sm" onClick={handleEstablishCollateral}>
                    💰 COLLATERAL
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleUploadKompromat} className="bg-[var(--color-text-secondary)] text-[var(--color-text-light)] border-[var(--color-primary-red)]">
                    📁 KOMPROMAT
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRecruitContacts} className="bg-[var(--color-text-secondary)] text-[var(--color-text-light)] border-[var(--color-primary-red)]">
                    👥 CONTACTS
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleEmergencyExit} className="bg-transparent text-[var(--color-text-light)] border-[var(--color-text-light)]">
                    ⚠️ EXIT
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="justify-center">
                <p className="text-[var(--color-text-light)] text-[9px] uppercase font-[var(--font-family-body)]">
                  ★ ALL ACTIONS MONITORED BY STATE ★
                </p>
              </CardFooter>
            </Card>
          </div>

          {/* Classified Intel (3 cols) */}
          <div className="col-span-12 md:col-span-3">
            <Card className="bg-[var(--color-accent-black)]">
              <CardHeader className="pb-[var(--space-2)]">
                <CardTitle>CLASSIFIED INTEL</CardTitle>
              </CardHeader>
              <CardContent className="text-[var(--color-text-light)] space-y-[var(--space-1)]">
                <div className="flex justify-between items-center text-[var(--font-size-xs)] font-[var(--font-family-body)]">
                  <span>ACTIVE MISSIONS:</span>
                  <span className="text-[var(--color-primary-red)] font-bold">0</span>
                </div>
                <div className="flex justify-between items-center text-[var(--font-size-xs)] font-[var(--font-family-body)]">
                  <span>COMPLIANCE RATE:</span>
                  <span className="text-[var(--color-success-muted)]">N/A</span>
                </div>
                <div className="flex justify-between items-center text-[var(--font-size-xs)] font-[var(--font-family-body)]">
                  <span>SECURITY LEVEL:</span>
                  <span className="text-[var(--color-primary-red)] font-bold">MAXIMUM</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
        </div>
        
      </div>

      {/* Bottom Status Bar */}
      <footer className="bg-[var(--color-accent-black)] border-t-[var(--border-width-medium)] border-[var(--color-primary-red)]">
        <div className="container mx-auto px-[var(--space-4)] py-[var(--space-3)] max-w-[var(--container-max-width)]">
          <div className="flex justify-between items-center text-[var(--color-text-light)] text-[var(--font-size-xs)] font-[var(--font-family-body)]">
            <div className="flex items-center gap-[var(--space-6)]">
              <span>STATE NETWORK: <strong>ACTIVE</strong></span>
              <span>SURVEILLANCE: <strong>ENABLED</strong></span>
              <span>CONSEQUENCES: <strong>ARMED</strong></span>
            </div>
            <div className="text-[var(--color-primary-red)] font-bold font-[var(--font-family-display)] uppercase">
              <svg className="inline w-4 h-4 fill-current mr-1" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              REMEMBER: FAILURE IS NOT AN OPTION
              <svg className="inline w-4 h-4 fill-current ml-1" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default DashboardLayout