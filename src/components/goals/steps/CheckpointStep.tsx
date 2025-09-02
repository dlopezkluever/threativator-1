import React, { useState } from 'react'
import { GoalFormData, CheckpointData } from '../GoalCreation'
import { Button } from '../../ui/button'
import { Card, CardContent } from '../../ui/card'
import { useToast } from '../../../contexts/ToastContext'

interface Props {
  formData: GoalFormData
  updateFormData: (updates: Partial<GoalFormData>) => void
  onValidationChange: (isValid: boolean) => void
}

const CheckpointStep: React.FC<Props> = ({ formData, updateFormData, onValidationChange }) => {
  const { showToast } = useToast()
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<CheckpointData[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Always validate as true since checkpoints are optional
  React.useEffect(() => {
    onValidationChange(true)
  }, [formData.checkpoints, onValidationChange])

  const addCheckpoint = () => {
    const newCheckpoint: CheckpointData = {
      title: '',
      deadline: new Date(),
      requirements: ''
    }
    updateFormData({ 
      checkpoints: [...formData.checkpoints, newCheckpoint]
    })
  }

  const updateCheckpoint = (index: number, updates: Partial<CheckpointData>) => {
    const updatedCheckpoints = formData.checkpoints.map((checkpoint, i) => 
      i === index ? { ...checkpoint, ...updates } : checkpoint
    )
    updateFormData({ checkpoints: updatedCheckpoints })
  }

  const removeCheckpoint = (index: number) => {
    const updatedCheckpoints = formData.checkpoints.filter((_, i) => i !== index)
    updateFormData({ checkpoints: updatedCheckpoints })
  }

  const generateAISuggestions = async () => {
    if (!formData.title || !formData.description || !formData.finalDeadline) {
      showToast({ title: 'INCOMPLETE INTEL: Complete mission details first', type: 'error' })
      return
    }

    setIsGeneratingAI(true)
    
    try {
      // This would call a Supabase Edge Function in a real implementation
      // For now, generate some mock suggestions based on the goal
      const mockSuggestions: CheckpointData[] = [
        {
          title: 'Initial Planning Phase',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          requirements: 'Complete initial research and create detailed project plan'
        },
        {
          title: 'Midpoint Review',
          deadline: new Date((Date.now() + formData.finalDeadline.getTime()) / 2), // Midpoint
          requirements: 'Submit progress report showing 50% completion'
        },
        {
          title: 'Final Preparation',
          deadline: new Date(formData.finalDeadline.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days before final
          requirements: 'Complete all work and prepare final submission'
        }
      ]

      setAiSuggestions(mockSuggestions)
      setShowSuggestions(true)
      showToast({ title: 'AI SUGGESTIONS GENERATED', type: 'success' })
    } catch (error) {
      showToast({ title: 'AI GENERATION FAILED', type: 'error' })
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const addSelectedSuggestions = (selectedIndexes: number[]) => {
    const selectedSuggestions = selectedIndexes.map(i => aiSuggestions[i])
    updateFormData({ 
      checkpoints: [...formData.checkpoints, ...selectedSuggestions]
    })
    setShowSuggestions(false)
    showToast({ title: 'CHECKPOINTS ADDED', type: 'success' })
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const getFinalDeadlineDate = () => {
    if (!formData.finalDeadline) return ''
    const deadline = new Date(formData.finalDeadline)
    deadline.setHours(deadline.getHours() - 1) // 1 hour before final deadline
    return deadline.toISOString().slice(0, 16)
  }

  return (
    <div className="space-y-[var(--space-6)]">
      
      {/* Header */}
      <div className="text-center">
        <h3 className="text-[var(--font-size-xl)] font-[var(--font-family-display)] font-bold uppercase tracking-wide text-[var(--color-text-primary)] mb-[var(--space-2)]">
          INTERMEDIATE CHECKPOINTS
        </h3>
        <p className="text-[var(--color-text-primary)] text-[var(--font-size-base)] opacity-80">
          Optional milestones to track progress and maintain discipline
        </p>
      </div>

      {/* AI Generation */}
      <Card>
        <CardContent className="p-[var(--space-4)]">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-[var(--font-size-base)] font-[var(--font-family-display)] font-bold uppercase mb-1">
                AI CHECKPOINT GENERATOR
              </h4>
              <p className="text-[var(--font-size-sm)] opacity-70">
                Let the State AI analyze your mission and suggest optimal checkpoints
              </p>
            </div>
            <Button
              onClick={generateAISuggestions}
              disabled={isGeneratingAI || !formData.title || !formData.description}
              className="text-[var(--font-size-sm)] font-bold uppercase"
              variant="command"
            >
              {isGeneratingAI ? 'ANALYZING...' : 'GENERATE ⚡'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions Modal */}
      {showSuggestions && (
        <Card className="border-[var(--color-primary-crimson)]">
          <CardContent className="p-[var(--space-4)]">
            <h4 className="text-[var(--font-size-base)] font-[var(--font-family-display)] font-bold uppercase mb-[var(--space-4)]">
              STATE AI RECOMMENDATIONS
            </h4>
            <div className="space-y-[var(--space-3)]">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="border border-[var(--color-accent-black)] p-[var(--space-3)] bg-white">
                  <div className="flex items-start gap-[var(--space-3)]">
                    <input
                      type="checkbox"
                      id={`suggestion-${index}`}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h5 className="font-bold text-[var(--font-size-base)]">{suggestion.title}</h5>
                      <p className="text-[var(--font-size-sm)] opacity-80">{suggestion.requirements}</p>
                      <p className="text-[var(--font-size-xs)] text-[var(--color-primary-crimson)] font-bold mt-1">
                        DUE: {suggestion.deadline.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-[var(--space-2)] mt-[var(--space-4)]">
              <Button
                variant="ghost"
                onClick={() => setShowSuggestions(false)}
                className="text-[var(--font-size-sm)] font-bold uppercase"
              >
                CANCEL
              </Button>
              <Button
                variant="success"
                onClick={() => {
                  const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked')
                  const selectedIndexes = Array.from(checkboxes).map((checkbox) => 
                    parseInt((checkbox as HTMLInputElement).id.replace('suggestion-', ''))
                  )
                  addSelectedSuggestions(selectedIndexes)
                }}
                className="text-[var(--font-size-sm)] font-bold uppercase"
              >
                ADD SELECTED
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Checkpoints */}
      <div className="space-y-[var(--space-4)]">
        {formData.checkpoints.map((checkpoint, index) => (
          <Card key={index}>
            <CardContent className="p-[var(--space-4)]">
              <div className="flex items-start justify-between mb-[var(--space-3)]">
                <h4 className="text-[var(--font-size-base)] font-[var(--font-family-display)] font-bold uppercase">
                  CHECKPOINT {index + 1}
                </h4>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeCheckpoint(index)}
                  className="text-[var(--font-size-xs)] font-bold uppercase"
                >
                  REMOVE
                </Button>
              </div>

              <div className="space-y-[var(--space-3)]">
                <div>
                  <label className="block text-[var(--font-size-sm)] font-bold uppercase mb-1">
                    CHECKPOINT TITLE *
                  </label>
                  <input
                    type="text"
                    value={checkpoint.title}
                    onChange={(e) => updateCheckpoint(index, { title: e.target.value })}
                    placeholder="Enter checkpoint title..."
                    className="w-full border-[var(--border-width-medium)] border-[var(--color-accent-black)] bg-[var(--color-background-beige)] p-[var(--space-2)] text-[var(--color-text-primary)] font-[var(--font-family-body)] text-[var(--font-size-sm)]"
                    style={{ borderRadius: '0px' }}
                  />
                </div>

                <div>
                  <label className="block text-[var(--font-size-sm)] font-bold uppercase mb-1">
                    DEADLINE *
                  </label>
                  <input
                    type="datetime-local"
                    value={checkpoint.deadline instanceof Date ? checkpoint.deadline.toISOString().slice(0, 16) : ''}
                    onChange={(e) => updateCheckpoint(index, { deadline: new Date(e.target.value) })}
                    min={getTomorrowDate() + 'T00:00'}
                    max={getFinalDeadlineDate()}
                    className="w-full border-[var(--border-width-medium)] border-[var(--color-accent-black)] bg-[var(--color-background-beige)] p-[var(--space-2)] text-[var(--color-text-primary)] font-[var(--font-family-body)] text-[var(--font-size-sm)]"
                    style={{ borderRadius: '0px' }}
                  />
                </div>

                <div>
                  <label className="block text-[var(--font-size-sm)] font-bold uppercase mb-1">
                    REQUIREMENTS *
                  </label>
                  <textarea
                    value={checkpoint.requirements}
                    onChange={(e) => updateCheckpoint(index, { requirements: e.target.value })}
                    placeholder="Describe what must be completed for this checkpoint..."
                    rows={2}
                    className="w-full border-[var(--border-width-medium)] border-[var(--color-accent-black)] bg-[var(--color-background-beige)] p-[var(--space-2)] text-[var(--color-text-primary)] font-[var(--font-family-body)] text-[var(--font-size-sm)] resize-none"
                    style={{ borderRadius: '0px' }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Checkpoint Button */}
      <div className="text-center">
        <Button
          onClick={addCheckpoint}
          variant="action"
          className="text-[var(--font-size-base)] font-bold uppercase"
        >
          + ADD CHECKPOINT
        </Button>
      </div>

      {/* No Checkpoints Message */}
      {formData.checkpoints.length === 0 && (
        <Card>
          <CardContent className="text-center py-[var(--space-8)]">
            <div className="mb-[var(--space-4)]">
              <svg className="w-16 h-16 mx-auto fill-[var(--color-text-primary)] opacity-30" viewBox="0 0 24 24">
                <path d="M19,3H5C3.89,3 3,3.89 3,5V19A3,3 0 0,0 6,22H18A3,3 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V10.5H5V5H19M19,12.5V19A1,1 0 0,1 18,20H6A1,1 0 0,1 5,19V12.5H19M17,7H7V9H17V7Z"/>
              </svg>
            </div>
            <h4 className="text-[var(--font-size-lg)] font-[var(--font-family-display)] font-bold uppercase mb-[var(--space-2)]">
              NO CHECKPOINTS DEFINED
            </h4>
            <p className="text-[var(--font-size-base)] opacity-70 mb-[var(--space-4)]">
              Checkpoints are optional but recommended for long-term missions
            </p>
            <div className="flex gap-[var(--space-3)] justify-center">
              <Button
                onClick={addCheckpoint}
                variant="action"
                className="text-[var(--font-size-sm)] font-bold uppercase"
              >
                ADD CHECKPOINT
              </Button>
              <Button
                onClick={generateAISuggestions}
                variant="command"
                disabled={!formData.title || !formData.description}
                className="text-[var(--font-size-sm)] font-bold uppercase"
              >
                AI SUGGESTIONS
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}

export default CheckpointStep