import React, { useState, useEffect } from 'react'
import { GoalFormData } from '../GoalCreation'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { useAuth } from '../../../contexts/AuthContext'
import { supabase } from '../../../lib/supabase'

interface Props {
  formData: GoalFormData
  updateFormData: (updates: Partial<GoalFormData>) => void
  onValidationChange: (isValid: boolean) => void
}

const charityOptions = {
  'doctors_without_borders': 'Doctors Without Borders',
  'red_cross': 'Red Cross International',
  'unicef': 'UNICEF'
}

const StakesStep: React.FC<Props> = ({ formData, updateFormData, onValidationChange }) => {
  const { user } = useAuth()
  const [holdingCellBalance, setHoldingCellBalance] = useState(0)
  const [kompromatItems, setKompromatItems] = useState<{ id: string, filename: string, severity: 'minor' | 'major' }[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchUserData()
  }, [user])

  useEffect(() => {
    validateStep()
  }, [formData.monetaryStake, formData.charityDestination, formData.majorKompromatId])

  const fetchUserData = async () => {
    if (!user) return

    try {
      // Get holding cell balance from auth.users.raw_user_meta_data
      const balance = user.user_metadata?.holding_cell_balance || 0
      setHoldingCellBalance(balance)

      // Get kompromat items
      const { data: kompromat } = await supabase
        .from('kompromat')
        .select('id, original_filename, severity')
        .eq('user_id', user.id)

      if (kompromat) {
        setKompromatItems(kompromat.map(item => ({
          id: item.id,
          filename: item.original_filename,
          severity: item.severity
        })))
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const validateStep = () => {
    const newErrors: Record<string, string> = {}
    
    // Monetary stakes are now optional - only validate if amount is provided
    if (formData.monetaryStake && formData.monetaryStake > 0) {
      if (formData.monetaryStake > holdingCellBalance) {
        newErrors.monetaryStake = 'Stake exceeds available balance'
      }
      // Require charity destination only if monetary stake is provided
      if (!formData.charityDestination) {
        newErrors.charityDestination = 'Charity destination required when using monetary stakes'
      }
    }

    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    onValidationChange(isValid)
    return isValid
  }

  const minorKompromat = kompromatItems.filter(item => item.severity === 'minor')
  const majorKompromat = kompromatItems.filter(item => item.severity === 'major')

  return (
    <div className="space-y-[var(--space-6)]">
      
      {/* Header */}
      <div className="text-center">
        <h3 className="text-[var(--font-size-xl)] font-[var(--font-family-display)] font-bold uppercase tracking-wide text-[var(--color-text-primary)] mb-[var(--space-2)]">
          COMMITMENT STAKES
        </h3>
        <p className="text-[var(--color-text-primary)] text-[var(--font-size-base)] opacity-80">
          Define financial and humiliation consequences for failure (monetary stakes optional)
        </p>
      </div>

      {/* Monetary Stakes */}
      <Card>
        <CardHeader>
          <CardTitle>FINANCIAL COLLATERAL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-[var(--space-4)]">
          
          {/* Balance Display */}
          <div className="bg-[var(--color-background-beige)] border-[var(--border-width-medium)] border-[var(--color-accent-black)] p-[var(--space-3)]">
            <div className="flex justify-between items-center">
              <span className="text-[var(--font-size-base)] font-bold uppercase">
                AVAILABLE BALANCE:
              </span>
              <span className="text-[var(--color-success-muted)] font-[var(--font-family-display)] text-[var(--font-size-xl)] font-bold">
                ${holdingCellBalance.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Stake Input */}
          <div>
            <label className="block text-[var(--font-size-base)] font-[var(--font-family-display)] font-bold uppercase tracking-wide mb-[var(--space-2)]">
              MONETARY STAKE (OPTIONAL)
            </label>
            <div className="flex items-center gap-[var(--space-2)]">
              <span className="text-[var(--font-size-xl)] font-bold">$</span>
              <input
                type="number"
                value={formData.monetaryStake || ''}
                onChange={(e) => updateFormData({ monetaryStake: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                min="0.01"
                max={holdingCellBalance}
                step="0.01"
                className="flex-1 border-[var(--border-width-thick)] border-[var(--color-accent-black)] bg-[var(--color-background-beige)] p-[var(--space-3)] text-[var(--color-text-primary)] font-[var(--font-family-body)] text-[var(--font-size-base)]"
                style={{ borderRadius: '0px' }}
              />
            </div>
            {errors.monetaryStake && (
              <p className="mt-1 text-[var(--color-primary-crimson)] text-[var(--font-size-sm)] font-bold">
                ⚠️ {errors.monetaryStake}
              </p>
            )}
          </div>

          {/* Charity Selection */}
          <div>
            <label className="block text-[var(--font-size-base)] font-[var(--font-family-display)] font-bold uppercase tracking-wide mb-[var(--space-2)]">
              FORFEITURE DESTINATION {formData.monetaryStake > 0 ? '*' : '(OPTIONAL)'}
            </label>
            <select
              value={formData.charityDestination}
              onChange={(e) => updateFormData({ charityDestination: e.target.value as any })}
              className="w-full border-[var(--border-width-thick)] border-[var(--color-accent-black)] bg-[var(--color-background-beige)] p-[var(--space-3)] text-[var(--color-text-primary)] font-[var(--font-family-body)] text-[var(--font-size-base)]"
              style={{ borderRadius: '0px' }}
            >
              {Object.entries(charityOptions).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.charityDestination && (
              <p className="mt-1 text-[var(--color-primary-crimson)] text-[var(--font-size-sm)] font-bold">
                ⚠️ {errors.charityDestination}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Kompromat Assignment */}
      <Card>
        <CardHeader>
          <CardTitle>COMPROMISING MATERIAL ASSIGNMENT</CardTitle>
        </CardHeader>
        <CardContent className="space-y-[var(--space-4)]">
          
          {/* Minor Kompromat for Checkpoints */}
          <div>
            <label className="block text-[var(--font-size-base)] font-[var(--font-family-display)] font-bold uppercase tracking-wide mb-[var(--space-2)]">
              CHECKPOINT CONSEQUENCES (MINOR)
            </label>
            <div className="space-y-[var(--space-2)]">
              {minorKompromat.length === 0 ? (
                <div className="border-[var(--border-width-medium)] border-[var(--color-accent-black)] bg-white p-[var(--space-4)] text-center">
                  <p className="text-[var(--color-text-primary)] opacity-70">
                    No minor kompromat available. Upload some in the onboarding wizard.
                  </p>
                </div>
              ) : (
                minorKompromat.map(item => (
                  <label key={item.id} className="flex items-center gap-[var(--space-3)] border border-[var(--color-accent-black)] p-[var(--space-3)] bg-white cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.minorKompromatIds.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFormData({ 
                            minorKompromatIds: [...formData.minorKompromatIds, item.id]
                          })
                        } else {
                          updateFormData({ 
                            minorKompromatIds: formData.minorKompromatIds.filter(id => id !== item.id)
                          })
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-[var(--font-size-base)] font-bold">
                      {item.filename}
                    </span>
                    <span className="text-[var(--color-primary-crimson)] text-[var(--font-size-xs)] font-bold uppercase">
                      MINOR
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Major Kompromat for Final Deadline */}
          <div>
            <label className="block text-[var(--font-size-base)] font-[var(--font-family-display)] font-bold uppercase tracking-wide mb-[var(--space-2)]">
              FINAL DEADLINE CONSEQUENCES (MAJOR)
            </label>
            <div className="space-y-[var(--space-2)]">
              {majorKompromat.length === 0 ? (
                <div className="border-[var(--border-width-medium)] border-[var(--color-accent-black)] bg-white p-[var(--space-4)] text-center">
                  <p className="text-[var(--color-text-primary)] opacity-70">
                    No major kompromat available. Upload some in the onboarding wizard.
                  </p>
                </div>
              ) : (
                majorKompromat.map(item => (
                  <label key={item.id} className="flex items-center gap-[var(--space-3)] border border-[var(--color-accent-black)] p-[var(--space-3)] bg-white cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="majorKompromat"
                      checked={formData.majorKompromatId === item.id}
                      onChange={() => updateFormData({ majorKompromatId: item.id })}
                      className="w-4 h-4"
                    />
                    <span className="text-[var(--font-size-base)] font-bold">
                      {item.filename}
                    </span>
                    <span className="text-[var(--color-primary-crimson)] text-[var(--font-size-xs)] font-bold uppercase">
                      MAJOR
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

        </CardContent>
      </Card>

    </div>
  )
}

export default StakesStep