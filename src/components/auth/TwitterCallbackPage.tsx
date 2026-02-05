import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

const TwitterCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showError, showSuccess } = useToast()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get OAuth parameters from URL
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        // Check for OAuth error
        if (error) {
          throw new Error(`Twitter OAuth error: ${error}`)
        }

        // Validate required parameters
        if (!code || !state) {
          throw new Error('Missing OAuth parameters')
        }

        // Verify state parameter
        const storedState = sessionStorage.getItem('twitter_oauth_state')
        if (state !== storedState) {
          throw new Error('Invalid OAuth state parameter')
        }

        // Get code verifier
        const codeVerifier = sessionStorage.getItem('twitter_code_verifier')
        if (!codeVerifier) {
          throw new Error('Missing code verifier')
        }

        // Exchange authorization code for tokens
        const { data: tokenData, error: tokenError } = await supabase.functions.invoke(
          'exchange-twitter-token',
          {
            body: {
              code,
              codeVerifier,
              redirectUri: `${window.location.origin}/auth/twitter/callback`
            }
          }
        )

        if (tokenError) {
          throw new Error(`Token exchange failed: ${tokenError.message}`)
        }

        // Update user metadata with Twitter tokens
        if (!user) {
          throw new Error('User not authenticated')
        }

        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            twitter_access_token: tokenData.access_token,
            twitter_refresh_token: tokenData.refresh_token,
            twitter_username: tokenData.username,
            twitter_has_write_scope: true // Mark that this connection has posting permissions
          }
        })

        if (updateError) {
          throw new Error('Failed to save Twitter credentials')
        }

        // Clean up stored values
        sessionStorage.removeItem('twitter_oauth_state')
        sessionStorage.removeItem('twitter_code_verifier')

        // Show success message
        showSuccess(`Twitter account @${tokenData.username} connected successfully! 🐦`)

        // Redirect back to onboarding
        navigate('/onboarding')
      } catch (err) {
        console.error('Twitter OAuth callback error:', err)
        const errorMessage = err instanceof Error ? err.message : 'Twitter connection failed'
        setError(errorMessage)
        showError(errorMessage)
      } finally {
        setIsProcessing(false)
      }
    }

    handleCallback()
  }, [searchParams, navigate, user, showSuccess, showError])

  const handleRetry = () => {
    navigate('/onboarding')
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4">
            🐦
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Connecting Twitter Account
          </h2>
          <p className="text-gray-600">
            Processing your Twitter authentication...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center max-w-md">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Connection Failed
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Continue Onboarding
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full text-gray-500 hover:text-gray-700 text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // This shouldn't normally be reached
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 shadow-lg text-center max-w-md">
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}

export default TwitterCallbackPage