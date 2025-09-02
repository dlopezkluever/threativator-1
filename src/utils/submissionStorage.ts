import { supabase } from '../lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export interface UploadResult {
  success: boolean
  filePath?: string
  publicUrl?: string
  error?: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export const uploadSubmissionFile = async (
  file: File,
  userId: string,
  _onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  try {
    // Generate unique submission ID and file path
    const submissionId = uuidv4()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${submissionId}.${fileExtension}`
    const filePath = `users/${userId}/submissions/${fileName}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('submissions')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Supabase Storage upload error:', error)
      return {
        success: false,
        error: `Upload failed: ${error.message}`
      }
    }

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('submissions')
      .getPublicUrl(filePath)

    return {
      success: true,
      filePath: data.path,
      publicUrl: publicUrlData.publicUrl
    }

  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error'
    }
  }
}

export const deleteSubmissionFile = async (filePath: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from('submissions')
      .remove([filePath])

    if (error) {
      console.error('Error deleting file:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}

export const getFilePreviewUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from('submissions')
    .getPublicUrl(filePath)
  
  return data.publicUrl
}