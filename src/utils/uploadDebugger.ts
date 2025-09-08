// Debug utility for testing uploads with detailed logging
import { supabase } from '../lib/supabase'

export interface UploadDebugResult {
  success: boolean
  error?: string
  details: {
    isAuthenticated: boolean
    userId?: string
    bucketAccessible: boolean
    uploadAttempted: boolean
    filePath?: string
    errorType?: 'auth' | 'permission' | 'bucket' | 'network' | 'unknown'
  }
}

export const debugFileUpload = async (file: File): Promise<UploadDebugResult> => {
  const result: UploadDebugResult = {
    success: false,
    details: {
      isAuthenticated: false,
      bucketAccessible: false,
      uploadAttempted: false
    }
  }

  console.log('🔍 DEBUG: Starting file upload diagnosis...')

  try {
    // Step 1: Check authentication
    console.log('🔐 Checking authentication...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('❌ Auth error:', authError.message)
      result.error = `Authentication error: ${authError.message}`
      result.details.errorType = 'auth'
      return result
    }

    if (!user) {
      console.error('❌ No authenticated user')
      result.error = 'User not authenticated - please log in first'
      result.details.errorType = 'auth'
      return result
    }

    console.log(`✅ Authenticated as: ${user.id}`)
    result.details.isAuthenticated = true
    result.details.userId = user.id

    // Step 2: Test bucket accessibility
    console.log('📦 Testing bucket accessibility...')
    try {
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
      
      if (bucketError) {
        console.error('❌ Cannot list buckets:', bucketError.message)
        result.error = `Cannot access storage: ${bucketError.message}`
        result.details.errorType = 'permission'
        return result
      }

      const submissionsBucket = buckets?.find(b => b.id === 'submissions')
      if (!submissionsBucket) {
        console.error('❌ Submissions bucket not accessible')
        result.error = 'Submissions bucket not accessible with current user permissions'
        result.details.errorType = 'bucket'
        return result
      }

      console.log('✅ Submissions bucket accessible')
      result.details.bucketAccessible = true

    } catch (bucketTestError) {
      console.error('❌ Bucket access test failed:', bucketTestError)
      result.error = `Bucket access failed: ${bucketTestError instanceof Error ? bucketTestError.message : 'Unknown error'}`
      result.details.errorType = 'bucket'
      return result
    }

    // Step 3: Attempt upload
    console.log('📤 Attempting file upload...')
    result.details.uploadAttempted = true

    // Generate file path matching the expected RLS policy pattern
    const fileExtension = file.name.split('.').pop() || 'bin'
    const fileName = `${Date.now()}.${fileExtension}`
    const filePath = `users/${user.id}/submissions/${fileName}`
    result.details.filePath = filePath

    console.log(`   File path: ${filePath}`)
    console.log(`   File size: ${(file.size / 1024).toFixed(1)}KB`)
    console.log(`   File type: ${file.type}`)

    const { data, error: uploadError } = await supabase.storage
      .from('submissions')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Upload failed:', uploadError.message)
      console.error('   Full error:', uploadError)
      
      // Classify error type
      if (uploadError.message.includes('row-level security')) {
        result.details.errorType = 'permission'
        result.error = 'Upload blocked by row-level security policy'
      } else if (uploadError.message.includes('not found') || uploadError.message.includes('bucket')) {
        result.details.errorType = 'bucket'
        result.error = 'Storage bucket issue'
      } else {
        result.details.errorType = 'unknown'
        result.error = uploadError.message
      }
      
      return result
    }

    console.log('✅ Upload successful!', data)
    result.success = true
    
    // Test public URL generation
    const { data: publicUrlData } = supabase.storage
      .from('submissions')
      .getPublicUrl(filePath)
    
    console.log('✅ Public URL generated:', publicUrlData.publicUrl)
    
    return result

  } catch (error) {
    console.error('💥 Upload debug failed:', error)
    result.error = error instanceof Error ? error.message : 'Unknown error during upload'
    result.details.errorType = 'network'
    return result
  }
}

export const logUploadDiagnostics = (result: UploadDebugResult) => {
  console.log('\n📊 UPLOAD DIAGNOSIS SUMMARY:')
  console.log(`   Success: ${result.success ? '✅' : '❌'}`)
  console.log(`   Authenticated: ${result.details.isAuthenticated ? '✅' : '❌'}`)
  console.log(`   Bucket Access: ${result.details.bucketAccessible ? '✅' : '❌'}`)
  console.log(`   Upload Attempted: ${result.details.uploadAttempted ? '✅' : '❌'}`)
  
  if (result.details.userId) {
    console.log(`   User ID: ${result.details.userId}`)
  }
  
  if (result.details.filePath) {
    console.log(`   File Path: ${result.details.filePath}`)
  }
  
  if (result.error) {
    console.log(`   Error: ${result.error}`)
    console.log(`   Error Type: ${result.details.errorType}`)
  }
}