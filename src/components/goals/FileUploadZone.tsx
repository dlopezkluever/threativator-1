import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useAuth } from '../../contexts/AuthContext'
import { uploadSubmissionFile, UploadResult } from '../../utils/submissionStorage'
import { debugFileUpload, logUploadDiagnostics } from '../../utils/uploadDebugger'

export interface FileData {
  file: File
  previewUrl: string
  uploadProgress: number
  uploadError?: string
  uploadResult?: UploadResult
}

interface Props {
  onFileSelected: (fileData: FileData) => void
  onUploadComplete?: (result: UploadResult) => void
  disabled?: boolean
}

interface ErrorState {
  hasError: boolean
  errorMessage: string
  errorType?: string
}

const FileUploadZone: React.FC<Props> = ({ onFileSelected, onUploadComplete, disabled = false }) => {
  const { user } = useAuth()
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [errorState, setErrorState] = useState<ErrorState>({ hasError: false, errorMessage: '' })

  const validateFile = (file: File): string | null => {
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return `File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(1)}MB`
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'application/pdf',
      'video/mp4',
      'video/mov',
      'video/quicktime'
    ]

    if (!allowedTypes.includes(file.type)) {
      return `File type not supported. Allowed: Images (JPG, PNG, GIF), PDFs, Videos (MP4, MOV)`
    }

    return null
  }

  const createPreviewUrl = (file: File): string => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file)
    }
    // For non-images, we'll use a placeholder or file icon
    return ''
  }

  const handleUpload = async (file: File) => {
    if (!user) {
      console.error('No user found for upload')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // DEBUGGING: Run diagnostic first
      console.log('🔧 Running upload diagnostics...')
      const debugResult = await debugFileUpload(file)
      logUploadDiagnostics(debugResult)
      
      if (!debugResult.success) {
        const errorData: FileData = {
          file,
          previewUrl: createPreviewUrl(file),
          uploadProgress: 0,
          uploadError: `DEBUG: ${debugResult.error}`
        }
        onFileSelected(errorData)
        return
      }

      // If debug passes, proceed with normal upload
      const result = await uploadSubmissionFile(
        file,
        user.id,
        (progress) => {
          setUploadProgress(progress.percentage)
        }
      )

      const fileData: FileData = {
        file,
        previewUrl: createPreviewUrl(file),
        uploadProgress: 100,
        uploadResult: result
      }

      if (result.success) {
        onFileSelected(fileData)
        onUploadComplete?.(result)
      } else {
        const errorData: FileData = {
          ...fileData,
          uploadError: result.error
        }
        onFileSelected(errorData)
      }

    } catch (error) {
      console.error('Upload failed:', error)
      const errorData: FileData = {
        file,
        previewUrl: createPreviewUrl(file),
        uploadProgress: 0,
        uploadError: error instanceof Error ? error.message : 'Upload failed'
      }
      onFileSelected(errorData)
    } finally {
      setIsUploading(false)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (disabled || isUploading) return

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      const errorMessage = rejection.errors?.[0]?.message || 'File rejected'
      console.error('File rejected:', errorMessage)
      return
    }

    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    const validationError = validateFile(file)
    
    if (validationError) {
      console.error('File validation failed:', validationError)
      return
    }

    // Start upload immediately
    handleUpload(file)
  }, [onFileSelected, disabled, isUploading, user])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    disabled: disabled || isUploading,
    multiple: false,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'video/*': ['.mp4', '.mov']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const getDropzoneStyles = () => {
    let baseStyles = 'border-2 border-dashed p-[var(--space-8)] text-center cursor-pointer transition-colors'
    
    if (disabled || isUploading) {
      return `${baseStyles} border-gray-300 bg-gray-100 cursor-not-allowed`
    }
    
    if (isDragReject) {
      return `${baseStyles} border-[var(--color-primary-crimson)] bg-red-50`
    }
    
    if (isDragActive) {
      return `${baseStyles} border-[var(--color-success-muted)] bg-green-50`
    }
    
    return `${baseStyles} border-[var(--color-accent-black)] bg-white hover:bg-gray-50`
  }

  return (
    <div className="space-y-[var(--space-4)]">
      <div {...getRootProps()} className={getDropzoneStyles()}>
        <input {...getInputProps()} />
        
        <div className="space-y-[var(--space-3)]">
          <div className="text-[var(--font-size-4xl)]">
            {isDragActive ? '📥' : '📎'}
          </div>
          
          <div>
            <p className="font-[var(--font-family-display)] font-bold uppercase text-[var(--font-size-base)] mb-2">
              {isDragActive 
                ? 'DROP FILE HERE' 
                : 'DRAG & DROP FILE OR CLICK TO SELECT'
              }
            </p>
            
            <p className="text-[var(--font-size-sm)] text-[var(--color-text-primary)] opacity-70">
              {isDragReject
                ? 'File type not supported or too large'
                : 'Accepted: Images (JPG, PNG, GIF), PDFs, Videos (MP4, MOV) • Max 10MB'
              }
            </p>
          </div>
        </div>
      </div>

      {isUploading && (
        <div className="space-y-[var(--space-2)]">
          <div className="flex justify-between text-[var(--font-size-sm)]">
            <span>UPLOADING...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 h-2 border border-[var(--color-accent-black)]">
            <div 
              className="bg-[var(--color-success-muted)] h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Show upload success state */}
      {!isUploading && uploadProgress === 100 && (
        <div className="p-4 bg-[var(--color-success-muted)] text-white border border-[var(--color-accent-black)]">
          <div className="flex items-center gap-2">
            <span className="text-xl">✅</span>
            <span className="font-bold uppercase text-[var(--font-size-sm)]">
              FILE UPLOADED SUCCESSFULLY
            </span>
          </div>
          <p className="text-[var(--font-size-sm)] mt-1 opacity-90">
            Click "PREVIEW" to review your submission
          </p>
        </div>
      )}
    </div>
  )
}

export default FileUploadZone