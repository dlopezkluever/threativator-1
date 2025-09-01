import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface UserProfile {
  holding_cell_balance: number
}

interface KompromatFile {
  id: string
  file_name: string
  severity: 'minor' | 'major'
  created_at: string
}

const VisibleStakesDisplay: React.FC = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [kompromatFiles, setKompromatFiles] = useState<KompromatFile[]>([])
  const [loading, setLoading] = useState(true)
  const [showKompromatDetails, setShowKompromatDetails] = useState(false)

  const loadStakesData = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)

      // Load user profile for holding cell balance
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('holding_cell_balance')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.warn('📊 [VisibleStakes] Profile not found, using default values:', profileError)
        setProfile({ holding_cell_balance: 0 })
      } else {
        setProfile(profileData)
      }

      // Load kompromat files
      const { data: kompromatData, error: kompromatError } = await supabase
        .from('kompromat')
        .select('id, file_name, severity, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (kompromatError) {
        console.warn('📁 [VisibleStakes] Kompromat table not found, using empty array:', kompromatError)
        setKompromatFiles([])
      } else {
        setKompromatFiles(kompromatData || [])
      }

    } catch (error) {
      console.error('Error loading stakes data:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadStakesData()
  }, [loadStakesData])

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '📸'
      case 'mp4':
      case 'mov':
      case 'avi':
        return '🎬'
      case 'txt':
      case 'doc':
      case 'docx':
        return '📄'
      default:
        return '📁'
    }
  }

  if (loading) {
    return (
      <div className="bg-[#000000] border-2 border-[#DA291C] p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-[#DA291C] w-3/4"></div>
          <div className="h-8 bg-[#333333] w-full"></div>
          <div className="h-4 bg-[#DA291C] w-1/2"></div>
          <div className="h-6 bg-[#333333] w-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#000000] border-2 border-[#DA291C]">
      {/* Header */}
      <div className="bg-[#DA291C] p-3 border-b-2 border-[#000000]">
        <h3 className="text-[#FFFFFF] font-['Stalinist_One'] text-sm uppercase tracking-wider">
          STATE COLLATERAL
        </h3>
        <p className="text-[#F5EEDC] text-xs font-['Roboto_Condensed'] mt-1">
          ASSETS UNDER STATE CONTROL
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Financial Stakes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#F5EEDC] font-['Roboto_Condensed'] text-xs uppercase font-bold">
              HOLDING CELL BALANCE:
            </span>
            <div className="w-4 h-4 bg-[#DA291C] flex items-center justify-center">
              <span className="text-[#000000] text-xs">🔒</span>
            </div>
          </div>
          
          <div className="bg-[#1a1a1a] border border-[#DA291C] p-3">
            <div className="text-center">
              <div className="text-[#5A7761] font-['Stalinist_One'] text-2xl uppercase">
                {formatCurrency(profile?.holding_cell_balance || 0)}
              </div>
              <div className="text-[#888888] font-['Roboto_Condensed'] text-xs mt-1 uppercase">
                AVAILABLE FOR STAKES
              </div>
            </div>
          </div>
        </div>

        {/* Kompromat Archive */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#F5EEDC] font-['Roboto_Condensed'] text-xs uppercase font-bold">
              SECURE STATE ARCHIVE:
            </span>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-[#DA291C] flex items-center justify-center">
                <span className="text-[#000000] text-xs">📁</span>
              </div>
              <span className="text-[#DA291C] font-['Stalinist_One'] text-xs">
                {kompromatFiles.length} FILES
              </span>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#DA291C] p-3">
            {kompromatFiles.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-[#888888] text-lg mb-2">🗃️</div>
                <p className="text-[#888888] font-['Roboto_Condensed'] text-xs uppercase">
                  NO CLASSIFIED MATERIAL
                </p>
                <p className="text-[#666666] font-['Roboto_Condensed'] text-xs mt-1">
                  Upload during onboarding
                </p>
              </div>
            ) : (
              <>
                {/* File Count Summary */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="text-center">
                    <div className="text-[#FF8C00] font-['Stalinist_One'] text-lg">
                      {kompromatFiles.filter(f => f.severity === 'minor').length}
                    </div>
                    <div className="text-[#F5EEDC] font-['Roboto_Condensed'] text-xs uppercase">
                      MINOR
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[#DA291C] font-['Stalinist_One'] text-lg">
                      {kompromatFiles.filter(f => f.severity === 'major').length}
                    </div>
                    <div className="text-[#F5EEDC] font-['Roboto_Condensed'] text-xs uppercase">
                      MAJOR
                    </div>
                  </div>
                </div>

                {/* File Preview Grid (Heavily Blurred) */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {kompromatFiles.slice(0, 6).map((file) => (
                    <div
                      key={file.id}
                      className="bg-[#333333] border border-[#DA291C] p-2 text-center relative group cursor-pointer"
                      title="CLASSIFIED - VIEW RESTRICTED"
                    >
                      <div className="text-lg mb-1 blur-sm group-hover:blur-none transition-all duration-300">
                        {getFileIcon(file.file_name)}
                      </div>
                      <div className="text-[#F5EEDC] text-xs font-['Roboto_Condensed'] uppercase blur-sm group-hover:blur-none transition-all duration-300">
                        K-{file.id.slice(0, 4)}
                      </div>
                      <div className={`absolute top-1 right-1 w-2 h-2 ${
                        file.severity === 'major' ? 'bg-[#DA291C]' : 'bg-[#FF8C00]'
                      }`}></div>
                      
                      {/* CLASSIFIED overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center group-hover:bg-opacity-25 transition-all duration-300">
                        <span className="text-[#DA291C] font-['Stalinist_One'] text-xs transform -rotate-12">
                          CLASSIFIED
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {kompromatFiles.length > 6 && (
                    <div className="bg-[#333333] border border-[#DA291C] p-2 text-center flex items-center justify-center">
                      <div>
                        <div className="text-[#DA291C] font-['Stalinist_One'] text-sm">
                          +{kompromatFiles.length - 6}
                        </div>
                        <div className="text-[#F5EEDC] text-xs font-['Roboto_Condensed'] uppercase">
                          MORE
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* View All Link */}
                <button
                  onClick={() => setShowKompromatDetails(!showKompromatDetails)}
                  className="w-full bg-[#333333] border border-[#DA291C] py-2 text-[#F5EEDC] font-['Roboto_Condensed'] text-xs uppercase hover:bg-[#DA291C] hover:text-[#000000] transition-colors"
                >
                  {showKompromatDetails ? 'HIDE DETAILS' : 'VIEW ARCHIVE'}
                </button>
              </>
            )}
          </div>

          {/* Detailed Archive List */}
          {showKompromatDetails && kompromatFiles.length > 0 && (
            <div className="mt-3 bg-[#1a1a1a] border border-[#DA291C] p-3 max-h-48 overflow-y-auto">
              <div className="space-y-2">
                {kompromatFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between py-1 border-b border-[#333333] last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm">{getFileIcon(file.file_name)}</span>
                      <div>
                        <div className="text-[#F5EEDC] font-['Roboto_Condensed'] text-xs uppercase blur-sm">
                          FILE: K-{file.id.slice(0, 6)}
                        </div>
                        <div className="text-[#888888] font-['Roboto_Condensed'] text-xs">
                          {new Date(file.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 text-xs font-['Stalinist_One'] uppercase ${
                      file.severity === 'major' 
                        ? 'bg-[#DA291C] text-[#FFFFFF]' 
                        : 'bg-[#FF8C00] text-[#000000]'
                    }`}>
                      {file.severity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="bg-[#DA291C] border border-[#000000] p-3 text-center">
          <div className="text-[#000000] font-['Stalinist_One'] text-xs uppercase mb-1">
            ⚠️ SECURITY NOTICE ⚠️
          </div>
          <div className="text-[#000000] font-['Roboto_Condensed'] text-xs">
            ALL ASSETS SECURED WITH MILITARY-GRADE ENCRYPTION
          </div>
        </div>
      </div>
    </div>
  )
}

export default VisibleStakesDisplay