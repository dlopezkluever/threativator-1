import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Goal } from '../../contexts/GoalContext'

interface Props {
  goal: Goal | null
  isOpen: boolean
  onClose: () => void
  onSubmitProof?: (goalId: string, checkpointId?: string) => void
}

const GoalDetailModal: React.FC<Props> = ({ goal, isOpen, onClose, onSubmitProof }) => {
  if (!isOpen || !goal) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-[var(--color-success-muted)]'
      case 'failed':
        return 'text-[var(--color-primary-crimson)]'
      case 'active':
        return 'text-[var(--color-text-primary)]'
      default:
        return 'text-[var(--color-text-primary)]'
    }
  }

  const getCharityName = (charity: string) => {
    const charityNames = {
      'doctors_without_borders': 'Doctors Without Borders',
      'red_cross': 'Red Cross International',
      'unicef': 'UNICEF'
    }
    return charityNames[charity as keyof typeof charityNames] || charity
  }

  const getTimeRemaining = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const diffInMs = deadlineDate.getTime() - now.getTime()
    
    if (diffInMs <= 0) return 'OVERDUE'
    
    const diffInHours = Math.ceil(diffInMs / (1000 * 60 * 60))
    if (diffInHours < 24) return `${diffInHours}H REMAINING`
    if (diffInHours < 48) return '1 DAY REMAINING'
    
    const days = Math.ceil(diffInHours / 24)
    return `${days} DAYS REMAINING`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-[var(--space-4)]">
      <div className="bg-[var(--color-background-beige)] border-[var(--border-width-thick)] border-[var(--color-accent-black)] max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-[var(--color-primary-crimson)] p-[var(--space-6)] border-b-[var(--border-width-thick)] border-[var(--color-accent-black)]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-[var(--color-background-beige)] font-[var(--font-family-display)] text-[var(--font-size-2xl)] font-bold uppercase mb-2">
                MISSION DOSSIER
              </h2>
              <p className="text-[var(--color-background-beige)] font-[var(--font-family-body)] text-[var(--font-size-sm)] opacity-90">
                CLASSIFIED OPERATIONAL DETAILS
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[var(--color-background-beige)] hover:text-[var(--color-accent-black)] text-[var(--font-size-2xl)] font-bold leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-[var(--space-6)] space-y-[var(--space-6)]">
          
          {/* Mission Overview */}
          <Card>
            <CardHeader>
              <CardTitle>MISSION OVERVIEW</CardTitle>
            </CardHeader>
            <CardContent className="space-y-[var(--space-4)]">
              <div>
                <h3 className="text-[var(--font-size-lg)] font-[var(--font-family-display)] font-bold uppercase text-[var(--color-primary-crimson)] mb-2">
                  {goal.title}
                </h3>
                <p className="text-[var(--font-size-base)] text-[var(--color-text-primary)] mb-[var(--space-3)]">
                  {goal.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-[var(--space-4)]">
                <div>
                  <span className="block text-[var(--font-size-sm)] font-[var(--font-family-display)] font-bold uppercase mb-1">
                    STATUS:
                  </span>
                  <span className={`text-[var(--font-size-base)] font-bold uppercase ${getStatusColor(goal.status)}`}>
                    {goal.status}
                  </span>
                </div>
                
                <div>
                  <span className="block text-[var(--font-size-sm)] font-[var(--font-family-display)] font-bold uppercase mb-1">
                    REFEREE TYPE:
                  </span>
                  <span className="text-[var(--font-size-base)] font-bold uppercase">
                    {goal.referee_type === 'ai' ? 'STATE AI GRADER' : 'HUMAN WITNESS'}
                  </span>
                </div>
              </div>

              <div>
                <span className="block text-[var(--font-size-sm)] font-[var(--font-family-display)] font-bold uppercase mb-1">
                  FINAL DEADLINE:
                </span>
                <div className="flex items-center gap-[var(--space-4)]">
                  <span className="text-[var(--font-size-base)] font-bold">
                    {formatDate(goal.final_deadline)}
                  </span>
                  <span className="bg-[var(--color-primary-crimson)] text-[var(--color-background-beige)] px-[var(--space-2)] py-1 text-[var(--font-size-xs)] font-bold uppercase">
                    {getTimeRemaining(goal.final_deadline)}
                  </span>
                </div>
              </div>

              <div>
                <span className="block text-[var(--font-size-sm)] font-[var(--font-family-display)] font-bold uppercase mb-2">
                  SUCCESS CRITERIA:
                </span>
                <div className="bg-white border border-[var(--color-accent-black)] p-[var(--space-3)] text-[var(--font-size-sm)]">
                  {goal.grading_rubric}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stakes & Consequences */}
          <Card>
            <CardHeader>
              <CardTitle>CONSEQUENCES OF FAILURE</CardTitle>
            </CardHeader>
            <CardContent className="space-y-[var(--space-4)]">
              
              {/* Financial Stakes */}
              <div className="bg-[var(--color-primary-crimson)] text-[var(--color-background-beige)] p-[var(--space-4)] border border-[var(--color-accent-black)]">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--font-size-base)] font-bold uppercase">
                    FINANCIAL PENALTY:
                  </span>
                  <span className="text-[var(--font-size-2xl)] font-[var(--font-family-display)] font-bold">
                    ${goal.monetary_stake.toFixed(2)}
                  </span>
                </div>
                <p className="text-[var(--font-size-sm)] mt-2 opacity-90">
                  FORFEITED TO: {getCharityName(goal.charity_destination)}
                </p>
              </div>

              {/* Kompromat */}
              {(goal.minor_kompromat_id || goal.major_kompromat_id) && (
                <div>
                  <h4 className="text-[var(--font-size-base)] font-[var(--font-family-display)] font-bold uppercase mb-3">
                    COMPROMISING MATERIAL RELEASE:
                  </h4>
                  <div className="space-y-2">
                    {goal.minor_kompromat_id && (
                      <p className="text-[var(--font-size-sm)]">
                        <span className="font-bold">CHECKPOINT FAILURES:</span> Minor kompromat will be released upon checkpoint failure
                      </p>
                    )}
                    {goal.major_kompromat_id && (
                      <p className="text-[var(--font-size-sm)]">
                        <span className="font-bold">FINAL DEADLINE FAILURE:</span> Major kompromat will be released upon mission failure
                      </p>
                    )}
                  </div>
                </div>
              )}
              
            </CardContent>
          </Card>

          {/* Checkpoints */}
          {goal.checkpoints && goal.checkpoints.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>MISSION CHECKPOINTS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-[var(--space-3)]">
                {goal.checkpoints
                  .sort((a, b) => a.order_position - b.order_position)
                  .map((checkpoint, index) => (
                    <div key={checkpoint.id} className="border border-[var(--color-accent-black)] p-[var(--space-3)] bg-white">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-[var(--font-size-base)] font-[var(--font-family-display)] font-bold uppercase mb-1">
                            {index + 1}. {checkpoint.title}
                          </h4>
                          <p className="text-[var(--font-size-sm)] opacity-80 mb-2">
                            {checkpoint.requirements || checkpoint.description}
                          </p>
                          <div className="flex items-center gap-[var(--space-4)]">
                            <span className="text-[var(--font-size-sm)] font-bold">
                              DUE: {formatDate(checkpoint.deadline)}
                            </span>
                            <span className={`text-[var(--font-size-sm)] font-bold uppercase ${getStatusColor(checkpoint.status)}`}>
                              {checkpoint.status}
                            </span>
                          </div>
                        </div>
                        
                        {checkpoint.status === 'pending' && onSubmitProof && (
                          <Button
                            onClick={() => onSubmitProof(goal.id, checkpoint.id)}
                            variant="action"
                            size="sm"
                            className="text-[var(--font-size-xs)] font-bold uppercase"
                          >
                            SUBMIT PROOF
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-[var(--color-background-beige)] border-t-[var(--border-width-thick)] border-[var(--color-accent-black)] p-[var(--space-6)]">
          <div className="flex gap-[var(--space-4)] justify-end">
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-[var(--font-size-sm)] font-bold uppercase"
            >
              CLOSE DOSSIER
            </Button>

            {goal.status === 'active' && onSubmitProof && (
              <Button
                onClick={() => onSubmitProof(goal.id)}
                variant="danger"
                className="text-[var(--font-size-sm)] font-bold uppercase"
              >
                SUBMIT FINAL PROOF
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default GoalDetailModal