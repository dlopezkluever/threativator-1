// Simple Node.js test for gradeSubmission Edge Function
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('Testing gradeSubmission Edge Function...')
console.log('URL:', supabaseUrl)
console.log('Key present:', !!supabaseKey)

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testGradeSubmission() {
  try {
    console.log('\n🧪 Testing gradeSubmission function...')
    
    const { data, error } = await supabase.functions.invoke('gradeSubmission', {
      body: { 
        submission_id: '00000000-0000-0000-0003-000000000001' 
      }
    })
    
    console.log('📊 Function response:', JSON.stringify(data, null, 2))
    
    if (error) {
      console.error('❌ Function error:', error)
    } else {
      console.log('✅ Function executed successfully!')
      
      if (data && data.result) {
        console.log('📝 Grading result:')
        console.log('  - Verdict:', data.result.verdict)
        console.log('  - Confidence:', data.result.confidence_score)
        console.log('  - Reasoning:', data.result.reasoning)
      }
    }
    
  } catch (err) {
    console.error('💥 Test failed:', err.message)
  }
}

// Run the test
testGradeSubmission()