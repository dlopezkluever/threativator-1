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

interface Contact {
  id: string
  name: string
  email: string
}

const RefereeStep: React.FC<Props> = ({ formData, updateFormData, onValidationChange }) => {
  const { user } = useAuth()
  const [witnessContacts, setWitnessContacts] = useState<Contact[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchWitnessContacts()
  }, [user])

  useEffect(() => {
    validateStep()
  }, [formData.refereeType, formData.witnessContactId])

  const fetchWitnessContacts = async () => {
    if (!user) return

    try {
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id, name, email')
        .eq('user_id', user.id)
        .contains('roles', ['witness'])

      if (contacts) {
        setWitnessContacts(contacts)
      }
    } catch (error) {
      console.error('Error fetching witness contacts:', error)
    }
  }

  const validateStep = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.refereeType) {
      newErrors.refereeType = 'Referee type selection is required'
    }

    if (formData.refereeType === 'human_witness' && !formData.witnessContactId) {
      newErrors.witnessContactId = 'Witness contact selection is required'
    }

    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    onValidationChange(isValid)
    return isValid
  }

  return (
    <div className="space-y-[var(--space-6)]">
      
      {/* Header */}
      <div className="text-center">
        <h3 className="text-[var(--font-size-xl)] font-[var(--font-family-display)] font-bold uppercase tracking-wide text-[var(--color-text-primary)] mb-[var(--space-2)]">
          REFEREE ASSIGNMENT
        </h3>
        <p className="text-[var(--color-text-primary)] text-[var(--font-size-base)] opacity-80">
          Choose who will grade your mission submissions
        </p>
      </div>

      {/* Referee Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>GRADING AUTHORITY</CardTitle>
        </CardHeader>
        <CardContent className="space-y-[var(--space-4)]">
          
          {/* AI Grader Option */}
          <label className="flex items-start gap-[var(--space-4)] border-[var(--border-width-medium)] border-[var(--color-accent-black)] p-[var(--space-4)] bg-white cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="refereeType"
              value="ai"
              checked={formData.refereeType === 'ai'}
              onChange={() => updateFormData({ refereeType: 'ai', witnessContactId: '' })}
              className="w-5 h-5 mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-2)]">
                <span className="text-[var(--font-size-lg)] font-[var(--font-family-display)] font-bold uppercase">
                  STATE AI GRADER
                </span>
                <span className="bg-[var(--color-primary-crimson)] text-[var(--color-background-beige)] px-[var(--space-2)] py-1 text-[var(--font-size-xs)] font-bold uppercase">
                  RECOMMENDED
                </span>
              </div>
              <p className="text-[var(--font-size-sm)] opacity-80 mb-[var(--space-2)]">
                Advanced AI analyzes your submission against the grading rubric with objective precision.
              </p>
              <ul className="text-[var(--font-size-sm)] opacity-70 space-y-1">
                <li>✓ Available 24/7 for instant grading</li>
                <li>✓ Objective analysis without bias</li>
                <li>✓ Can be contested by human witness if needed</li>
                <li>✓ Supports file analysis, text evaluation, and quantitative checks</li>
              </ul>
            </div>
          </label>

          {/* Human Witness Option */}
          <label className="flex items-start gap-[var(--space-4)] border-[var(--border-width-medium)] border-[var(--color-accent-black)] p-[var(--space-4)] bg-white cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="refereeType"
              value="human_witness"
              checked={formData.refereeType === 'human_witness'}
              onChange={() => updateFormData({ refereeType: 'human_witness' })}
              className="w-5 h-5 mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-2)]">
                <span className="text-[var(--font-size-lg)] font-[var(--font-family-display)] font-bold uppercase">
                  HUMAN WITNESS
                </span>
                <span className="bg-[var(--color-accent-black)] text-[var(--color-background-beige)] px-[var(--space-2)] py-1 text-[var(--font-size-xs)] font-bold uppercase">
                  PERSONAL
                </span>
              </div>
              <p className="text-[var(--font-size-sm)] opacity-80 mb-[var(--space-2)]">
                A trusted contact from your network evaluates submissions with human judgment.
              </p>
              <ul className="text-[var(--font-size-sm)] opacity-70 space-y-1">
                <li>✓ Personal accountability through trusted relationship</li>
                <li>✓ Understands context and nuance of your work</li>
                <li>✓ Final verdict cannot be contested</li>
                <li>⚠️ Requires contact availability and response</li>
              </ul>
            </div>
          </label>

          {errors.refereeType && (
            <p className="text-[var(--color-primary-crimson)] text-[var(--font-size-sm)] font-bold">
              ⚠️ {errors.refereeType}
            </p>
          )}

        </CardContent>
      </Card>

      {/* Witness Contact Selection (only if human witness selected) */}
      {formData.refereeType === 'human_witness' && (
        <Card>
          <CardHeader>
            <CardTitle>WITNESS SELECTION</CardTitle>
          </CardHeader>
          <CardContent className="space-y-[var(--space-4)]">
            
            {witnessContacts.length === 0 ? (
              <div className="border-[var(--border-width-medium)] border-[var(--color-accent-black)] bg-white p-[var(--space-4)] text-center">
                <p className="text-[var(--color-text-primary)] opacity-70 mb-[var(--space-2)]">
                  No witness contacts available. Add witnesses in your contact management.
                </p>
                <p className="text-[var(--color-primary-crimson)] text-[var(--font-size-sm)] font-bold">
                  ⚠️ At least one witness contact is required for human grading
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-[var(--font-size-base)] font-[var(--font-family-display)] font-bold uppercase tracking-wide mb-[var(--space-2)]">
                    DESIGNATED WITNESS *
                  </label>
                  <select
                    value={formData.witnessContactId}
                    onChange={(e) => updateFormData({ witnessContactId: e.target.value })}
                    className="w-full border-[var(--border-width-thick)] border-[var(--color-accent-black)] bg-[var(--color-background-beige)] p-[var(--space-3)] text-[var(--color-text-primary)] font-[var(--font-family-body)] text-[var(--font-size-base)]"
                    style={{ borderRadius: '0px' }}
                  >
                    <option value="">Select a witness...</option>
                    {witnessContacts.map(contact => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} ({contact.email})
                      </option>
                    ))}
                  </select>
                  {errors.witnessContactId && (
                    <p className="mt-1 text-[var(--color-primary-crimson)] text-[var(--font-size-sm)] font-bold">
                      ⚠️ {errors.witnessContactId}
                    </p>
                  )}
                </div>

                <div className="bg-[var(--color-background-beige)] border-[var(--border-width-medium)] border-[var(--color-accent-black)] p-[var(--space-3)]">
                  <p className="text-[var(--font-size-sm)] font-bold uppercase mb-2">
                    ⚠️ WITNESS NOTIFICATION PROTOCOL:
                  </p>
                  <ul className="text-[var(--font-size-sm)] opacity-80 space-y-1">
                    <li>• Selected witness will receive email when you submit proof</li>
                    <li>• They must respond within 48 hours with Pass/Fail verdict</li>
                    <li>• Their decision is final and cannot be contested</li>
                    <li>• Non-response defaults to PASS after 48 hours</li>
                  </ul>
                </div>
              </>
            )}

          </CardContent>
        </Card>
      )}

    </div>
  )
}

export default RefereeStep