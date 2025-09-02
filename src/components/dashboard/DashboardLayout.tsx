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
    <div className="min-h-screen bg-[var(--color-main-crimson)] text-body">
      {/* Header - Kompromator Banner */}
      <header className="bg-[var(--color-background-beige)] border-b-[var(--border-width-medium)] border-[var(--color-accent-black)]">
        <div className="container mx-auto px-[var(--space-4)] py-[var(--header-padding)] max-w-[var(--container-max-width)]">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-[var(--space-4)]">
              <div className="w-8 h-8 bg-[var(--color-primary-crimson)] flex items-center justify-center border-[var(--border-width-thin)] border-[var(--color-accent-black)]">
                <svg className="w-5 h-5 fill-[var(--color-accent-black)]" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h1 className="text-[var(--color-text-crimson)] font-[var(--font-family-display)] text-[var(--font-size-3xl)] uppercase tracking-wider">
                KOMPROMATOR
              </h1>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="text-[var(--color-text-primary)] text-[var(--font-size-xs)] font-[var(--font-family-body)] uppercase">
                OPERATIONAL COMMAND CENTER
              </div>
              <div className="flex items-center gap-[var(--space-2)] text-[var(--color-text-primary)] text-[var(--font-size-sm)] font-[var(--font-family-body)]">
                <span>OPERATIVE: {user?.email?.split('@')[0].toUpperCase()}</span>
                <div className="w-[1px] h-3 bg-[var(--color-primary-crimson)]"></div>
                <span className="text-[var(--color-primary-crimson)] font-bold">UNDER SURVEILLANCE</span>
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
          <div className="w-1/4 min-w-[250px]">
            <Card className="h-full bg-[var(--color-background-beige)]">
              <CardHeader className="bg-[var(--color-background-beige)] text-[var(--color-text-primary)] border-b-[var(--color-accent-black)]">
                <CardTitle className="text-[var(--color-text-primary)]">IMMEDIATE DIRECTIVES</CardTitle>
                <CardDescription className="text-[var(--color-text-primary)] opacity-70">NEXT 7 DAYS - COMPLIANCE REQUIRED</CardDescription>
              </CardHeader>
              <CardContent className="text-[var(--color-text-primary)] text-center flex-1 flex flex-col justify-center">
                <div className="mb-[var(--space-2)] text-2xl opacity-50">📋</div>
                <p className="text-[var(--font-size-xs)] uppercase mb-[var(--space-1)] font-[var(--font-family-body)]">NO IMMEDIATE DIRECTIVES</p>
                <p className="text-[10px] opacity-60 font-[var(--font-family-body)]">Request new mission from Command</p>
              </CardContent>
              <CardFooter className="justify-center text-center bg-[var(--color-background-beige)] border-t-[var(--color-accent-black)]">
                <p className="text-[var(--color-primary-crimson)] text-[9px] uppercase font-[var(--font-family-body)]">
                  ★ CLICK DIRECTIVE TO SUBMIT PROOF ★
                </p>
              </CardFooter>
            </Card>
          </div>

          {/* Right: OPERATIONAL CALENDAR (75% width) */}
          <div className="flex-1">
            <Card className="h-full bg-[var(--color-background-beige)]">
              <CardHeader className="bg-[var(--color-background-beige)] text-[var(--color-text-primary)] border-b-[var(--color-accent-black)]">
                <CardTitle className="text-[var(--color-text-primary)]">OPERATIONAL CALENDAR</CardTitle>
                <CardDescription className="text-[var(--color-text-primary)] opacity-70">ALL DIRECTIVES UNDER STATE MONITORING</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-[var(--space-2)]">
                <OperationalCalendar />
              </CardContent>
            </Card>
          </div>
          
        </div>

        {/* Bottom Row: State Management - FORCE HORIZONTAL */}
        <div className="flex gap-[var(--space-4)] h-[200px]">
          
          {/* State Collateral (33% width) */}
          <div className="flex-1">
            <Card className="h-full bg-[var(--color-background-beige)]">
              <CardHeader className="bg-[var(--color-background-beige)] text-[var(--color-text-primary)] border-b-[var(--color-accent-black)] py-[var(--space-2)]">
                <CardTitle className="text-[var(--color-text-primary)] text-[var(--font-size-base)]">STATE COLLATERAL</CardTitle>
                <CardDescription className="text-[var(--color-text-primary)] opacity-70">ASSETS UNDER STATE CONTROL</CardDescription>
              </CardHeader>
              <CardContent className="text-[var(--color-text-primary)] py-[var(--space-2)]">
                <VisibleStakesDisplay />
              </CardContent>
            </Card>
          </div>

          {/* Command Actions (33% width) */}
          <div className="flex-1">
            <Card className="h-full bg-[var(--color-background-beige)]">
              <CardHeader className="bg-[var(--color-background-beige)] text-[var(--color-text-primary)] border-b-[var(--color-accent-black)] py-[var(--space-2)]">
                <CardTitle className="text-[var(--color-text-primary)] text-[var(--font-size-base)]">COMMAND ACTIONS</CardTitle>
                <CardDescription className="text-[var(--color-text-primary)] opacity-70">AUTHORIZED OPERATIONS</CardDescription>
              </CardHeader>
              <CardContent className="py-[var(--space-2)]">
                <div className="grid grid-cols-2 gap-[var(--space-2)]">
                  <Button variant="command" size="sm" onClick={handleRequestNewMission}>
                    ⚡ NEW MISSION
                  </Button>
                  <Button variant="action" size="sm" onClick={handleSubmitProof}>
                    📋 SUBMIT PROOF
                  </Button>
                  <Button variant="success" size="sm" onClick={handleEstablishCollateral}>
                    💰 COLLATERAL
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleUploadKompromat}>
                    📁 KOMPROMAT
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRecruitContacts}>
                    👥 CONTACTS
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleEmergencyExit}>
                    ⚠️ EXIT
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Classified Intel (33% width) */}
          <div className="flex-1">
            <Card className="h-full bg-[var(--color-background-beige)]">
              <CardHeader className="bg-[var(--color-background-beige)] text-[var(--color-text-primary)] border-b-[var(--color-accent-black)] py-[var(--space-2)]">
                <CardTitle className="text-[var(--color-text-primary)] text-[var(--font-size-base)]">CLASSIFIED INTEL</CardTitle>
              </CardHeader>
              <CardContent className="text-[var(--color-text-primary)] space-y-[var(--space-2)] py-[var(--space-2)]">
                <div className="flex justify-between items-center text-[var(--font-size-xs)] font-[var(--font-family-body)]">
                  <span>ACTIVE MISSIONS:</span>
                  <span className="text-[var(--color-primary-crimson)] font-bold">0</span>
                </div>
                <div className="flex justify-between items-center text-[var(--font-size-xs)] font-[var(--font-family-body)]">
                  <span>COMPLIANCE RATE:</span>
                  <span className="text-[var(--color-success-muted)]">N/A</span>
                </div>
                <div className="flex justify-between items-center text-[var(--font-size-xs)] font-[var(--font-family-body)]">
                  <span>SECURITY LEVEL:</span>
                  <span className="text-[var(--color-primary-crimson)] font-bold">MAXIMUM</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
        </div>
        
      </div>

      {/* Bottom Status Bar */}
      <footer className="bg-[var(--color-background-beige)] border-t-[var(--border-width-medium)] border-[var(--color-accent-black)]">
        <div className="container mx-auto px-[var(--space-4)] py-[var(--space-3)] max-w-[var(--container-max-width)]">
          <div className="flex justify-between items-center text-[var(--color-text-primary)] text-[var(--font-size-xs)] font-[var(--font-family-body)]">
            <div className="flex items-center gap-[var(--space-6)]">
              <span>STATE NETWORK: <strong>ACTIVE</strong></span>
              <span>SURVEILLANCE: <strong>ENABLED</strong></span>
              <span>CONSEQUENCES: <strong>ARMED</strong></span>
            </div>
            <div className="text-[var(--color-primary-crimson)] font-bold font-[var(--font-family-display)] uppercase">
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