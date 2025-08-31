import React, { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface KompromatFile {
  id: string
  file: File
  severity: 'minor' | 'major'
  description: string
  preview?: string
}

interface KompromatUploadStepProps {
  onComplete: (uploadedFiles: string[]) => void
  onError: (error: string) => void
}

const KompromatUploadStep: React.FC<KompromatUploadStepProps> = ({ onComplete, onError }) => {
  const { user } = useAuth()
  const [files, setFiles] = useState<KompromatFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mov', 'video/avi']

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 50MB'
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only images (JPEG, PNG, GIF) and videos (MP4, MOV, AVI) are allowed'
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
        resolve(undefined) // No preview for videos
      }
    })
  }

  const handleFileSelection = async (selectedFiles: FileList) => {
    const newFiles: KompromatFile[] = []

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      const error = validateFile(file)
      
      if (error) {
        onError(`${file.name}: ${error}`)
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
      onError('User not authenticated')
      return
    }

    if (files.length === 0) {
      onError('Please upload at least one kompromat file')
      return
    }

    // Check that all files have descriptions
    const filesWithoutDescription = files.filter(f => !f.description.trim())
    if (filesWithoutDescription.length > 0) {
      onError('Please add descriptions to all files')
      return
    }

    setIsUploading(true)

    try {
      const uploadedIds: string[] = []

      for (const fileData of files) {
        // Upload file to Supabase Storage
        const fileName = `${user.id}/${crypto.randomUUID()}-${fileData.file.name}`
        const { error: uploadError } = await supabase.storage
          .from('kompromat')
          .upload(fileName, fileData.file)

        if (uploadError) {
          throw new Error(`Failed to upload ${fileData.file.name}: ${uploadError.message}`)
        }

        // Save file metadata to database
        const { data: kompromatData, error: dbError } = await supabase
          .from('kompromat')
          .insert({
            user_id: user.id,
            original_filename: fileData.file.name,
            file_path: fileName,
            file_type: fileData.file.type,
            file_size_bytes: fileData.file.size,
            severity: fileData.severity,
            description: fileData.description
          })
          .select('id')
          .single()

        if (dbError) {
          throw new Error(`Failed to save ${fileData.file.name} metadata: ${dbError.message}`)
        }

        uploadedIds.push(kompromatData.id)
      }

      onComplete(uploadedIds)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      onError(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🔒 Kompromat Upload
        </h2>
        <p className="text-gray-600 mb-2">
          Upload embarrassing or compromising content that will motivate you to achieve your goals.
        </p>
        <p className="text-sm text-gray-500">
          These files will be kept secure and only used as consequences if you fail to meet your commitments.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
          📎
        </div>
        <p className="text-lg font-medium text-gray-700 mb-2">
          Drag and drop files here, or click to select
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Images (JPEG, PNG, GIF) or Videos (MP4, MOV, AVI) up to 50MB
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Select Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Files</h3>
          <div className="space-y-4">
            {files.map((fileData) => (
              <div key={fileData.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start space-x-4">
                  {/* Preview */}
                  <div className="flex-shrink-0">
                    {fileData.preview ? (
                      <img
                        src={fileData.preview}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-300 rounded-md flex items-center justify-center">
                        🎥
                      </div>
                    )}
                  </div>

                  {/* File Details */}
                  <div className="flex-grow space-y-3">
                    <div>
                      <p className="font-medium text-gray-900">{fileData.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                    {/* Severity Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Severity Level
                      </label>
                      <select
                        value={fileData.severity}
                        onChange={(e) => updateFile(fileData.id, { 
                          severity: e.target.value as 'minor' | 'major' 
                        })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="minor">Minor - Mildly embarrassing</option>
                        <option value="major">Major - Highly embarrassing</option>
                      </select>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        value={fileData.description}
                        onChange={(e) => updateFile(fileData.id, { description: e.target.value })}
                        placeholder="Describe what makes this embarrassing or compromising..."
                        rows={2}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(fileData.id)}
                    className="flex-shrink-0 p-2 text-red-600 hover:text-red-800"
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={uploadFiles}
            disabled={isUploading}
            className="bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading securely...
              </div>
            ) : (
              'Upload Kompromat'
            )}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            🔒 Files are encrypted and stored securely
          </p>
        </div>
      )}

      {/* Skip Option */}
      <div className="mt-6 text-center">
        <button
          onClick={() => onComplete([])}
          className="text-gray-500 hover:text-gray-700 text-sm underline"
        >
          Skip for now (you can add kompromat later)
        </button>
      </div>
    </div>
  )
}

export default KompromatUploadStep