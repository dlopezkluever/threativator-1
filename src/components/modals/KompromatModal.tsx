import React, { useState, useRef, useEffect } from 'react'
import BaseModal from './BaseModal'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { Trash2, Upload, FileText, Image, Video } from 'lucide-react'

interface KompromatFile {
  id: string
  file: File
  severity: 'minor' | 'major'
  description: string
  preview?: string
}

interface ExistingKompromat {
  id: string
  original_filename: string
  file_path: string
  file_type: string
  file_size_bytes: number
  severity: 'minor' | 'major'
  description: string
  created_at: string
}

interface KompromatModalProps {
  isOpen: boolean
  onClose: () => void
}

const KompromatModal: React.FC<KompromatModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [files, setFiles] = useState<KompromatFile[]>([])
  const [existingFiles, setExistingFiles] = useState<ExistingKompromat[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [viewMode, setViewMode] = useState<'upload' | 'manage'>('upload')

  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB (reduced from 50MB)
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mov', 'application/pdf']

  // Fetch existing kompromat when modal opens
  useEffect(() => {
    if (isOpen && user) {
      fetchExistingFiles()
    }
  }, [isOpen, user])

  const fetchExistingFiles = async () => {
    try {
      // TODO: Replace with actual Supabase query when tables are set up
      const demoFiles = JSON.parse(localStorage.getItem('demo_kompromat') || '[]')
      console.log('🧪 [KompromatModal] DEMO MODE: Loading files from localStorage:', demoFiles.length, 'files')
      setExistingFiles(demoFiles)
    } catch (error) {
      console.error('Failed to fetch existing files:', error)
      setExistingFiles([])
    }
  }

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB'
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only images (JPEG, PNG, GIF), videos (MP4, MOV), and PDFs are allowed'
    }
    return null
  }

  const createFilePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      } else {
        resolve(undefined) // No preview for videos/PDFs
      }
    })
  }

  const handleFileSelection = async (selectedFiles: FileList) => {
    const newFiles: KompromatFile[] = []

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      const error = validateFile(file)
      
      if (error) {
        showError(`${file.name}: ${error}`)
        continue
      }

      const preview = await createFilePreview(file)
      
      newFiles.push({
        id: crypto.randomUUID(),
        file,
        severity: 'minor',
        description: '',
        preview
      })
    }

    setFiles(prev => [...prev, ...newFiles])
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    if (e.dataTransfer.files.length > 0) {
      await handleFileSelection(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFileSelection(e.target.files)
    }
  }

  const updateFile = (id: string, updates: Partial<KompromatFile>) => {
    setFiles(prev => prev.map(file => 
      file.id === id ? { ...file, ...updates } : file
    ))
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }

  const uploadFiles = async () => {
    if (!user) {
      showError('User not authenticated')
      return
    }

    if (files.length === 0) {
      showError('Please select at least one file to upload')
      return
    }

    // Check that all files have descriptions
    const filesWithoutDescription = files.filter(f => !f.description.trim())
    if (filesWithoutDescription.length > 0) {
      showError('Please add descriptions to all files')
      return
    }

    setIsUploading(true)

    try {
      // TODO: Replace with actual Supabase backend when tables/storage are set up
      console.log('🧪 [KompromatModal] DEMO MODE: Files would be uploaded:', files.map(f => ({
        name: f.file.name,
        size: f.file.size,
        type: f.file.type,
        severity: f.severity,
        description: f.description
      })))

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Store files in localStorage for demo purposes
      const existingDemo = JSON.parse(localStorage.getItem('demo_kompromat') || '[]')
      const newDemoFiles = files.map(fileData => ({
        id: crypto.randomUUID(),
        original_filename: fileData.file.name,
        file_path: `demo/${fileData.file.name}`,
        file_type: fileData.file.type,
        file_size_bytes: fileData.file.size,
        severity: fileData.severity,
        description: fileData.description,
        created_at: new Date().toISOString(),
        preview: fileData.preview
      }))
      
      localStorage.setItem('demo_kompromat', JSON.stringify([...existingDemo, ...newDemoFiles]))

      showSuccess(`✅ DEMO: Successfully "uploaded" ${files.length} file(s) to local storage!`)
      setFiles([])
      fetchExistingFiles()
      setViewMode('manage')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      showError(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const deleteExistingFile = async (file: ExistingKompromat) => {
    if (!confirm(`DELETE CLASSIFIED MATERIAL: "${file.original_filename}"?\n\nThis action cannot be undone, Comrade.`)) {
      return
    }

    try {
      // TODO: Replace with actual Supabase deletion when backend is set up
      console.log('🧪 [KompromatModal] DEMO MODE: Deleting file:', file.original_filename)
      
      const existingDemo = JSON.parse(localStorage.getItem('demo_kompromat') || '[]')
      const filteredFiles = existingDemo.filter((f: any) => f.id !== file.id)
      localStorage.setItem('demo_kompromat', JSON.stringify(filteredFiles))

      showSuccess('✅ DEMO: File deleted from local storage')
      fetchExistingFiles()
    } catch (error) {
      showError('Failed to delete file')
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />
    if (fileType.startsWith('video/')) return <Video className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="📁 KOMPROMAT ARCHIVE" size="large">
      <div className="space-y-6">
        {/* Demo Mode Banner */}
        <div style={{
          backgroundColor: '#C11B17',
          border: '4px solid #000000',
          padding: '16px',
          textAlign: 'center'
        }}>
          <p style={{
            color: '#FFFFFF',
            fontFamily: 'Stalinist One, Arial Black, sans-serif',
            fontSize: '16px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            margin: 0
          }}>
            🧪 DEMO MODE: FILES STORED LOCALLY (BACKEND SETUP REQUIRED)
          </p>
        </div>
        {/* Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'upload' ? 'command' : 'ghost'}
            onClick={() => setViewMode('upload')}
          >
            UPLOAD NEW
          </Button>
          <Button
            variant={viewMode === 'manage' ? 'command' : 'ghost'}
            onClick={() => setViewMode('manage')}
          >
            MANAGE EXISTING ({existingFiles.length})
          </Button>
        </div>

        {viewMode === 'upload' ? (
          <>
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>UPLOAD CLASSIFIED MATERIAL</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Drop Zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`
                    border-[4px] border-dashed 
                    ${dragOver 
                      ? 'border-[var(--color-primary-crimson)] bg-[var(--color-primary-crimson)] bg-opacity-10' 
                      : 'border-[var(--color-accent-black)]'
                    }
                    p-8 text-center
                  `}
                >
                  <Upload className="mx-auto h-12 w-12 text-[var(--color-text-primary)] opacity-50 mb-4" />
                  <p className="text-[var(--font-size-lg)] font-[var(--font-family-display)] uppercase font-bold mb-2 text-[var(--color-text-primary)]" style={{color: 'var(--color-text-primary)'}}>
                    DROP FILES OR CLICK TO SELECT
                  </p>
                  <p className="text-[var(--font-size-sm)] uppercase text-[var(--color-text-primary)] mb-4" style={{color: 'var(--color-text-primary)'}}>
                    IMAGES, VIDEOS, PDFs UP TO 10MB EACH
                  </p>
                  <Button
                    variant="action"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    SELECT FILES
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={ALLOWED_TYPES.join(',')}
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>

            {/* File List */}
            {files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>PENDING UPLOADS ({files.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {files.map((fileData) => (
                    <div key={fileData.id} className="
                      border-[2px] 
                      border-[var(--color-accent-black)]
                      bg-white
                      p-4
                    ">
                      <div className="flex items-start gap-4">
                        {/* Preview */}
                        <div className="flex-shrink-0">
                          {fileData.preview ? (
                            <img
                              src={fileData.preview}
                              alt="Preview"
                              style={{
                                width: '120px',
                                height: '120px',
                                objectFit: 'cover',
                                border: '2px solid #000000',
                                maxWidth: '120px',
                                maxHeight: '120px'
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '120px',
                              height: '120px',
                              backgroundColor: '#F5EEDC',
                              border: '2px solid #000000',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {getFileIcon(fileData.file.type)}
                            </div>
                          )}
                        </div>

                        {/* File Details */}
                        <div className="flex-1 space-y-3">
                          <div>
                            <p className="font-bold text-[var(--color-text-primary)]" style={{color: 'var(--color-text-primary)'}}>
                              {fileData.file.name}
                            </p>
                            <p className="text-[var(--font-size-sm)] text-[var(--color-text-primary)]" style={{color: 'var(--color-text-primary)'}}>
                              {formatFileSize(fileData.file.size)}
                            </p>
                          </div>

                          {/* Severity Selection */}
                          <div>
                            <label className="block text-[var(--font-size-sm)] font-bold uppercase mb-1 text-[var(--color-text-primary)]" style={{color: 'var(--color-text-primary)'}}>
                              SEVERITY CLASSIFICATION:
                            </label>
                            <div className="flex gap-2">
                              <Button
                                variant={fileData.severity === 'minor' ? 'success' : 'ghost'}
                                size="sm"
                                onClick={() => updateFile(fileData.id, { severity: 'minor' })}
                              >
                                MINOR
                              </Button>
                              <Button
                                variant={fileData.severity === 'major' ? 'danger' : 'ghost'}
                                size="sm"
                                onClick={() => updateFile(fileData.id, { severity: 'major' })}
                              >
                                MAJOR
                              </Button>
                            </div>
                          </div>

                          {/* Description */}
                          <div>
                            <label className="block text-[var(--font-size-sm)] font-bold uppercase mb-1 text-[var(--color-text-primary)]" style={{color: 'var(--color-text-primary)'}}>
                              DESCRIPTION (REQUIRED):
                            </label>
                            <textarea
                              value={fileData.description}
                              onChange={(e) => updateFile(fileData.id, { description: e.target.value })}
                              placeholder="Describe the compromising nature of this material..."
                              style={{
                                width: '100%',
                                padding: '8px',
                                border: '2px solid #000000',
                                backgroundColor: '#000000',
                                color: '#FFFFFF',
                                fontFamily: 'Roboto Condensed, Arial, sans-serif',
                                fontSize: '14px',
                                borderRadius: '0px',
                                minHeight: '60px',
                                resize: 'vertical'
                              }}
                              rows={2}
                            />
                          </div>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeFile(fileData.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="text-center pt-4">
                    <Button
                      variant="command"
                      onClick={uploadFiles}
                      disabled={isUploading || files.some(f => !f.description.trim())}
                      className="min-w-[200px]"
                    >
                      {isUploading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          UPLOADING...
                        </div>
                      ) : (
                        `UPLOAD ${files.length} FILE(S)`
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          /* Manage Existing Files */
          <Card>
            <CardHeader>
              <CardTitle>ARCHIVED MATERIAL ({existingFiles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {existingFiles.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-[var(--color-text-primary)] opacity-30 mb-4" />
                  <p className="text-[var(--color-text-primary)] uppercase font-bold" style={{color: 'var(--color-text-primary)'}}>
                    NO CLASSIFIED MATERIAL ON FILE
                  </p>
                  <p className="text-[var(--font-size-sm)] text-[var(--color-text-primary)] mt-2" style={{color: 'var(--color-text-primary)'}}>
                    Upload kompromat to establish consequences
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {existingFiles.map((file) => (
                    <div key={file.id} className="
                      border-[2px]
                      border-[var(--color-accent-black)]
                      bg-white
                      p-4
                      flex items-center justify-between
                    ">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {getFileIcon(file.file_type)}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--color-text-primary)]" style={{color: 'var(--color-text-primary)'}}>
                            {file.original_filename}
                          </p>
                          <p className="text-[var(--font-size-sm)] text-[var(--color-text-primary)]" style={{color: 'var(--color-text-primary)'}}>
                            {formatFileSize(file.file_size_bytes)} • {file.severity.toUpperCase()} • {new Date(file.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-[var(--font-size-sm)] text-[var(--color-text-primary)] mt-1" style={{color: 'var(--color-text-primary)'}}>
                            {file.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => deleteExistingFile(file)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Info Footer */}
        <div className="
          bg-[var(--color-background-beige)]
          border-[2px]
          border-[var(--color-accent-black)]
          p-4
          text-center
        ">
          <p className="text-[var(--font-size-sm)] text-[var(--color-text-primary)] uppercase font-bold" style={{color: 'var(--color-text-primary)'}}>
            🔒 ALL MATERIAL ENCRYPTED AND SECURED BY STATE PROTOCOLS
          </p>
          <p className="text-[var(--font-size-xs)] text-[var(--color-text-primary)] mt-1" style={{color: 'var(--color-text-primary)'}}>
            Minor: Used for checkpoint failures • Major: Reserved for final deadline violations
          </p>
        </div>
      </div>
    </BaseModal>
  )
}

export default KompromatModal