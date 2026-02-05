import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card'
import { Button } from '../ui/button'
import { supabase } from '../../lib/supabase'
import GoalDefinitionStep from './steps/GoalDefinitionStep'
import CheckpointStep from './steps/CheckpointStep'
import StakesStep from './steps/StakesStep'
import RefereeStep from './steps/RefereeStep'
import TwitterSettingsStep from './steps/TwitterSettingsStep'
import ReviewStep from './steps/ReviewStep'

export interface CheckpointData {
  title: string
  deadline: Date
  requirements: string
}

export interface GoalFormData {
  title: string
  description: string
  finalDeadline: Date
  gradingRubric: string
  rubricTemplate: string
  checkpoints: CheckpointData[]
  monetaryStake: number
  charityDestination: 'doctors_without_borders' | 'red_cross' | 'unicef'
  minorKompromatIds: string[]
  majorKompromatId: string
  refereeType: 'ai' | 'human_witness'
  witnessContactId: string
  // Twitter consequence settings
  twitterMessagePreset: 'dramatic_shame' | 'public_confession' | 'accountability_notice' | 'custom'
  twitterCustomMessage: string
  twitterIncludeKompromat: boolean
}

const initialFormData: GoalFormData = {
  title: '',
  description: '',
  finalDeadline: new Date(),
  gradingRubric: '',
  rubricTemplate: '',
  checkpoints: [],
  monetaryStake: 0,
  charityDestination: 'doctors_without_borders',
  minorKompromatIds: [],
  majorKompromatId: '',
  refereeType: 'ai',
  witnessContactId: '',
  // Twitter defaults
  twitterMessagePreset: 'dramatic_shame',
  twitterCustomMessage: '',
  twitterIncludeKompromat: true
}

