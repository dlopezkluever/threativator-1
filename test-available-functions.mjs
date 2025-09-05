// Test to see what Edge Functions are available
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ksbbgnrphqhwixwnjdri.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYmJnbnJwaHFod2l4d25qZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MjQzNjMsImV4cCI6MjA3MjIwMDM2M30.AdWexFN0fJ8UK53dC-0QVdHv8dE2wjAnwZSu3ZSSFFM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testExistingFunctions() {
  console.log('🔍 Testing existing Edge Functions...\n')
  
  // Test the functions we know exist
  const functionsToTest = [
    'create-stripe-customer',
    'create-setup-intent', 
    'exchange-twitter-token',
    'gradeSubmission'
  ]
  
  for (const funcName of functionsToTest) {
    try {
      console.log(`Testing ${funcName}...`)
      
      const { data, error } = await supabase.functions.invoke(funcName, {
        body: { test: 'ping' }
      })
      
      if (error) {
        if (error.message.includes('404') || error.message.includes('Not Found')) {
          console.log(`❌ ${funcName}: Not found (404)`)
        } else {
          console.log(`⚠️  ${funcName}: ${error.message}`)
        }
      } else {
        console.log(`✅ ${funcName}: Available (got response)`)
      }
      
    } catch (err) {
      console.log(`💥 ${funcName}: ${err.message}`)
    }
    
    console.log('') // Empty line for readability
  }
}

testExistingFunctions()