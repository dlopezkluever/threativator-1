import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { SovietContainer, SovietGrid, SovietCard, SovietBanner } from '../ui'
import ImmediateDirectivesSidebar from './ImmediateDirectivesSidebar'
import OperationalCalendar from './OperationalCalendar'
import VisibleStakesDisplay from './VisibleStakesDisplay'
import QuickActionsPanel from './QuickActionsPanel'

const DashboardLayout: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-[var(--color-background-parchment)] text-body">
      {/* Header - Official State Banner */}
      <header className="bg-[var(--color-accent-black)] border-b-[var(--border-width-medium)] border-[var(--color-primary-red)]">
        <SovietContainer className="py-[var(--header-padding)]">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-[var(--space-4)]">
              <div className="w-8 h-8 bg-[var(--color-primary-red)] flex items-center justify-center border-[var(--border-width-thin)] border-[var(--color-accent-black)]">
                <svg className="w-5 h-5 fill-[var(--color-accent-black)]" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <SovietBanner type="header" className="border-none bg-transparent text-[var(--color-text-light)] text-[var(--font-size-xl)]">
                OPERATIONAL COMMAND CENTER
              </SovietBanner>
            </div>
            <div className="flex items-center gap-[var(--space-4)] text-[var(--color-text-light)] text-[var(--font-size-sm)] font-[var(--font-family-body)]">
              <span>OPERATIVE: {user?.email?.split('@')[0].toUpperCase()}</span>
              <div className="w-[1px] h-4 bg-[var(--color-primary-red)]"></div>
              <span className="text-[var(--color-primary-red)] font-bold">UNDER SURVEILLANCE</span>
            </div>
          </div>
        </SovietContainer>
      </header>

      {/* Main Control Grid - Soviet 8-point grid system */}
      <SovietContainer className="py-[var(--space-8)]">
        <SovietGrid columns={12} gap="lg" className="min-h-[calc(100vh-120px)]">
          
          {/* Left: IMMEDIATE DIRECTIVES Sidebar (3 cols) */}
          <div className="col-span-12 lg:col-span-3">
            <ImmediateDirectivesSidebar />
          </div>

          {/* Center: OPERATIONAL CALENDAR (6 cols) */}
          <div className="col-span-12 lg:col-span-6">
            <SovietCard variant="primary" size="md" className="h-full">
              <SovietBanner type="alert" className="mb-0 -m-[var(--card-padding)] mb-[var(--card-padding)]">
                <div>
                  <h2 className="text-[var(--font-size-lg)] mb-1">
                    OPERATIONAL CALENDAR
                  </h2>
                  <p className="text-[var(--color-text-light)] text-[var(--font-size-xs)] font-[var(--font-family-body)] normal-case opacity-90">
                    ALL DIRECTIVES UNDER STATE MONITORING
                  </p>
                </div>
              </SovietBanner>
              <div className="h-[calc(100%-120px)] min-h-[400px]">
                <OperationalCalendar />
              </div>
            </SovietCard>
          </div>

          {/* Right: Control Panel (3 cols) */}
          <div className="col-span-12 lg:col-span-3 space-y-[var(--space-8)]">
            
            {/* STATE HOLDING CELL & KOMPROMAT */}
            <VisibleStakesDisplay />
            
            {/* QUICK ACTIONS */}
            <QuickActionsPanel />
            
            {/* CLASSIFIED INTEL */}
            <SovietCard variant="intel" size="md">
              <SovietBanner type="classified" className="mb-[var(--space-4)] -m-[var(--card-padding)] mb-[var(--card-padding)] bg-[var(--color-primary-red)] text-[var(--color-text-light)] border-[var(--color-accent-black)]">
                CLASSIFIED INTEL
              </SovietBanner>
              <div className="text-[var(--color-text-light)] text-[var(--font-size-xs)] font-[var(--font-family-body)] space-y-[var(--space-2)]">
                <div className="flex justify-between items-center">
                  <span>ACTIVE MISSIONS:</span>
                  <span className="text-[var(--color-primary-red)] font-bold">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>COMPLIANCE RATE:</span>
                  <span className="text-[var(--color-success-muted)]">N/A</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>SECURITY LEVEL:</span>
                  <span className="text-[var(--color-primary-red)] font-bold">MAXIMUM</span>
                </div>
              </div>
            </SovietCard>

          </div>
        </SovietGrid>
      </SovietContainer>

      {/* Bottom Status Bar */}
      <footer className="bg-[var(--color-accent-black)] border-t-[var(--border-width-medium)] border-[var(--color-primary-red)]">
        <SovietContainer className="py-[var(--space-3)]">
          <div className="flex justify-between items-center text-[var(--color-text-light)] text-[var(--font-size-xs)] font-[var(--font-family-body)]">
            <div className="flex items-center gap-[var(--space-6)]">
              <span>STATE NETWORK: <strong>ACTIVE</strong></span>
              <span>SURVEILLANCE: <strong>ENABLED</strong></span>
              <span>CONSEQUENCES: <strong>ARMED</strong></span>
            </div>
            <div className="text-[var(--color-primary-red)] font-bold text-display uppercase">
              <svg className="inline w-4 h-4 fill-current mr-1" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              REMEMBER: FAILURE IS NOT AN OPTION
              <svg className="inline w-4 h-4 fill-current ml-1" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>
        </SovietContainer>
      </footer>
    </div>
  )
}

export default DashboardLayout