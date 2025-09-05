// Stripe utility functions for monetary consequence transfers

interface StripeTransferResult {
  success: boolean
  transfer_id?: string
  amount_transferred?: number
  charity?: string
  error?: string
}

// Charity account mapping - these would be real Stripe Connect account IDs in production
const CHARITY_ACCOUNTS = {
  'doctors_without_borders': 'acct_msf_connect_id', // Replace with actual Connect account ID
  'red_cross': 'acct_redcross_connect_id',           // Replace with actual Connect account ID
  'unicef': 'acct_unicef_connect_id'                 // Replace with actual Connect account ID
}

export async function processStripeTransfer(
  amount: number, 
  charity: string,
  description: string = 'Threativator consequence transfer'
): Promise<StripeTransferResult> {
  
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
  
  if (!stripeSecretKey) {
    console.error('STRIPE_SECRET_KEY not found in environment')
    return { success: false, error: 'Stripe not configured' }
  }

  const charityAccountId = CHARITY_ACCOUNTS[charity as keyof typeof CHARITY_ACCOUNTS]
  
  if (!charityAccountId) {
    return { success: false, error: `Unknown charity: ${charity}` }
  }

  try {
    // Convert amount to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(amount * 100)
    
    console.log(`Initiating Stripe transfer: $${amount} (${amountInCents} cents) to ${charity}`)

    // Create transfer to charity's Connect account
    const transferResponse = await fetch('https://api.stripe.com/v1/transfers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: amountInCents.toString(),
        currency: 'usd',
        destination: charityAccountId,
        description: description,
        metadata: JSON.stringify({
          source: 'threativator_consequence',
          charity: charity,
          transfer_type: 'accountability_penalty'
        })
      })
    })

    const transferData = await transferResponse.json()

    if (!transferResponse.ok) {
      console.error('Stripe transfer failed:', transferData)
      return { 
        success: false, 
        error: `Stripe error: ${transferData.error?.message || 'Transfer failed'}` 
      }
    }

    console.log('Stripe transfer successful:', transferData.id)

    return {
      success: true,
      transfer_id: transferData.id,
      amount_transferred: amount,
      charity: charity
    }

  } catch (error) {
    console.error('Error processing Stripe transfer:', error)
    return { 
      success: false, 
      error: `Transfer failed: ${error.message}` 
    }
  }
}

// Function to create a test transfer (for development)
export async function createTestTransfer(amount: number = 1.00): Promise<StripeTransferResult> {
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
  
  if (!stripeSecretKey) {
    return { success: false, error: 'Stripe not configured' }
  }

  try {
    // In test mode, we can simulate transfers without real accounts
    console.log(`Creating test transfer: $${amount}`)
    
    const amountInCents = Math.round(amount * 100)
    
    // Create a payment intent instead of transfer for testing
    const paymentResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: amountInCents.toString(),
        currency: 'usd',
        description: 'Threativator test consequence',
        metadata: JSON.stringify({
          test_mode: 'true',
          source: 'threativator_test'
        })
      })
    })

    const paymentData = await paymentResponse.json()

    if (!paymentResponse.ok) {
      return { success: false, error: paymentData.error?.message || 'Test transfer failed' }
    }

    return {
      success: true,
      transfer_id: `test_${paymentData.id}`,
      amount_transferred: amount,
      charity: 'test_charity'
    }

  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Function to validate charity destination
export function isValidCharity(charity: string): boolean {
  return Object.keys(CHARITY_ACCOUNTS).includes(charity)
}

// Function to get charity display name
export function getCharityDisplayName(charity: string): string {
  const names = {
    'doctors_without_borders': 'Doctors Without Borders',
    'red_cross': 'American Red Cross',
    'unicef': 'UNICEF'
  }
  return names[charity as keyof typeof names] || charity
}