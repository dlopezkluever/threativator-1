import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import StripePaymentStep from './StripePaymentStep'
import KompromatUploadStep from './KompromatUploadStep'
import ContactManagementStep from './ContactManagementStep'
import SocialMediaStep from './SocialMediaStep'

interface OnboardingState {
  currentStep: number
  completedSteps: Set<number>
  stepData: {
    stripeCustomerId?: string
    kompromatIds: string[]
    contactIds: string[]
    socialMediaConnected: boolean
  }
}

const STEPS = [
  {
    id: 1,
    title: 'Payment Setup',
    description: 'Secure payment method for stakes',
    component: 'stripe'
  },
  {
    id: 2,
    title: 'Kompromat Upload',
    description: 'Embarrassing content for consequences',
    component: 'kompromat'
  },
  {
    id: 3,
    title: 'Contact Management',
    description: 'Witnesses and consequence targets',
    component: 'contacts'
  },
  {
    id: 4,
    title: 'Social Media',
    description: 'Optional social accountability',
    component: 'social'
  }
]

const OnboardingWizard: React.FC = () => {
  const { user, userProfile } = useAuth()
  const { showError, showSuccess } = useToast()
  const navigate = useNavigate()
  
  const [state, setState] = useState<OnboardingState>({
    currentStep: 1,
    completedSteps: new Set(),
    stepData: {
      kompromatIds: [],
      contactIds: [],
      socialMediaConnected: false
    }
  })
  
  const [isCompleting, setIsCompleting] = useState(false)

  // Check if user has already completed onboarding
  useEffect(() => {
    if (userProfile?.onboarding_completed) {
      navigate('/dashboard')
    }
  }, [userProfile, navigate])

  // Prevent navigation away from onboarding
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!userProfile?.onboarding_completed) {
        e.preventDefault()
        e.returnValue = 'Are you sure you want to leave? Your onboarding progress will be lost.'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [userProfile])

  const handleStepComplete = (stepId: number, data: any) => {
    setState(prev => ({
      ...prev,
      completedSteps: new Set([...prev.completedSteps, stepId]),
      stepData: {
        ...prev.stepData,
        ...data
      }
    }))

    // Move to next step or complete onboarding
    if (stepId === STEPS.length) {
      completeOnboarding()
    } else {
      setState(prev => ({
        ...prev,
        currentStep: stepId + 1
      }))
    }
  }

  const handleStepError = (error: string) => {
    showError(error)
  }

  const completeOnboarding = async () => {
    if (!user) {
      handleStepError('User not authenticated')
      return
    }

    setIsCompleting(true)

    try {
      // Update user profile to mark onboarding as completed
      const { error } = await supabase
        .from('users')
        .update({
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        throw new Error('Failed to complete onboarding')
      }

      showSuccess('Onboarding completed! Welcome to Threativator! 🎉')
      navigate('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete onboarding'
      handleStepError(errorMessage)
    } finally {
      setIsCompleting(false)
    }
  }

  const goToStep = (stepNumber: number) => {
    // Only allow going to completed steps or the current step
    if (stepNumber <= Math.max(...state.completedSteps, state.currentStep)) {
      setState(prev => ({
        ...prev,
        currentStep: stepNumber
      }))
    }
  }

  const renderCurrentStep = () => {
    const currentStepData = STEPS.find(step => step.id === state.currentStep)
    if (!currentStepData) return null

    const commonProps = {
      onError: handleStepError
    }

    switch (currentStepData.component) {
      case 'stripe':
        return (
          <StripePaymentStep
            {...commonProps}
            onComplete={(customerId: string) => 
              handleStepComplete(1, { stripeCustomerId: customerId })
            }
          />
        )
      
      case 'kompromat':
        return (
          <KompromatUploadStep
            {...commonProps}
            onComplete={(kompromatIds: string[]) => 
              handleStepComplete(2, { kompromatIds })
            }
          />
        )
      
      case 'contacts':
        return (
          <ContactManagementStep
            {...commonProps}
            onComplete={(contactIds: string[]) => 
              handleStepComplete(3, { contactIds })
            }
          />
        )
      
      case 'social':
        return (
          <SocialMediaStep
            {...commonProps}
            onComplete={(socialMediaConnected: boolean) => 
              handleStepComplete(4, { socialMediaConnected })
            }
          />
        )
      
      default:
        return null
    }
  }

  if (isCompleting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Completing Your Setup...
          </h2>
          <p className="text-gray-600">
            Just a moment while we finalize your Threativator experience
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome to Threativator! 🚀
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Let's set up your account for maximum accountability
            </p>
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-between">
              {STEPS.map((step, stepIdx) => {
                const isCompleted = state.completedSteps.has(step.id)
                const isCurrent = state.currentStep === step.id
                const isClickable = step.id <= Math.max(...state.completedSteps, state.currentStep)

                return (
                  <li key={step.id} className="flex items-center">
                    <button
                      onClick={() => goToStep(step.id)}
                      disabled={!isClickable}
                      className={`group flex flex-col items-center ${
                        isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                      }`}
                    >
                      <span
                        className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                          isCompleted
                            ? 'bg-green-600 text-white'
                            : isCurrent
                            ? 'bg-blue-600 text-white'
                            : isClickable
                            ? 'bg-gray-300 text-gray-600 group-hover:bg-gray-400'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {isCompleted ? '✓' : step.id}
                      </span>
                      <span className={`mt-2 text-xs font-medium text-center max-w-[80px] ${
                        isCurrent ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </span>
                      <span className="text-xs text-gray-400 text-center max-w-[80px] mt-1">
                        {step.description}
                      </span>
                    </button>
                    
                    {/* Connector line */}
                    {stepIdx < STEPS.length - 1 && (
                      <div className={`flex-auto ml-4 mr-4 h-0.5 ${
                        state.completedSteps.has(step.id) 
                          ? 'bg-green-600' 
                          : 'bg-gray-200'
                      }`} />
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {renderCurrentStep()}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <span>Step {state.currentStep} of {STEPS.length}</span>
              <span>•</span>
              <span>{state.completedSteps.size} completed</span>
            </div>
            <div className="text-xs">
              🔒 All data is encrypted and secure
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingWizard