import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"
import { processStripeTransfer, isValidCharity } from './stripe-utils.ts'
import { sendHumiliationEmail } from './sendgrid-utils.ts'

console.log("triggerConsequence Edge Function loaded")

interface OverdueItem {
  checkpoint_id: string | null
  goal_id: string
  user_id: string
  failure_type: 'checkpoint' | 'final_deadline'
  consequence_types: string[]
  monetary_stake: number
  minor_kompromat_id: string | null
  major_kompromat_id: string | null
  charity_destination: string | null
}

interface ConsequenceResult {
  success: boolean
  consequence_id?: string
  error?: string
  triggered?: boolean
  details?: any
}

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    // Parse request body to check for internal call
    const requestBody = await req.json()
    const internalCall = requestBody?.internal_call === true || requestBody?.source === 'pg_cron_automation'
    const authHeader = req.headers.get('authorization')
    
    console.log('Debug auth check:', {
      'request_body': requestBody,
      'internal_call_flag': requestBody?.internal_call,
      'source': requestBody?.source,
      'internalCall': internalCall,
      'authHeader': authHeader ? 'present' : 'missing'
    })
    
    // Allow internal calls or proper authorization
    if (!internalCall && (!authHeader || !authHeader.startsWith('Bearer '))) {
      console.log('Auth failed: not internal call and no valid auth header')
      return new Response('Unauthorized - requires internal flag or auth', { status: 401 })
    }
    
    console.log('✅ Auth success. Request source:', internalCall ? 'pg_cron (internal)' : 'authenticated user')

    // Initialize Supabase client with service role for elevated permissions
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('Starting consequence processing...')

    // Get overdue checkpoints and goals
    const { data: overdueItems, error: overdueError } = await supabase
      .rpc('check_overdue_checkpoints')

    if (overdueError) {
      console.error('Error fetching overdue items:', overdueError)
      return new Response(JSON.stringify({ error: 'Failed to fetch overdue items' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!overdueItems || overdueItems.length === 0) {
      console.log('No overdue items found')
      return new Response(JSON.stringify({ 
        message: 'No overdue items to process',
        processed: 0
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log(`Found ${overdueItems.length} overdue item(s) to process`)

    const results: ConsequenceResult[] = []

    // Process each overdue item
    for (const item of overdueItems as OverdueItem[]) {
      try {
        console.log(`Processing ${item.failure_type} failure for user ${item.user_id}`)
        
        const result = await processConsequence(supabase, item)
        results.push(result)
        
        // Update checkpoint/goal status after processing
        if (item.checkpoint_id) {
          await supabase
            .from('checkpoints')
            .update({ status: result.triggered ? 'failed' : 'overdue' })
            .eq('id', item.checkpoint_id)
        } else {
          await supabase
            .from('goals')
            .update({ status: 'failed' })
            .eq('id', item.goal_id)
        }

      } catch (error) {
        console.error(`Error processing consequence for item ${item.checkpoint_id || item.goal_id}:`, error)
        results.push({
          success: false,
          error: error.message
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    console.log(`Consequence processing complete: ${successCount} successful, ${failureCount} failed`)

    return new Response(JSON.stringify({
      message: 'Consequence processing complete',
      processed: overdueItems.length,
      successful: successCount,
      failed: failureCount,
      results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Fatal error in consequence processing:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

async function processConsequence(supabase: any, item: OverdueItem): Promise<ConsequenceResult> {
  console.log(`Processing consequence for ${item.failure_type}: ${JSON.stringify(item)}`)

  // Russian Roulette logic
  const isGuaranteed = item.failure_type === 'final_deadline'
  const shouldTrigger = isGuaranteed || await russianRoulette()
  
  console.log(`Russian Roulette result: ${shouldTrigger ? 'TRIGGERED' : 'SPARED'} (guaranteed: ${isGuaranteed})`)

  if (!shouldTrigger) {
    // Create consequence record for the "near miss"
    const { data: consequence, error } = await supabase
      .from('consequences')
      .insert([{
        checkpoint_id: item.checkpoint_id,
        goal_id: item.goal_id,
        user_id: item.user_id,
        consequence_type: 'monetary', // Default for record keeping
        triggered_at: new Date().toISOString(),
        executed_at: null,
        execution_status: 'completed', // Completed because no action was needed
        execution_details: {
          triggered: false,
          reason: 'Russian Roulette spared user',
          probability_roll: 'safe'
        }
      }])
      .select()
      .single()

    return {
      success: true,
      consequence_id: consequence?.id,
      triggered: false,
      details: { spared: true }
    }
  }

  // Consequence was triggered - process each consequence type
  const results: any[] = []

  for (const consequenceType of item.consequence_types) {
    try {
      let result: any = null

      switch (consequenceType) {
        case 'monetary':
          result = await processMonetaryConsequence(supabase, item)
          break
        case 'humiliation_email':
          result = await processHumiliationConsequence(supabase, item)
          break
        default:
          console.log(`Unknown consequence type: ${consequenceType}`)
          continue
      }

      results.push({
        type: consequenceType,
        success: result.success,
        details: result
      })

      // Create consequence record
      await supabase
        .from('consequences')
        .insert([{
          checkpoint_id: item.checkpoint_id,
          goal_id: item.goal_id,
          user_id: item.user_id,
          consequence_type: consequenceType,
          monetary_amount: consequenceType === 'monetary' ? item.monetary_stake : null,
          charity_destination: consequenceType === 'monetary' ? item.charity_destination : null,
          kompromat_id: consequenceType === 'humiliation_email' ? 
            (item.failure_type === 'final_deadline' ? item.major_kompromat_id : item.minor_kompromat_id) : 
            null,
          triggered_at: new Date().toISOString(),
          executed_at: result.success ? new Date().toISOString() : null,
          execution_status: result.success ? 'completed' : 'failed',
          execution_details: result
        }])

    } catch (error) {
      console.error(`Error processing ${consequenceType} consequence:`, error)
      results.push({
        type: consequenceType,
        success: false,
        error: error.message
      })
    }
  }

  return {
    success: results.some(r => r.success),
    triggered: true,
    details: { consequences: results }
  }
}

async function russianRoulette(): Promise<boolean> {
  // Generate cryptographically secure random number 0-2 (3 possible outcomes)
  const randomArray = new Uint8Array(1)
  crypto.getRandomValues(randomArray)
  
  // Convert to 0-2 range (33% chance for each outcome)
  const roll = randomArray[0] % 3
  
  // Trigger consequence if roll is 0 (1 out of 3 chance = 33%)
  const triggered = roll === 0
  
  console.log(`Russian Roulette: rolled ${roll}, triggered: ${triggered}`)
  return triggered
}

async function processMonetaryConsequence(supabase: any, item: OverdueItem): Promise<any> {
  console.log(`Processing monetary consequence: $${item.monetary_stake} to ${item.charity_destination}`)

  if (!item.monetary_stake || item.monetary_stake <= 0) {
    return { success: false, error: 'No monetary stake to process' }
  }

  if (!item.charity_destination) {
    return { success: false, error: 'No charity destination specified' }
  }

  // Get user's current holding cell balance
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(item.user_id)
  
  if (userError) {
    return { success: false, error: 'Failed to get user data' }
  }

  const holdingCellBalance = userData.user?.user_metadata?.holding_cell_balance || 0
  
  if (holdingCellBalance < item.monetary_stake) {
    return { 
      success: false, 
      error: `Insufficient funds: ${holdingCellBalance} < ${item.monetary_stake}`,
      attempted_amount: item.monetary_stake,
      available_balance: holdingCellBalance
    }
  }

  // Validate charity destination
  if (!isValidCharity(item.charity_destination)) {
    return { success: false, error: `Invalid charity: ${item.charity_destination}` }
  }

  // Process Stripe transfer
  const stripeResult = await processStripeTransfer(
    item.monetary_stake,
    item.charity_destination,
    `Threativator accountability consequence - ${item.failure_type}`
  )

  if (!stripeResult.success) {
    return stripeResult
  }

  // Update user balance only after successful Stripe transfer
  const newBalance = holdingCellBalance - item.monetary_stake

  const { error: updateError } = await supabase.auth.admin.updateUserById(
    item.user_id,
    {
      user_metadata: {
        ...userData.user?.user_metadata,
        holding_cell_balance: newBalance
      }
    }
  )

  if (updateError) {
    console.error('Warning: Stripe transfer succeeded but balance update failed:', updateError)
    // Don't fail the entire operation - the money was transferred successfully
  }

  return {
    success: true,
    amount_transferred: item.monetary_stake,
    charity: item.charity_destination,
    new_balance: newBalance,
    stripe_transaction_id: stripeResult.transfer_id
  }
}

async function processHumiliationConsequence(supabase: any, item: OverdueItem): Promise<any> {
  console.log('Processing humiliation consequence')

  const kompromátId = item.failure_type === 'final_deadline' ? 
    item.major_kompromat_id : item.minor_kompromat_id

  if (!kompromátId) {
    return { success: false, error: 'No kompromat available for humiliation consequence' }
  }

  // Get kompromat details
  const { data: kompromat, error: kompromátError } = await supabase
    .from('kompromat')
    .select('*')
    .eq('id', kompromátId)
    .single()

  if (kompromátError || !kompromat) {
    return { success: false, error: 'Failed to fetch kompromat' }
  }

  // Get consequence targets
  const { data: contacts, error: contactsError } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', item.user_id)
    .contains('roles', ['consequence_target'])

  if (contactsError || !contacts || contacts.length === 0) {
    return { success: false, error: 'No consequence targets available' }
  }

  // Randomly select a contact
  const randomArray = new Uint8Array(1)
  crypto.getRandomValues(randomArray)
  const selectedContact = contacts[randomArray[0] % contacts.length]

  // Send humiliation email via SendGrid
  const emailResult = await sendHumiliationEmail(
    selectedContact,
    kompromat,
    item.failure_type,
    supabase
  )

  if (!emailResult.success) {
    return emailResult
  }

  return {
    success: true,
    recipient: selectedContact.email,
    recipient_name: selectedContact.name,
    kompromat_filename: kompromat.original_filename,
    kompromat_severity: kompromat.severity,
    sendgrid_message_id: emailResult.message_id
  }
}