import { supabase } from '../lib/supabase'

export interface CreateSubmissionData {
  checkpointId: string
  userId: string
  submissionType: 'file_upload' | 'external_url' | 'text_description'
  filePath?: string
  externalUrl?: string
  description?: string
}

export interface SubmissionResult {
  success: boolean
  submissionId?: string
  error?: string
}

export const createSubmission = async (data: CreateSubmissionData): Promise<SubmissionResult> => {
  try {
    const submissionRecord = {
      checkpoint_id: data.checkpointId,
      user_id: data.userId,
      submission_type: data.submissionType,
      file_path: data.filePath || null,
      external_url: data.externalUrl || null,
      description: data.description || null,
      status: 'pending' as const,
      submitted_at: new Date().toISOString()
    }

    const { data: result, error } = await supabase
      .from('submissions')
      .insert(submissionRecord)
      .select()
      .single()

    if (error) {
      console.error('Database error creating submission:', error)
      return {
        success: false,
        error: `Failed to create submission: ${error.message}`
      }
    }

    // Update checkpoint status to 'submitted'
    const { error: updateError } = await supabase
      .from('checkpoints')
      .update({ status: 'submitted' })
      .eq('id', data.checkpointId)

    if (updateError) {
      console.error('Error updating checkpoint status:', updateError)
      // Don't fail the submission for this, just log it
    }

    return {
      success: true,
      submissionId: result.id
    }

  } catch (error) {
    console.error('Submission creation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown submission error'
    }
  }
}

export const getSubmissionHistory = async (checkpointId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('checkpoint_id', checkpointId)
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('Error fetching submission history:', error)
      return { success: false, data: [], error: error.message }
    }

    return { success: true, data: data || [], error: null }
  } catch (error) {
    console.error('Failed to fetch submission history:', error)
    return { 
      success: false, 
      data: [], 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}