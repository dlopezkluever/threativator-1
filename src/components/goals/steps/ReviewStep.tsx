import React from 'react'
import { GoalFormData } from '../GoalCreation'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'

interface Props {
  formData: GoalFormData
  onEditStep: (step: number) => void
  onSubmit: () => void
  isSubmitting: boolean
}

const ReviewStep: React.FC<Props> = ({ formData, onEditStep, onSubmit, isSubmitting }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const charityNames = {
    'doctors_without_borders': 'Doctors Without Borders',
    'red_cross': 'Red Cross International',
    'unicef': 'UNICEF'
  }

  return (
    <div className="space-y-[var(--space-6)]">
      
      {/* Header */}
      <div className="text-center">
        <h3 className="text-[var(--font-size-xl)] font-[var(--font-family-display)] font-bold uppercase tracking-wide text-[var(--color-text-primary)] mb-[var(--space-2)]">
          MISSION AUTHORIZATION
        </h3>
        <p className="text-[var(--color-text-primary)] text-[var(--font-size-base)] opacity-80">
          Review all mission parameters before final activation
        </p>
      </div>

      {/* Mission Details */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>MISSION DETAILS</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onEditStep(1)}
            className="text-[var(--font-size-xs)] font-bold uppercase"
          >
            EDIT
          </Button>
        </CardHeader>
        <CardContent className="space-y-[var(--space-3)]">
          <div>
            <h4 className="text-[var(--font-size-base)] font-[var(--font-family-display)] font-bold uppercase mb-1">
              TITLE:
            </h4>
            <p className="text-[var(--font-size-base)]">{formData.title}</p>
          </div>
          
          <div>
            <h4 className="text-[var(--font-size-base)] font-[var(--font-family-display)] font-bold uppercase mb-1">
              DESCRIPTION:
            </h4>
            <p className="text-[var(--font-size-base)]">{formData.description}</p>
          </div>
          
          <div>
            <h4 className="text-[var(--font-size-base)] font-[var(--font-family-display)] font-bold uppercase mb-1">
              FINAL DEADLINE:
            </h4>
            <p className="text-[var(--color-primary-crimson)] font-bold">
              {formatDate(formData.finalDeadline)}
            </p>
          </div>
          
          <div>
            <h4 className="text-[var(--font-size-base)] font-[var(--font-family-display)] font-bold uppercase mb-1">
              SUCCESS CRITERIA:
            </h4>
            <p className="text-[var(--font-size-sm)] bg-[var(--color-background-beige)] border border-[var(--color-accent-black)] p-[var(--space-2)]">
              {formData.gradingRubric}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Checkpoints */}
      {formData.checkpoints.length > 0 && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>CHECKPOINTS ({formData.checkpoints.length})</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onEditStep(2)}
              className="text-[var(--font-size-xs)] font-bold uppercase"
            >
              EDIT
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-[var(--space-3)]">
              {formData.checkpoints.map((checkpoint, index) => (
                <div key={index} className="border border-[var(--color-accent-black)] p-[var(--space-3)] bg-white">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-[var(--font-size-base)] font-bold">
                      {index + 1}. {checkpoint.title}
                    </h4>
                    <span className="text-[var(--color-primary-crimson)] text-[var(--font-size-sm)] font-bold">
                      {formatDate(checkpoint.deadline).split(' at ')[0]}
                    </span>
                  </div>
                  <p className="text-[var(--font-size-sm)] opacity-80">
                    {checkpoint.requirements}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stakes & Consequences */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>STAKES & CONSEQUENCES</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onEditStep(3)}
            className="text-[var(--font-size-xs)] font-bold uppercase"
          >
            EDIT
          </Button>
        </CardHeader>
        <CardContent className="space-y-[var(--space-4)]">
          
          {/* Monetary Stake */}
          <div className="bg-[var(--color-primary-crimson)] text-[var(--color-background-beige)] p-[var(--space-4)] border-[var(--border-width-thick)] border-[var(--color-accent-black)]">
            <div className="flex items-center justify-between">
              <span className="text-[var(--font-size-base)] font-bold uppercase">
                MONETARY COMMITMENT:
              </span>
              <span className="text-[var(--font-size-2xl)] font-[var(--font-family-display)] font-bold">
                ${formData.monetaryStake.toFixed(2)}
              </span>
            </div>
            <p className="text-[var(--font-size-sm)] mt-2 opacity-90">
              FORFEITED TO: {charityNames[formData.charityDestination]}
            </p>
          </div>

          {/* Kompromat */}
          {(formData.minorKompromatIds.length > 0 || formData.majorKompromatId) && (
            <div>
              <h4 className="text-[var(--font-size-base)] font-[var(--font-family-display)] font-bold uppercase mb-2">
                COMPROMISING MATERIAL:
              </h4>
              <div className="space-y-2">
                {formData.minorKompromatIds.length > 0 && (
                  <p className="text-[var(--font-size-sm)]">
                    <span className="font-bold">CHECKPOINT FAILURES:</span> {formData.minorKompromatIds.length} minor items assigned
                  </p>
                )}
                {formData.majorKompromatId && (
                  <p className="text-[var(--font-size-sm)]">
                    <span className="font-bold">FINAL DEADLINE FAILURE:</span> 1 major item assigned
                  </p>
                )}
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Referee Assignment */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>GRADING AUTHORITY</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onEditStep(4)}
            className="text-[var(--font-size-xs)] font-bold uppercase"
          >
            EDIT
          </Button>
        </CardHeader>
        <CardContent>
          <div className="bg-[var(--color-background-beige)] border border-[var(--color-accent-black)] p-[var(--space-3)]">
            <h4 className="text-[var(--font-size-base)] font-bold uppercase mb-2">
              {formData.refereeType === 'ai' ? 'STATE AI GRADER' : 'HUMAN WITNESS'}
            </h4>
            {formData.refereeType === 'ai' ? (
              <p className="text-[var(--font-size-sm)] opacity-80">
                Advanced AI will analyze all submissions against your defined rubric. Decisions can be contested by human witness.
              </p>
            ) : (
              <p className="text-[var(--font-size-sm)] opacity-80">
                Selected witness will receive email notifications for all submissions requiring evaluation. Their verdict is final.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Warning & Confirmation */}
      <Card className="border-[var(--color-primary-crimson)] bg-[var(--color-background-beige)]">
        <CardContent className="p-[var(--space-6)] text-center">
          <div className="mb-[var(--space-4)]">
            <svg className="w-16 h-16 mx-auto fill-[var(--color-primary-crimson)]" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          
          <h3 className="text-[var(--font-size-lg)] font-[var(--font-family-display)] font-bold uppercase text-[var(--color-primary-crimson)] mb-[var(--space-3)]">
            ⚠️ FINAL AUTHORIZATION REQUIRED ⚠️
          </h3>
          
          <div className="text-[var(--font-size-sm)] text-[var(--color-text-primary)] space-y-2 mb-[var(--space-4)]">
            <p>By confirming this mission, you hereby commit to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Meeting all deadlines as specified above</li>
              <li>Accepting automated consequence execution upon failure</li>
              <li>Forfeiting ${formData.monetaryStake.toFixed(2)} to charity if mission fails</li>
              {(formData.minorKompromatIds.length > 0 || formData.majorKompromatId) && (
                <li>Releasing compromising material as specified</li>
              )}
            </ul>
          </div>

          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            variant="danger"
            size="lg"
            className="text-[var(--font-size-base)] font-bold uppercase px-[var(--space-8)] py-[var(--space-4)]"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⚡</span>
                ESTABLISHING MISSION...
              </>
            ) : (
              <>
                CONFIRM & ACTIVATE MISSION ⚡
              </>
            )}
          </Button>

          <p className="text-[var(--font-size-xs)] text-[var(--color-primary-crimson)] font-bold uppercase mt-[var(--space-3)]">
            ★ THIS ACTION CANNOT BE UNDONE ★
          </p>
        </CardContent>
      </Card>

    </div>
  )
}

export default ReviewStep