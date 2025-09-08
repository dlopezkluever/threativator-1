import React from 'react'
import { Button } from '../ui/button'
import { FileData } from './FileUploadZone'
import { URLData } from './URLInput'
import { TextData } from './TextDescriptionInput'

type SubmissionType = 'file_upload' | 'external_url' | 'text_description'

interface Props {
  submissionType: SubmissionType
  fileData?: FileData
  urlData?: URLData
  textData?: TextData
  onEdit: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

const SubmissionPreview: React.FC<Props> = ({
  submissionType,
  fileData,
  urlData,
  textData,
  onEdit,
  onSubmit,
  isSubmitting
}) => {

  const renderFilePreview = () => {
    if (!fileData || !fileData.uploadResult?.success) return null

    const { file, previewUrl } = fileData
    const isImage = file.type.startsWith('image/')

    return (
      <div className="space-y-[var(--space-3)]">
        <h3 className="font-[var(--font-family-display)] font-bold uppercase text-[var(--font-size-base)]">
          FILE SUBMISSION:
        </h3>
        
        <div className="border border-[var(--color-accent-black)] p-[var(--space-4)] bg-white">
          
          {/* Large Preview Section */}
          <div className="mb-[var(--space-4)]">
            {isImage && previewUrl ? (
              <div className="text-center">
                <img 
                  src={previewUrl} 
                  alt="File preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    objectFit: 'contain',
                    border: '2px solid var(--color-accent-black)',
                    backgroundColor: 'white'
                  }}
                  className="mx-auto"
                />
              </div>
            ) : file.type.startsWith('video/') && previewUrl ? (
              <div className="text-center">
                <video 
                  controls
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    border: '2px solid var(--color-accent-black)',
                    backgroundColor: 'black'
                  }}
                  className="mx-auto"
                >
                  <source src={previewUrl} type={file.type} />
                  Your browser does not support video playback.
                </video>
              </div>
            ) : (
              <div className="text-center py-8">
                <div 
                  style={{
                    width: '120px',
                    height: '120px',
                    margin: '0 auto',
                    border: '2px solid var(--color-accent-black)',
                    backgroundColor: '#F5EEDC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <span className="text-[var(--font-size-4xl)]">
                    {file.type.includes('pdf') ? '📄' : 
                     file.type.includes('video') ? '🎥' : '📎'}
                  </span>
                </div>
                <p className="text-[var(--font-size-sm)] mt-3 text-[var(--color-text-primary)] font-bold">
                  {file.type.includes('pdf') ? 'PDF DOCUMENT' : 
                   file.type.includes('video') ? 'VIDEO FILE' : 'FILE ATTACHMENT'}
                </p>
              </div>
            )}
          </div>

          {/* File Details Section */}
          <div className="border-t border-[var(--color-accent-black)] pt-[var(--space-3)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[var(--font-size-base)] mb-1">
                  {file.name}
                </p>
                <p className="text-[var(--font-size-sm)] opacity-70 mb-1">
                  {file.type} • {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <div className="text-right">
                <p className="text-[var(--color-success-muted)] text-[var(--font-size-sm)] font-bold">
                  ✓ UPLOADED SUCCESSFULLY
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderURLPreview = () => {
    if (!urlData || !urlData.isValid) return null

    return (
      <div className="space-y-[var(--space-3)]">
        <h3 className="font-[var(--font-family-display)] font-bold uppercase text-[var(--font-size-base)]">
          EXTERNAL LINK SUBMISSION:
        </h3>
        
        <div className="border border-[var(--color-accent-black)] p-[var(--space-4)] bg-white">
          <div className="flex items-center gap-[var(--space-3)] mb-3">
            <span className="text-[var(--font-size-xl)]">🔗</span>
            <div className="flex-1">
              <a
                href={urlData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-primary-crimson)] underline text-[var(--font-size-base)] break-all hover:opacity-80"
              >
                {urlData.url}
              </a>
              
              {urlData.isAccessible !== undefined && (
                <p className={`text-[var(--font-size-sm)] mt-1 ${
                  urlData.isAccessible 
                    ? 'text-[var(--color-success-muted)]' 
                    : 'text-orange-600'
                }`}>
                  {urlData.isAccessible ? '✓ Link verified accessible' : '⚠ Link accessibility unknown'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderTextPreview = () => {
    if (!textData || !textData.isValid) return null

    return (
      <div className="space-y-[var(--space-3)]">
        <h3 className="font-[var(--font-family-display)] font-bold uppercase text-[var(--font-size-base)]">
          TEXT DESCRIPTION SUBMISSION:
        </h3>
        
        <div className="border border-[var(--color-accent-black)] p-[var(--space-4)] bg-white">
          <div className="space-y-[var(--space-3)]">
            <div className="flex items-center justify-between">
              <span className="text-[var(--font-size-sm)] font-bold">
                CHARACTER COUNT: {textData.characterCount}
              </span>
              <span className="text-[var(--color-success-muted)] text-[var(--font-size-sm)] font-bold">
                ✓ READY FOR SUBMISSION
              </span>
            </div>
            
            <div className="max-h-48 overflow-y-auto border border-gray-300 p-[var(--space-3)] bg-gray-50">
              <div className="whitespace-pre-wrap text-[var(--font-size-sm)] leading-relaxed">
                {textData.content}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const canSubmit = () => {
    switch (submissionType) {
      case 'file_upload':
        return fileData?.uploadResult?.success
      case 'external_url':
        return urlData?.isValid
      case 'text_description':
        return textData?.isValid
      default:
        return false
    }
  }

  const getSubmissionTypeLabel = () => {
    switch (submissionType) {
      case 'file_upload':
        return 'FILE UPLOAD'
      case 'external_url':
        return 'EXTERNAL LINK'
      case 'text_description':
        return 'TEXT DESCRIPTION'
      default:
        return 'UNKNOWN'
    }
  }

  return (
    <div className="space-y-[var(--space-6)]">
      <div>
        <h2 className="font-[var(--font-family-display)] font-bold uppercase text-[var(--font-size-lg)] mb-2">
          SUBMISSION PREVIEW
        </h2>
        <p className="text-[var(--font-size-sm)] opacity-70">
          Review your {getSubmissionTypeLabel().toLowerCase()} submission before final confirmation
        </p>
      </div>

      {/* Render appropriate preview */}
      {submissionType === 'file_upload' && renderFilePreview()}
      {submissionType === 'external_url' && renderURLPreview()}
      {submissionType === 'text_description' && renderTextPreview()}

      {/* Submission Actions */}
      <div className="bg-gray-50 border border-[var(--color-accent-black)] p-[var(--space-4)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-[var(--font-family-display)] font-bold uppercase text-[var(--font-size-sm)] mb-1">
              SUBMISSION STATUS:
            </p>
            <p className={`text-[var(--font-size-sm)] font-bold ${
              canSubmit() 
                ? 'text-[var(--color-success-muted)]' 
                : 'text-[var(--color-primary-crimson)]'
            }`}>
              {canSubmit() ? '✓ READY FOR SUBMISSION' : '✗ SUBMISSION INCOMPLETE'}
            </p>
          </div>

          <div className="flex gap-[var(--space-3)]">
            <Button
              onClick={onEdit}
              variant="ghost"
              size="sm"
              disabled={isSubmitting}
              className="text-[var(--font-size-sm)] font-bold uppercase"
            >
              EDIT
            </Button>
            
            <Button
              onClick={onSubmit}
              variant="danger"
              size="sm"
              disabled={!canSubmit() || isSubmitting}
              className="text-[var(--font-size-sm)] font-bold uppercase"
            >
              {isSubmitting ? 'SUBMITTING...' : 'SUBMIT PROOF'}
            </Button>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-[var(--color-primary-crimson)] text-[var(--color-background-beige)] p-[var(--space-3)] border border-[var(--color-accent-black)]">
        <p className="text-[var(--font-size-sm)] font-bold uppercase">
          ⚠ WARNING: SUBMISSION IS FINAL
        </p>
        <p className="text-[var(--font-size-sm)] opacity-90">
          Once submitted, your proof will be graded according to your predefined rubric. Ensure all information is accurate.
        </p>
      </div>
    </div>
  )
}

export default SubmissionPreview