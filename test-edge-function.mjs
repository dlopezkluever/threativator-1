// Simple ES module test for gradeSubmission Edge Function
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ksbbgnrphqhwixwnjdri.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYmJnbnJwaHFod2l4d25qZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MjQzNjMsImV4cCI6MjA3MjIwMDM2M30.AdWexFN0fJ8UK53dC-0QVdHv8dE2wjAnwZSu3ZSSFFM'

console.log('🧪 Testing gradeSubmission Edge Function...')
console.log('📡 URL:', supabaseUrl)
console.log('🔑 Key present:', !!supabaseKey)

const supabase = createClient(supabaseUrl, supabaseKey)

async function testGradeSubmission() {
  try {
    console.log('\n⚡ Invoking gradeSubmission function...')
    
    const { data, error } = await supabase.functions.invoke('gradeSubmission', {
      body: { 
        submission_id: '00000000-0000-0000-0003-000000000001' 
      }
    })
    
    console.log('\n📊 Raw response:')
    console.log('Data:', JSON.stringify(data, null, 2))
    console.log('Error:', error)
    
    if (error) {
      console.error('\n❌ Function invocation failed:')
      console.error('  - Message:', error.message)
      console.error('  - Details:', error.details)
    } else {
      console.log('\n✅ Function executed successfully!')
      
      if (data) {
        if (data.error) {
          console.log('🔍 Function returned an error:', data.error)
        } else if (data.result) {
          console.log('🎯 Grading completed!')
          console.log('  - Verdict:', data.result.verdict)
          console.log('  - Confidence:', data.result.confidence_score)
          console.log('  - Reasoning:', data.result.reasoning)
          
          if (data.result.word_count) {
            console.log('  - Word count:', data.result.word_count)
          }
          if (data.result.url_accessible !== undefined) {
            console.log('  - URL accessible:', data.result.url_accessible)
          }
        } else {
          console.log('🤔 Unexpected response format:', data)
        }
      }
    }
    
  } catch (err) {
    console.error('\n💥 Test failed with exception:', err.message)
    console.error('Stack:', err.stack)
  }
}

// Also test database connectivity
async function testDatabase() {
  try {
    console.log('\n📚 Testing database connectivity...')
    
    const { data, error } = await supabase
      .from('submissions')
      .select('id, status')
      .eq('id', '00000000-0000-0000-0003-000000000001')
      .single()
    
    if (error) {
      console.error('❌ Database query failed:', error.message)
    } else {
      console.log('✅ Database accessible!')
      console.log('  - Submission found:', data.id)
      console.log('  - Current status:', data.status)
    }
    
  } catch (err) {
    console.error('💥 Database test failed:', err.message)
  }
}

// Run tests
async function runAllTests() {
  await testDatabase()
  await testGradeSubmission()
  console.log('\n🏁 Tests completed!')
}

runAllTests()