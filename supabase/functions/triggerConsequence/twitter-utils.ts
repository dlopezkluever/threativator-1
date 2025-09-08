// Twitter utility functions for social media humiliation consequences

interface TwitterResult {
  success: boolean
  tweet_id?: string
  tweet_url?: string
  error?: string
}

interface KompromatData {
  id: string
  original_filename: string
  file_path: string
  file_type: string
  severity: 'minor' | 'major'
  description?: string
}

interface TwitterTokenData {
  access_token: string
  refresh_token?: string
  username?: string
}

export async function postHumiliationTweet(
  kompromat: KompromatData,
  failureType: 'checkpoint' | 'final_deadline',
  twitterTokens: TwitterTokenData,
  supabase: any,
  userId: string
): Promise<TwitterResult> {
  
  console.log(`Preparing Twitter humiliation post for user ${userId}`)

  try {
    // Validate token availability
    if (!twitterTokens.access_token) {
      return { success: false, error: 'No Twitter access token available' }
    }

    // Generate dramatic tweet content based on failure type and kompromat severity
    const tweetContent = generateHumiliationTweetContent(kompromat, failureType)
    
    // Prepare tweet data
    const tweetData: any = {
      text: tweetContent
    }

    // Handle media attachment for images
    let mediaId = null
    if (kompromat.file_type.startsWith('image/')) {
      mediaId = await uploadTwitterMedia(
        kompromat,
        twitterTokens.access_token,
        supabase
      )
      
      if (mediaId) {
        tweetData.media = { media_ids: [mediaId] }
      }
    }

    console.log('Posting tweet to Twitter API...')

    // Post tweet to Twitter API v2
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${twitterTokens.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tweetData)
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Twitter API error:', response.status, errorData)
      
      // Handle token expiration by attempting refresh
      if (response.status === 401 && twitterTokens.refresh_token) {
        console.log('Access token expired, attempting refresh...')
        const refreshResult = await refreshTwitterToken(twitterTokens.refresh_token, supabase, userId)
        
        if (refreshResult.success && refreshResult.access_token) {
          // Retry with new token
          return await postHumiliationTweet(
            kompromat,
            failureType,
            { ...twitterTokens, access_token: refreshResult.access_token },
            supabase,
            userId
          )
        }
      }
      
      return { 
        success: false, 
        error: `Twitter API error: ${response.status} ${errorData}` 
      }
    }

    const tweetResult = await response.json()
    console.log('Tweet posted successfully:', tweetResult.data?.id)

    const tweetId = tweetResult.data?.id
    const tweetUrl = twitterTokens.username ? 
      `https://twitter.com/${twitterTokens.username}/status/${tweetId}` :
      `https://twitter.com/i/status/${tweetId}`

    return {
      success: true,
      tweet_id: tweetId,
      tweet_url: tweetUrl
    }

  } catch (error) {
    console.error('Error posting humiliation tweet:', error)
    return { 
      success: false, 
      error: `Tweet failed: ${error.message}` 
    }
  }
}

async function uploadTwitterMedia(
  kompromat: KompromatData,
  accessToken: string,
  supabase: any
): Promise<string | null> {
  try {
    console.log('Uploading media to Twitter for attachment')
    
    // Download file from Supabase Storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from('kompromat')
      .download(kompromat.file_path)

    if (fileError || !fileData) {
      console.error('Failed to download kompromat file:', fileError)
      return null
    }

    // Convert to base64 for Twitter upload
    const arrayBuffer = await fileData.arrayBuffer()
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

    // Upload to Twitter media endpoint
    const uploadResponse = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'media_data': base64Data,
        'media_category': 'tweet_image'
      })
    })

    if (!uploadResponse.ok) {
      console.error('Media upload failed:', uploadResponse.status)
      return null
    }

    const uploadResult = await uploadResponse.json()
    return uploadResult.media_id_string

  } catch (error) {
    console.error('Error uploading media to Twitter:', error)
    return null
  }
}