const GoalCreation: React.FC = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<GoalFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stepValidation, setStepValidation] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false
  })

  const updateFormData = (updates: Partial<GoalFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(formData.title && formData.description && formData.finalDeadline && formData.gradingRubric)
      case 2:
        return true // Checkpoints are optional
      case 3:
        return !!(formData.monetaryStake > 0 && formData.charityDestination)
      case 4:
        return !!(formData.refereeType && (formData.refereeType === 'ai' || formData.witnessContactId))
      case 5:
        // Twitter settings - always valid (custom message validated in component if preset is 'custom')
        return formData.twitterMessagePreset !== 'custom' ||
          (!!formData.twitterCustomMessage && formData.twitterCustomMessage.length <= 280)
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStepValidation(prev => ({ ...prev, [currentStep]: true }))
      setCurrentStep(prev => Math.min(prev + 1, 6))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleStepJump = (step: number) => {
    if (step < currentStep || stepValidation[step as keyof typeof stepValidation]) {
      setCurrentStep(step)
    }
  }

  const submitGoal = async () => {
    setIsSubmitting(true)
    
    try {
      // Start transaction
      const { data: goal, error: goalError } = await supabase
        .from('goals')
        .insert({
          user_id: user!.id,
          title: formData.title,
          description: formData.description,
          final_deadline: formData.finalDeadline.toISOString(),
          grading_rubric: formData.gradingRubric,
          referee_type: formData.refereeType,
          witness_contact_id: formData.refereeType === 'human_witness' ? formData.witnessContactId : null,
          monetary_stake: formData.monetaryStake,
          charity_destination: formData.charityDestination,
          minor_kompromat_id: formData.minorKompromatIds[0] || null,
          major_kompromat_id: formData.majorKompromatId || null,
          // Twitter consequence settings
          twitter_message_preset: formData.twitterMessagePreset,
          twitter_custom_message: formData.twitterMessagePreset === 'custom' ? formData.twitterCustomMessage : null,
          twitter_include_kompromat: formData.twitterIncludeKompromat
        })
        .select()
        .single()

      if (goalError) throw goalError

      // Prepare checkpoints array - always include final checkpoint
      const checkpointsToInsert = []

      // Add user-defined checkpoints first
      if (formData.checkpoints.length > 0) {
        const userCheckpoints = formData.checkpoints.map((checkpoint, index) => ({
          goal_id: goal.id,
          title: checkpoint.title,
          description: checkpoint.requirements,
          deadline: checkpoint.deadline.toISOString(),
          order_position: index + 1,
          requirements: checkpoint.requirements
        }))
        checkpointsToInsert.push(...userCheckpoints)
      }

      // Always add final checkpoint (represents the goal's final submission)
      const finalCheckpoint = {
        goal_id: goal.id,
        title: `FINAL SUBMISSION: ${formData.title}`,
        description: `Submit final proof of goal completion. ${formData.description ? formData.description : ''}`,
        deadline: formData.finalDeadline.toISOString(), // Same as goal deadline
        order_position: formData.checkpoints.length + 1, // Always last
        requirements: formData.gradingRubric // Use goal's rubric for final submission
      }
      checkpointsToInsert.push(finalCheckpoint)

      // Insert all checkpoints (user-defined + final checkpoint)
      if (checkpointsToInsert.length > 0) {
        const { error: checkpointsError } = await supabase
          .from('checkpoints')
          .insert(checkpointsToInsert)

        if (checkpointsError) throw checkpointsError
      }

      // Update user's holding cell balance by subtracting the stake
      if (formData.monetaryStake > 0) {
        const { data: currentProfile } = await supabase
          .from('users')
          .select('holding_cell_balance')
          .eq('id', user!.id)
          .single()
        
        if (currentProfile) {
          const newBalance = (currentProfile.holding_cell_balance || 0) - formData.monetaryStake
          const { error: balanceError } = await supabase
            .from('users')
            .update({ holding_cell_balance: newBalance })
            .eq('id', user!.id)

          if (balanceError) throw balanceError
        }
      }

      showToast({ title: 'SUCCESS: MISSION ESTABLISHED', type: 'success' })
      navigate('/dashboard')
    } catch (error) {
      console.error('Goal creation error:', error)
      showToast({ title: 'MISSION ESTABLISHMENT FAILED', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStepComponent = () => {
    switch (currentStep) {
      case 1:
        return (
          <GoalDefinitionStep
            formData={formData}
            updateFormData={updateFormData}
            onValidationChange={(isValid) => setStepValidation(prev => ({ ...prev, 1: isValid }))}
          />
        )
      case 2:
        return (
          <CheckpointStep
            formData={formData}
            updateFormData={updateFormData}
            onValidationChange={(isValid) => setStepValidation(prev => ({ ...prev, 2: isValid }))}
          />
        )
      case 3:
        return (
          <StakesStep
            formData={formData}
            updateFormData={updateFormData}
            onValidationChange={(isValid) => setStepValidation(prev => ({ ...prev, 3: isValid }))}
          />
        )
      case 4:
        return (
          <RefereeStep
            formData={formData}
            updateFormData={updateFormData}
            onValidationChange={(isValid) => setStepValidation(prev => ({ ...prev, 4: isValid }))}
          />
        )
      case 5:
        return (
          <TwitterSettingsStep
            formData={formData}
            updateFormData={updateFormData}
            onValidationChange={(isValid) => setStepValidation(prev => ({ ...prev, 5: isValid }))}
          />
        )
      case 6:
        return (
          <ReviewStep
            formData={formData}
            onEditStep={handleStepJump}
            onSubmit={submitGoal}
            isSubmitting={isSubmitting}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-main-crimson)] p-[var(--space-4)]">
      <div className="container mx-auto max-w-4xl">
        
        {/* Header */}
        <Card className="mb-[var(--space-6)]">
          <CardHeader>
            <CardTitle>ESTABLISH NEW MISSION</CardTitle>
            <CardDescription>DEFINE OBJECTIVES, STAKES & CONSEQUENCES</CardDescription>
          </CardHeader>
        </Card>

        {/* Step Indicator */}
        <Card className="mb-[var(--space-6)]">
          <CardContent className="py-[var(--space-4)]">
            <div className="flex justify-between items-center">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <button
                    onClick={() => handleStepJump(step)}
                    disabled={step > currentStep && !stepValidation[step as keyof typeof stepValidation]}
                    className={`w-10 h-10 md:w-12 md:h-12 border-[var(--border-width-thick)] border-[var(--color-accent-black)] flex items-center justify-center font-[var(--font-family-display)] font-bold text-base md:text-lg transition-colors
                      ${currentStep === step
                        ? 'bg-[var(--color-primary-crimson)] text-[var(--color-background-beige)]'
                        : stepValidation[step as keyof typeof stepValidation]
                          ? 'bg-[var(--color-success-muted)] text-[var(--color-background-beige)]'
                          : 'bg-[var(--color-background-beige)] text-[var(--color-text-primary)]'
                      }
                      ${(step < currentStep || stepValidation[step as keyof typeof stepValidation]) ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-50'}
                    `}
                  >
                    {step}
                  </button>
                  <span className="mt-2 text-[10px] md:text-[var(--font-size-xs)] font-[var(--font-family-body)] uppercase text-center leading-tight">
                    {step === 1 && 'DEFINE'}
                    {step === 2 && 'CHECKS'}
                    {step === 3 && 'STAKES'}
                    {step === 4 && 'REFEREE'}
                    {step === 5 && 'TWITTER'}
                    {step === 6 && 'REVIEW'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="mb-[var(--space-6)]">
          <CardContent className="p-[var(--space-6)]">
            {getStepComponent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card>
          <CardFooter className="flex justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="text-[var(--font-size-sm)] font-bold uppercase"
            >
              ← PREVIOUS
            </Button>

            <div className="flex gap-[var(--space-2)]">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="text-[var(--font-size-sm)] font-bold uppercase"
              >
                CANCEL MISSION
              </Button>

              {currentStep < 6 ? (
                <Button
                  variant="command"
                  onClick={handleNext}
                  disabled={!validateCurrentStep()}
                  className="text-[var(--font-size-sm)] font-bold uppercase"
                >
                  CONTINUE →
                </Button>
              ) : (
                <Button
                  variant="danger"
                  onClick={submitGoal}
                  disabled={isSubmitting}
                  className="text-[var(--font-size-sm)] font-bold uppercase"
                >
                  {isSubmitting ? 'ESTABLISHING...' : 'CONFIRM MISSION ⚡'}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>

      </div>
    </div>
  )
}

export default GoalCreation