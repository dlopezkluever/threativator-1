import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("testConsequences Edge Function loaded - FOR TESTING ONLY")

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const { testType, userId } = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log(`Running test: ${testType} for user ${userId}`)

    switch (testType) {
      case 'create_overdue_checkpoint':
        return await createTestOverdueCheckpoint(supabase, userId)
      
      case 'create_overdue_goal':
        return await createTestOverdueGoal(supabase, userId)
      
      case 'trigger_consequence_processing':
        return await triggerConsequenceProcessing(supabase)
      
      case 'test_stripe_connection':
        return await testStripeConnection()
      
      case 'test_sendgrid_connection':
        return await testSendGridConnection(userId)
      
      case 'russian_roulette_test':
        return await testRussianRoulette()
        
      default:
        return new Response(JSON.stringify({ error: 'Unknown test type' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
    }

  } catch (error) {
    console.error('Test error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

async function createTestOverdueCheckpoint(supabase: any, userId: string) {
  // Create a test goal
  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .insert([{
      user_id: userId,
      title: 'TEST: Overdue Checkpoint Goal',
      description: 'Test goal for consequence system',
      final_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      grading_rubric: 'Complete test task',
      monetary_stake: 10.00,
      charity_destination: 'doctors_without_borders'
    }])
    .select()
    .single()

  if (goalError) throw goalError

  // Create an overdue checkpoint (deadline 1 hour ago)
  const { data: checkpoint, error: checkpointError } = await supabase
    .from('checkpoints')
    .insert([{
      goal_id: goal.id,
      title: 'TEST: Overdue Checkpoint',
      description: 'Test checkpoint that should trigger consequences',
      deadline: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
      order_position: 1,
      status: 'pending'
    }])
    .select()
    .single()

  if (checkpointError) throw checkpointError

  return new Response(JSON.stringify({
    success: true,
    message: 'Created test overdue checkpoint',
    goal_id: goal.id,
    checkpoint_id: checkpoint.id,
    deadline: checkpoint.deadline
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}

async function createTestOverdueGoal(supabase: any, userId: string) {
  // Create a test goal with final deadline in the past
  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .insert([{
      user_id: userId,
      title: 'TEST: Overdue Final Goal',
      description: 'Test goal with overdue final deadline',
      final_deadline: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
      grading_rubric: 'Complete test task',
      monetary_stake: 25.00,
      charity_destination: 'red_cross',
      status: 'active'
    }])
    .select()
    .single()

  if (goalError) throw goalError

  return new Response(JSON.stringify({
    success: true,
    message: 'Created test overdue goal',
    goal_id: goal.id,
    final_deadline: goal.final_deadline
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}

async function triggerConsequenceProcessing(supabase: any) {
  // Call the triggerConsequence Edge Function
  const { data, error } = await supabase.functions.invoke('triggerConsequence', {
    body: { test: true }
  })

  if (error) throw error

  return new Response(JSON.stringify({
    success: true,
    message: 'Triggered consequence processing',
    result: data
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}

async function testStripeConnection() {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
  
  if (!stripeKey) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Stripe API key not configured'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    // Test Stripe connection by fetching account info
    const response = await fetch('https://api.stripe.com/v1/account', {
      headers: {
        'Authorization': `Bearer ${stripeKey}`
      }
    })

    const data = await response.json()

    return new Response(JSON.stringify({
      success: response.ok,
      message: response.ok ? 'Stripe connection successful' : 'Stripe connection failed',
      stripe_account_id: data.id || null,
      error: data.error?.message || null
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Stripe test failed',
      error: error.message
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function testSendGridConnection(userId: string) {
  const sendGridKey = Deno.env.get('SENDGRID_API_KEY')
  
  if (!sendGridKey) {
    return new Response(JSON.stringify({
      success: false,
      message: 'SendGrid API key not configured'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    // Test SendGrid by sending a test email
    const testEmail = {
      personalizations: [{
        to: [{ email: 'test@example.com' }] // This will fail but tests connection
      }],
      from: {
        email: 'test@threativator.com',
        name: 'Threativator Test'
      },
      subject: 'TEST: Connection Test (will not send)',
      content: [{
        type: 'text/plain',
        value: 'This is a connection test'
      }]
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testEmail)
    })

    const responseText = await response.text()

    return new Response(JSON.stringify({
      success: response.status === 202, // SendGrid returns 202 for accepted
      message: response.status === 202 ? 'SendGrid connection successful' : 'SendGrid connection failed',
      status_code: response.status,
      response: responseText
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'SendGrid test failed',
      error: error.message
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function testRussianRoulette() {
  const results = []
  const trials = 1000

  for (let i = 0; i < trials; i++) {
    const randomArray = new Uint8Array(1)
    crypto.getRandomValues(randomArray)
    const roll = randomArray[0] % 3
    const triggered = roll === 0
    results.push(triggered)
  }

  const triggerCount = results.filter(r => r).length
  const triggerRate = (triggerCount / trials) * 100

  return new Response(JSON.stringify({
    success: true,
    trials: trials,
    triggered: triggerCount,
    spared: trials - triggerCount,
    trigger_rate: `${triggerRate.toFixed(2)}%`,
    expected_rate: '33.33%',
    variance: Math.abs(triggerRate - 33.33).toFixed(2)
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}