import React, { useState } from 'react'
import BaseModal from '../modals/BaseModal'
import { Button } from '../ui/button'
import { Goal, Checkpoint } from '../../contexts/GoalContext'
import { useAuth } from '../../contexts/AuthContext'
import FileUploadZone, { FileData } from './FileUploadZone'
import URLInput, { URLData } from './URLInput'
import TextDescriptionInput, { TextData } from './TextDescriptionInput'
import SubmissionPreview from './SubmissionPreview'
import { createSubmission, CreateSubmissionData } from '../../utils/submissionService'

type SubmissionType = 'file_upload' | 'external_url' | 'text_description'
type SubmissionStep = 'type_selection' | 'input' | 'preview' | 'submitting'

interface SubmissionData {
  type: SubmissionType
  fileData?: FileData
  urlData?: URLData
  textData?: TextData
}

interface Props {
  isOpen: boolean
  onClose: () => void
  goal: Goal
  checkpoint?: Checkpoint
  onSubmissionComplete?: () => void
}

const SubmissionModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  goal, 
  checkpoint,
  onSubmissionComplete 
}) => {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<SubmissionStep>('type_selection')
  const [submissionData, setSubmissionData] = useState<SubmissionData>({ type: 'file_upload' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const resetModal = () => {
    setCurrentStep('type_selection')
    setSubmissionData({ type: 'file_upload' })
    setIsSubmitting(false)
    setError(null)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  const getDeadlineInfo = () => {
    if (checkpoint) {
      return {
        title: checkpoint.title,
        deadline: checkpoint.deadline,
        isCheckpoint: true
      }
    }
    return {
      title: 'FINAL MISSION PROOF',
      deadline: goal.final_deadline,
      isCheckpoint: false
    }
  }

  const deadlineInfo = getDeadlineInfo()

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

  const renderTypeSelection = () => (
    <div className="space-y-[var(--space-4)]">
      <p className="text-[var(--font-size-base)] text-[var(--color-text-primary)] mb-[var(--space-6)]">
        SELECT YOUR PROOF SUBMISSION METHOD:
      </p>
      
      <div className="grid grid-cols-1 gap-[var(--space-4)]">
        {/* File Upload Option */}
        <button
          onClick={() => setSubmissionData({ type: 'file_upload' })}
          className={`p-[var(--space-4)] border-[var(--border-width-thick)] border-[var(--color-accent-black)] text-left transition-colors ${
            submissionData.type === 'file_upload' 
              ? 'bg-[var(--color-primary-crimson)] text-[var(--color-background-beige)]' 
              : 'bg-white hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-[var(--space-3)]">
            <div className="text-[var(--font-size-2xl)]">📎</div>
            <div>
              <h3 className="font-[var(--font-family-display)] font-bold uppercase text-[var(--font-size-base)]">
                FILE UPLOAD
              </h3>
              <p className="text-[var(--font-size-sm)] opacity-80">
                Upload images, PDFs, or videos (max 10MB)
              </p>
            </div>
          </div>
        </button>

        {/* External URL Option */}
        <button
          onClick={() => setSubmissionData({ type: 'external_url' })}
          className={`p-[var(--space-4)] border-[var(--border-width-thick)] border-[var(--color-accent-black)] text-left transition-colors ${
            submissionData.type === 'external_url' 
              ? 'bg-[var(--color-primary-crimson)] text-[var(--color-background-beige)]' 
              : 'bg-white hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-[var(--space-3)]">
            <div className="text-[var(--font-size-2xl)]">🔗</div>
            <div>
              <h3 className="font-[var(--font-family-display)] font-bold uppercase text-[var(--font-size-base)]">
                EXTERNAL LINK
              </h3>
              <p className="text-[var(--font-size-sm)] opacity-80">
                Link to online portfolio, GitHub, or external work
              </p>
            </div>
          </div>
        </button>

        {/* Text Description Option */}
        <button
          onClick={() => setSubmissionData({ type: 'text_description' })}
          className={`p-[var(--space-4)] border-[var(--border-width-thick)] border-[var(--color-accent-black)] text-left transition-colors ${
            submissionData.type === 'text_description' 
              ? 'bg-[var(--color-primary-crimson)] text-[var(--color-background-beige)]' 
              : 'bg-white hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-[var(--space-3)]">
            <div className="text-[var(--font-size-2xl)]">📝</div>
            <div>
              <h3 className="font-[var(--font-family-display)] font-bold uppercase text-[var(--font-size-base)]">
                TEXT DESCRIPTION
              </h3>
              <p className="text-[var(--font-size-sm)] opacity-80">
                Detailed written proof of completion
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )

  const handleFileSelected = (fileData: FileData) => {
    setSubmissionData(prev => ({ ...prev, fileData }))
    // Don't auto-advance to preview - let user click "PREVIEW" button
    // This ensures consistent flow across all submission types
  }

  const handleURLChange = (urlData: URLData) => {
    setSubmissionData(prev => ({ ...prev, urlData }))
  }

  const handleTextChange = (textData: TextData) => {
    setSubmissionData(prev => ({ ...prev, textData }))
  }

  const handleSubmit = async () => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    // For final submissions, we need to create a special checkpoint or handle differently
    // For now, let's require a checkpoint - final submissions need separate implementation
    if (!checkpoint) {
      setError('Checkpoint information missing - final submissions not yet implemented')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const submissionRequest: CreateSubmissionData = {
        checkpointId: checkpoint.id,
        userId: user.id,
        submissionType: submissionData.type
      }

      // Add submission-specific data
      switch (submissionData.type) {
        case 'file_upload':
          if (!submissionData.fileData?.uploadResult?.filePath) {
            throw new Error('File upload not completed')
          }
          submissionRequest.filePath = submissionData.fileData.uploadResult.filePath
          break
        
        case 'external_url':
          if (!submissionData.urlData?.url || !submissionData.urlData.isValid) {
            throw new Error('Invalid URL provided')
          }
          submissionRequest.externalUrl = submissionData.urlData.url
          break
        
        case 'text_description':
          if (!submissionData.textData?.content || !submissionData.textData.isValid) {
            throw new Error('Invalid text description')
          }
          submissionRequest.description = submissionData.textData.content
          break
      }

      const result = await createSubmission(submissionRequest)

      if (result.success) {
        // Clear any saved drafts
        localStorage.removeItem('threativator_submission_draft')
        
        // Close modal and trigger completion callback
        onSubmissionComplete?.()
        handleClose()
      } else {
        setError(result.error || 'Submission failed')
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown submission error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderInputStep = () => {
    switch (submissionData.type) {
      case 'file_upload':
        return (
          <FileUploadZone
            onFileSelected={handleFileSelected}
            disabled={isSubmitting}
          />
        )
      
      case 'external_url':
        return (
          <URLInput
            onURLChange={handleURLChange}
            disabled={isSubmitting}
            initialValue={submissionData.urlData?.url}
          />
        )
      
      case 'text_description':
        return (
          <TextDescriptionInput
            onTextChange={handleTextChange}
            disabled={isSubmitting}
            initialValue={submissionData.textData?.content}
          />
        )
      
      default:
        return <div>Invalid submission type</div>
    }
  }

  const renderContent = () => {
    switch (currentStep) {
      case 'type_selection':
        return renderTypeSelection()
      case 'input':
        return renderInputStep()
      case 'preview':
        return (
          <SubmissionPreview
            submissionType={submissionData.type}
            fileData={submissionData.fileData}
            urlData={submissionData.urlData}
            textData={submissionData.textData}
            onEdit={() => setCurrentStep('input')}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )
      case 'submitting':
        return (
          <div className="text-center py-[var(--space-8)]">
            <div className="text-[var(--font-size-4xl)] mb-[var(--space-4)]">⏳</div>
            <p className="font-[var(--font-family-display)] font-bold uppercase text-[var(--font-size-lg)]">
              SUBMITTING PROOF...
            </p>
            <p className="text-[var(--font-size-sm)] opacity-70 mt-2">
              Please wait while your submission is processed
            </p>
          </div>
        )
      default:
        return renderTypeSelection()
    }
  }

  const canProceedToInput = () => {
    return submissionData.type !== undefined
  }

  const canProceedToPreview = () => {
    switch (submissionData.type) {
      case 'file_upload':
        return submissionData.fileData?.uploadResult?.success
      case 'external_url':
        return submissionData.urlData?.isValid
      case 'text_description':
        return submissionData.textData?.isValid
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep === 'type_selection' && canProceedToInput()) {
      setCurrentStep('input')
    } else if (currentStep === 'input' && canProceedToPreview()) {
      setCurrentStep('preview')
    }
  }

  const handleBack = () => {
    if (currentStep === 'input') {
      setCurrentStep('type_selection')
    } else if (currentStep === 'preview') {
      setCurrentStep('input')
    }
  }

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="🎯 PROOF SUBMISSION"
      size="large"
    >
      <div className="space-y-6">
        {/* Deadline Info */}
        <div className="bg-white border-[var(--border-width-thick)] border-[var(--color-accent-black)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-[var(--font-size-sm)] font-[var(--font-family-display)] font-bold uppercase mb-1">
                DEADLINE:
              </span>
              <span className="text-[var(--font-size-base)] font-bold">
                {formatDate(deadlineInfo.deadline)}
              </span>
            </div>
            <div className="bg-[var(--color-primary-crimson)] text-[var(--color-background-beige)] px-3 py-2 font-bold uppercase text-[var(--font-size-sm)]">
              {getTimeRemaining(deadlineInfo.deadline)}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-[var(--color-primary-crimson)] text-[var(--color-background-beige)] border border-[var(--color-accent-black)]">
            <p className="font-bold uppercase text-[var(--font-size-sm)]">ERROR:</p>
            <p className="text-[var(--font-size-sm)]">{error}</p>
          </div>
        )}

        {/* Content */}
        <div>
          {renderContent()}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-4 justify-end pt-4 border-t-[var(--border-width-thick)] border-[var(--color-accent-black)]">
          <Button
            onClick={handleClose}
            variant="ghost"
            className="text-[var(--font-size-sm)] font-bold uppercase"
            disabled={isSubmitting}
          >
            CANCEL
          </Button>

          {(currentStep === 'input' || currentStep === 'preview') && (
            <Button
              onClick={handleBack}
              variant="ghost"
              className="text-[var(--font-size-sm)] font-bold uppercase"
              disabled={isSubmitting}
            >
              BACK
            </Button>
          )}

          {currentStep === 'type_selection' && (
            <Button
              onClick={handleNext}
              variant="action"
              className="text-[var(--font-size-sm)] font-bold uppercase"
              disabled={!canProceedToInput() || isSubmitting}
            >
              NEXT
            </Button>
          )}

          {currentStep === 'input' && (
            <Button
              onClick={handleNext}
              variant="action"
              className="text-[var(--font-size-sm)] font-bold uppercase"
              disabled={!canProceedToPreview() || isSubmitting}
            >
              PREVIEW
            </Button>
          )}
        </div>
      </div>
    </BaseModal>
  )
}

export default SubmissionModal