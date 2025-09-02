import React, { useState, useEffect } from 'react'
import { GoalFormData } from '../GoalCreation'

interface Props {
  formData: GoalFormData
  updateFormData: (updates: Partial<GoalFormData>) => void
  onValidationChange: (isValid: boolean) => void
}

const rubricTemplates = {
  '': 'Select a template...',
  'word_count': 'Document must contain at least [X] words of meaningful content. No filler text or repetitive content allowed.',
  'code_commits': 'Repository must have at least [X] commits with substantive code changes. Each commit must include meaningful progress toward the project goal.',
  'daily_checkins': 'Complete daily check-ins for [X] consecutive days. Each check-in must include specific progress notes and next-day goals.',
  'file_submission': 'Submit a completed file/document that meets the specified requirements. File must be original work completed during the goal period.',
  'custom': 'Enter your custom grading criteria below...'
}

const GoalDefinitionStep: React.FC<Props> = ({ formData, updateFormData, onValidationChange }) => {
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Get tomorrow as minimum date
  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const validateStep = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Mission title is required'
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Mission description is required'
    }

    if (!formData.finalDeadline) {
      newErrors.finalDeadline = 'Final deadline is required'
    } else {
      const deadline = new Date(formData.finalDeadline)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      if (deadline <= tomorrow) {
        newErrors.finalDeadline = 'Deadline must be at least 1 day in the future'
      }
    }

    if (!formData.gradingRubric.trim()) {
      newErrors.gradingRubric = 'Grading rubric is required'
    } else if (formData.gradingRubric.length < 10) {
      newErrors.gradingRubric = 'Rubric must be at least 10 characters'
    }

    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    onValidationChange(isValid)
    return isValid
  }

  useEffect(() => {
    validateStep()
  }, [formData.title, formData.description, formData.finalDeadline, formData.gradingRubric])

  const handleTemplateChange = (template: string) => {
    updateFormData({ 
      rubricTemplate: template,
      gradingRubric: template === 'custom' ? '' : rubricTemplates[template as keyof typeof rubricTemplates] || ''
    })
  }

  return (
    <div className="space-y-[var(--space-6)]">
      
      {/* Title Input */}
      <div>
        <label className="block text-[var(--font-size-base)] font-[var(--font-family-display)] font-bold uppercase tracking-wide mb-[var(--space-2)]">
          MISSION DESIGNATION *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => updateFormData({ title: e.target.value })}
          placeholder="Enter mission title..."
          maxLength={100}
          className="w-full border-[var(--border-width-thick)] border-[var(--color-accent-black)] bg-[var(--color-background-beige)] p-[var(--space-3)] text-[var(--color-text-primary)] font-[var(--font-family-body)] text-[var(--font-size-base)]"
          style={{ borderRadius: '0px' }}
        />
        {errors.title && (
          <p className="mt-1 text-[var(--color-primary-crimson)] text-[var(--font-size-sm)] font-bold">
            ⚠️ {errors.title}
          </p>
        )}
        <p className="mt-1 text-[var(--color-text-primary)] text-[var(--font-size-xs)] opacity-70">
          {formData.title.length}/100 characters
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-[var(--font-size-base)] font-[var(--font-family-display)] font-bold uppercase tracking-wide mb-[var(--space-2)]">
          MISSION BRIEFING *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Describe the mission objective in detail..."
          rows={4}
          className="w-full border-[var(--border-width-thick)] border-[var(--color-accent-black)] bg-[var(--color-background-beige)] p-[var(--space-3)] text-[var(--color-text-primary)] font-[var(--font-family-body)] text-[var(--font-size-base)] resize-none"
          style={{ borderRadius: '0px' }}
        />
        {errors.description && (
          <p className="mt-1 text-[var(--color-primary-crimson)] text-[var(--font-size-sm)] font-bold">
            ⚠️ {errors.description}
          </p>
        )}
      </div>

      {/* Final Deadline */}
      <div>
        <label className="block text-[var(--font-size-base)] font-[var(--font-family-display)] font-bold uppercase tracking-wide mb-[var(--space-2)]">
          FINAL DEADLINE *
        </label>
        <input
          type="datetime-local"
          value={formData.finalDeadline instanceof Date ? formData.finalDeadline.toISOString().slice(0, 16) : ''}
          onChange={(e) => updateFormData({ finalDeadline: new Date(e.target.value) })}
          min={getTomorrowDate() + 'T00:00'}
          className="w-full border-[var(--border-width-thick)] border-[var(--color-accent-black)] bg-[var(--color-background-beige)] p-[var(--space-3)] text-[var(--color-text-primary)] font-[var(--font-family-body)] text-[var(--font-size-base)]"
          style={{ borderRadius: '0px' }}
        />
        {errors.finalDeadline && (
          <p className="mt-1 text-[var(--color-primary-crimson)] text-[var(--font-size-sm)] font-bold">
            ⚠️ {errors.finalDeadline}
          </p>
        )}
      </div>

      {/* Rubric Template Selection */}
      <div>
        <label className="block text-[var(--font-size-base)] font-[var(--font-family-display)] font-bold uppercase tracking-wide mb-[var(--space-2)]">
          GRADING TEMPLATE
        </label>
        <select
          value={formData.rubricTemplate}
          onChange={(e) => handleTemplateChange(e.target.value)}
          className="w-full border-[var(--border-width-thick)] border-[var(--color-accent-black)] bg-[var(--color-background-beige)] p-[var(--space-3)] text-[var(--color-text-primary)] font-[var(--font-family-body)] text-[var(--font-size-base)]"
          style={{ borderRadius: '0px' }}
        >
          {Object.entries(rubricTemplates).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Grading Rubric */}
      <div>
        <label className="block text-[var(--font-size-base)] font-[var(--font-family-display)] font-bold uppercase tracking-wide mb-[var(--space-2)]">
          SUCCESS CRITERIA *
        </label>
        <textarea
          value={formData.gradingRubric}
          onChange={(e) => updateFormData({ gradingRubric: e.target.value })}
          placeholder={formData.rubricTemplate === 'custom' 
            ? "Define specific criteria for mission success. Be clear and measurable..."
            : "Customize the template above or select 'Custom' for full control..."
          }
          rows={6}
          className="w-full border-[var(--border-width-thick)] border-[var(--color-accent-black)] bg-[var(--color-background-beige)] p-[var(--space-3)] text-[var(--color-text-primary)] font-[var(--font-family-body)] text-[var(--font-size-base)] resize-none"
          style={{ borderRadius: '0px' }}
        />
        {errors.gradingRubric && (
          <p className="mt-1 text-[var(--color-primary-crimson)] text-[var(--font-size-sm)] font-bold">
            ⚠️ {errors.gradingRubric}
          </p>
        )}
        <p className="mt-1 text-[var(--color-text-primary)] text-[var(--font-size-xs)] opacity-70">
          This criteria will be used to grade your final submission
        </p>
      </div>

    </div>
  )
}

export default GoalDefinitionStep