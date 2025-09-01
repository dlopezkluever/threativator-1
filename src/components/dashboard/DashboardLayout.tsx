import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import ImmediateDirectivesSidebar from './ImmediateDirectivesSidebar'
import OperationalCalendar from './OperationalCalendar'
import VisibleStakesDisplay from './VisibleStakesDisplay'
import QuickActionsPanel from './QuickActionsPanel'

const DashboardLayout: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-[#F5EEDC] font-['Roboto_Condensed']">
      {/* Header - Official State Banner */}
      <header className="bg-[#000000] border-b-2 border-[#DA291C] p-4">
        <div className="max-w-full mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-[#DA291C] flex items-center justify-center">
              <span className="text-[#000000] font-bold text-lg">★</span>
            </div>
            <h1 className="text-[#F5EEDC] font-['Stalinist_One'] text-xl uppercase tracking-wide">
              OPERATIONAL COMMAND CENTER
            </h1>
          </div>
          <div className="flex items-center space-x-4 text-[#F5EEDC] text-sm">
            <span>OPERATIVE: {user?.email?.split('@')[0].toUpperCase()}</span>
            <div className="w-px h-4 bg-[#DA291C]"></div>
            <span className="text-[#DA291C]">UNDER SURVEILLANCE</span>
          </div>
        </div>
      </header>

      {/* Main Control Grid - 8-point grid system */}
      <div className="max-w-full mx-auto p-8 grid grid-cols-12 gap-8 min-h-[calc(100vh-80px)]">
        
        {/* Left: IMMEDIATE DIRECTIVES Sidebar (3 cols) */}
        <div className="col-span-12 lg:col-span-3">
          <ImmediateDirectivesSidebar />
        </div>

        {/* Center: OPERATIONAL CALENDAR (6 cols) */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-[#FFFFFF] border-2 border-[#000000] h-full">
            <div className="bg-[#DA291C] p-4 border-b-2 border-[#000000]">
              <h2 className="text-[#FFFFFF] font-['Stalinist_One'] text-lg uppercase tracking-wider">
                OPERATIONAL CALENDAR
              </h2>
              <p className="text-[#F5EEDC] text-xs mt-1 font-['Roboto_Condensed']">
                ALL DIRECTIVES UNDER STATE MONITORING
              </p>
            </div>
            <div className="p-4 h-[calc(100%-80px)]">
              <OperationalCalendar />
            </div>
          </div>
        </div>

        {/* Right: Control Panel (3 cols) */}
        <div className="col-span-12 lg:col-span-3 space-y-8">
          
          {/* STATE HOLDING CELL & KOMPROMAT */}
          <VisibleStakesDisplay />
          
          {/* QUICK ACTIONS */}
          <QuickActionsPanel />
          
          {/* CLASSIFIED INTEL */}
          <div className="bg-[#000000] border-2 border-[#DA291C] p-4">
            <h3 className="text-[#DA291C] font-['Stalinist_One'] text-sm uppercase mb-2">
              CLASSIFIED INTEL
            </h3>
            <div className="text-[#F5EEDC] text-xs font-['Roboto_Condensed'] space-y-1">
              <div className="flex justify-between">
                <span>ACTIVE MISSIONS:</span>
                <span className="text-[#DA291C]">0</span>
              </div>
              <div className="flex justify-between">
                <span>COMPLIANCE RATE:</span>
                <span className="text-[#5A7761]">N/A</span>
              </div>
              <div className="flex justify-between">
                <span>SECURITY LEVEL:</span>
                <span className="text-[#DA291C]">MAXIMUM</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Status Bar */}
      <footer className="bg-[#000000] border-t-2 border-[#DA291C] p-3">
        <div className="max-w-full mx-auto flex justify-between items-center text-[#F5EEDC] text-xs font-['Roboto_Condensed']">
          <div className="flex items-center space-x-6">
            <span>STATE NETWORK: ACTIVE</span>
            <span>SURVEILLANCE: ENABLED</span>
            <span>CONSEQUENCES: ARMED</span>
          </div>
          <div className="text-[#DA291C]">
            ★ REMEMBER: FAILURE IS NOT AN OPTION ★
          </div>
        </div>
      </footer>
    </div>
  )
}

export default DashboardLayout