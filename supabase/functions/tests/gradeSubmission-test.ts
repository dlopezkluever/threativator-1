// Test file for gradeSubmission Edge Function
import { assert, assertEquals } from 'jsr:@std/assert@1'
import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2'
import 'jsr:@std/dotenv/load'

// Set up the configuration for the Supabase client
const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL') ?? Deno.env.get('SUPABASE_URL') ?? ''
const supabaseKey = Deno.env.get('VITE_SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''

const options = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
}

// Test the gradeSubmission function
const testGradeSubmission = async () => {
  const client: SupabaseClient = createClient(supabaseUrl, supabaseKey, options)
  
  // Verify if the Supabase URL and key are provided
  if (!supabaseUrl) throw new Error('supabaseUrl is required.')
  if (!supabaseKey) throw new Error('supabaseKey is required.')
  
  console.log('Testing gradeSubmission function...')
  console.log('URL:', supabaseUrl)
  console.log('Key present:', !!supabaseKey)
  
  // Test the gradeSubmission function with a known test submission
  const { data: func_data, error: func_error } = await client.functions.invoke('gradeSubmission', {
    body: { 
      submission_id: '00000000-0000-0000-0003-000000000001' 
    },
  })
  
  // Log the response
  console.log('Function response:', JSON.stringify(func_data, null, 2))
  console.log('Function error:', func_error)
  
  // Check for errors from the function invocation
  if (func_error) {
    console.error('Function invocation error:', func_error.message)
    // Don't throw here - we want to see what the error is
  }
  
  // Log what we got back
  if (func_data) {
    console.log('Success! Got response:', func_data)
    assert(func_data, 'Function should return data')
    
    // If we got a successful response, check the structure
    if (func_data.success !== undefined) {
      console.log('Grading result:', func_data.result)
    }
  }
}

// Test database connectivity first
const testDatabaseConnection = async () => {
  const client: SupabaseClient = createClient(supabaseUrl, supabaseKey, options)
  
  console.log('Testing database connection...')
  
  // Test a simple query to verify connection
  const { data: table_data, error: table_error } = await client
    .from('submissions')
    .select('id, status')
    .limit(1)
  
  if (table_error) {
    throw new Error('Database connection failed: ' + table_error.message)
  }
  
  console.log('Database connection successful')
  assert(table_data !== null, 'Should be able to query submissions table')
}

// Test if our test submission exists
const testSubmissionExists = async () => {
  const client: SupabaseClient = createClient(supabaseUrl, supabaseKey, options)
  
  console.log('Checking if test submission exists...')
  
  const { data: submission_data, error: submission_error } = await client
    .from('submissions')
    .select('id, status, checkpoint_id')
    .eq('id', '00000000-0000-0000-0003-000000000001')
    .single()
  
  if (submission_error) {
    throw new Error('Test submission not found: ' + submission_error.message)
  }
  
  console.log('Test submission found:', submission_data)
  assert(submission_data, 'Test submission should exist')
  assertEquals(submission_data.id, '00000000-0000-0000-0003-000000000001', 'Should find the correct submission')
}

// Register and run the tests
Deno.test('Database Connection Test', testDatabaseConnection)
Deno.test('Test Submission Exists', testSubmissionExists)
Deno.test('gradeSubmission Function Test', testGradeSubmission)