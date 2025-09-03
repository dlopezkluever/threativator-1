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


  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-3 bg-[var(--color-primary-red)] w-3/4"></div>
        <div className="h-4 bg-[var(--color-text-secondary)] w-full"></div>
        <div className="h-3 bg-[var(--color-primary-red)] w-1/2"></div>
        <div className="h-4 bg-[var(--color-text-secondary)] w-full"></div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-[var(--space-3)] text-[var(--color-text-light)]">
        {/* Financial Stakes - Compact */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[var(--color-text-light)] font-[var(--font-family-body)] text-[10px] uppercase">
              HOLDING CELL:
            </span>
            <span className="text-[var(--color-success-muted)] font-[var(--font-family-display)] text-[var(--font-size-xs)]">
              {formatCurrency(profile?.holding_cell_balance || 0)}
            </span>
          </div>
          
          {(!profile || profile.holding_cell_balance === 0) && (
            <button
              onClick={() => console.log('Opening financial collateral setup...')}
              className="w-full mt-1 bg-[var(--color-primary-red)] text-[var(--color-text-light)] py-1 px-2 font-[var(--font-family-body)] text-[9px] uppercase hover:bg-[var(--color-container-light)] hover:text-[var(--color-primary-red)] transition-colors border border-[var(--color-accent-black)]"
            >
              + ESTABLISH COLLATERAL
            </button>
          )}
        </div>

        {/* Kompromat Archive - Compact */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[var(--color-text-light)] font-[var(--font-family-body)] text-[10px] uppercase">
              ARCHIVE:
            </span>
            <span className="text-[var(--color-primary-red)] font-[var(--font-family-display)] text-[var(--font-size-xs)]">
              {kompromatFiles.length} FILES
            </span>
          </div>
          
          {kompromatFiles.length === 0 ? (
            <button
              onClick={() => console.log('Opening kompromat upload...')}
              className="w-full mt-1 bg-[var(--color-text-secondary)] text-[var(--color-text-light)] py-1 px-2 font-[var(--font-family-body)] text-[9px] uppercase hover:bg-[var(--color-primary-red)] transition-colors border border-[var(--color-primary-red)]"
            >
              + UPLOAD KOMPROMAT
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-1 text-center text-[9px]">
              <div>
                <div className="text-[var(--color-success-muted)] font-[var(--font-family-display)]">
                  {kompromatFiles.filter(f => f.severity === 'minor').length}
                </div>
                <div className="text-[var(--color-text-light)] opacity-70">MINOR</div>
              </div>
              <div>
                <div className="text-[var(--color-primary-red)] font-[var(--font-family-display)]">
                  {kompromatFiles.filter(f => f.severity === 'major').length}
                </div>
                <div className="text-[var(--color-text-light)] opacity-70">MAJOR</div>
              </div>
            </div>
          )}
        </div>

        {/* Security Notice - Compact */}
        <div className="mt-auto pt-[var(--space-2)] border-t border-[var(--color-primary-red)]">
          <p className="text-[var(--color-primary-red)] text-[9px] uppercase text-center font-[var(--font-family-body)]">
            🔐 MILITARY-GRADE ENCRYPTION
          </p>
        </div>
      </div>
    </>
  )
}

export default VisibleStakesDisplay