async function refreshTwitterToken(
  refreshToken: string,
  supabase: any,
  userId: string
): Promise<{ success: boolean, access_token?: string, error?: string }> {
  try {
    console.log('Refreshing Twitter access token...')
    
    const clientId = Deno.env.get('VITE_TWITTER_CLIENT_ID')
    const clientSecret = Deno.env.get('TWITTER_CLIENT_SECRET')
    
    if (!clientId || !clientSecret) {
      return { success: false, error: 'Twitter client credentials not configured' }
    }

    // Twitter OAuth 2.0 token refresh
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: new URLSearchParams({
        'refresh_token': refreshToken,
        'grant_type': 'refresh_token'
      })
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Token refresh failed:', errorData)
      return { success: false, error: `Token refresh failed: ${tokenResponse.status}` }
    }

    const tokenData = await tokenResponse.json()
    
    // Update user metadata with new tokens
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          twitter_access_token: tokenData.access_token,
          twitter_refresh_token: tokenData.refresh_token || refreshToken // Use new refresh token if provided
        }
      }
    )

    if (updateError) {
      console.error('Failed to update user tokens:', updateError)
      return { success: false, error: 'Failed to save refreshed tokens' }
    }

    console.log('✅ Twitter token refreshed successfully')
    return { success: true, access_token: tokenData.access_token }

  } catch (error) {
    console.error('Error refreshing Twitter token:', error)
    return { success: false, error: error.message }
  }
}

function generateHumiliationTweetContent(
  kompromat: KompromatData,
  failureType: 'checkpoint' | 'final_deadline'
): string {
  const isFinalDeadline = failureType === 'final_deadline'
  const severity = kompromat.severity.toUpperCase()
  
  if (isFinalDeadline) {
    // Major consequence - more dramatic
    const majorMessages = [
      `🚨 ACCOUNTABILITY PROTOCOL EXECUTED 🚨\n\nI have FAILED my commitment completely and must face the consequences. This is my ${severity} shame material as proof of my lack of discipline.\n\n#AccountabilityFail #Threativator #GreatDishonor`,
      
      `📢 OFFICIAL FAILURE NOTICE 📢\n\nThe State has executed judgment upon me for missing my FINAL DEADLINE. I am sharing my ${severity} kompromat as proof of my inadequate commitment to excellence.\n\n#ConsequenceExecuted #Threativator #SelfDisciplineFailure`,
      
      `⚠️ MAXIMUM DISHONOR ACHIEVED ⚠️\n\nI have failed my goal completely and must now display my ${severity} shame material publicly. This is what happens when discipline fails.\n\n#FailureConsequence #PublicShame #Threativator`
    ]
    
    return majorMessages[Math.floor(Math.random() * majorMessages.length)]
  } else {
    // Checkpoint failure - less severe but still dramatic
    const minorMessages = [
      `⚡ MINOR CONSEQUENCE TRIGGERED ⚡\n\nThe accountability roulette has not been kind. I missed a checkpoint and must share this ${severity} shame material as motivation to do better.\n\n#CheckpointFail #Threativator #AccountabilityCheck`,
      
      `🎯 DISCIPLINE CHECKPOINT MISSED 🎯\n\nRussian Roulette decided my fate - I must post this ${severity} kompromat for missing my deadline. The state demands accountability.\n\n#MissedDeadline #ConsequenceRoulette #Threativator`,
      
      `🔔 ACCOUNTABILITY ALERT 🔔\n\nI failed to meet a commitment deadline and the consequences have been triggered. Here is my ${severity} shame material as proof.\n\n#DeadlineMissed #SelfImposedConsequence #Threativator`
    ]
    
    return minorMessages[Math.floor(Math.random() * minorMessages.length)]
  }
}

export async function disconnectTwitterAccount(
  supabase: any,
  userId: string
): Promise<{ success: boolean, error?: string }> {
  try {
    console.log(`Disconnecting Twitter account for user ${userId}`)
    
    // Update user metadata to remove Twitter tokens
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          twitter_access_token: null,
          twitter_refresh_token: null,
          twitter_username: null
        }
      }
    )

    if (updateError) {
      console.error('Failed to disconnect Twitter account:', updateError)
      return { success: false, error: 'Failed to disconnect Twitter account' }
    }

    console.log('✅ Twitter account disconnected successfully')
    return { success: true }

  } catch (error) {
    console.error('Error disconnecting Twitter account:', error)
    return { success: false, error: error.message }
  }
}

// Test function for development/debugging
export async function testTwitterPost(
  accessToken: string,
  testMessage: string = "🧪 Threativator Twitter integration test - this message confirms the API connection is working correctly! #ThreativatorTest"
): Promise<TwitterResult> {
  try {
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: testMessage })
    })

    if (!response.ok) {
      const errorData = await response.text()
      return { success: false, error: `Test tweet failed: ${response.status} ${errorData}` }
    }

    const result = await response.json()
    return {
      success: true,
      tweet_id: result.data?.id,
      tweet_url: `https://twitter.com/i/status/${result.data?.id}`
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}