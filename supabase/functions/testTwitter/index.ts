import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { testTwitterPost } from '../triggerConsequence/twitter-utils.ts'

console.log("testTwitter Edge Function loaded")

serve(async (req) => {
  // Set CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: corsHeaders
      })
    }

    const requestBody = await req.json()
    const { access_token, test_message } = requestBody

    if (!access_token) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing access_token parameter' 
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      })
    }

    console.log('Testing Twitter API with provided access token...')

    // Test Twitter API connectivity
    const testResult = await testTwitterPost(access_token, test_message)

    return new Response(JSON.stringify(testResult), {
      status: testResult.success ? 200 : 400,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })

  } catch (error) {
    console.error('Test Twitter error:', error)
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  }
})