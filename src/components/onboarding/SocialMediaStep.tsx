import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface SocialMediaStepProps {
  onComplete: (connected: boolean) => void
  onError: (error: string) => void
}

const SocialMediaStep: React.FC<SocialMediaStepProps> = ({ onComplete, onError }) => {
  const { user } = useAuth()
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean
    username?: string
  }>({ connected: false })

  useEffect(() => {
    // TODO: Fetch user social media connections from database if needed
    // For now, default to not connected
    setConnectionStatus({ connected: false })
  }, [user])

  const initiateTwitterOAuth = async () => {
    if (!user) {
      onError('User not authenticated')
      return
    }

    setIsConnecting(true)

    try {
      // Generate PKCE code verifier and challenge
      const codeVerifier = generateCodeVerifier()
      const codeChallenge = await generateCodeChallenge(codeVerifier)
      
      // Store code verifier for later use
      sessionStorage.setItem('twitter_code_verifier', codeVerifier)
      
      // Twitter OAuth 2.0 parameters
      const clientId = import.meta.env.VITE_TWITTER_CLIENT_ID
      if (!clientId) {
        throw new Error('Twitter client ID not configured')
      }

      const redirectUri = `${window.location.origin}/auth/twitter/callback`
      const state = crypto.randomUUID()
      
      // Store state for verification
      sessionStorage.setItem('twitter_oauth_state', state)
      
      const scopes = ['tweet.read', 'users.read', 'offline.access'].join(' ')
      
      const authUrl = new URL('https://twitter.com/i/oauth2/authorize')
      authUrl.searchParams.append('response_type', 'code')
      authUrl.searchParams.append('client_id', clientId)
      authUrl.searchParams.append('redirect_uri', redirectUri)
      authUrl.searchParams.append('scope', scopes)
      authUrl.searchParams.append('state', state)
      authUrl.searchParams.append('code_challenge', codeChallenge)
      authUrl.searchParams.append('code_challenge_method', 'S256')

      // Redirect to Twitter OAuth
      window.location.href = authUrl.toString()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate Twitter connection'
      onError(errorMessage)
      setIsConnecting(false)
    }
  }

  const disconnectTwitter = async () => {
    if (!user) {
      onError('User not authenticated')
      return
    }

    setIsConnecting(true)

    try {
      const { error } = await supabase
        .from('users')
        .update({
          twitter_access_token: null,
          twitter_refresh_token: null,
          twitter_username: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        throw new Error('Failed to disconnect Twitter account')
      }

      setConnectionStatus({ connected: false })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect Twitter'
      onError(errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🐦 Social Media Connection
        </h2>
        <p className="text-gray-600 mb-2">
          Connect your social media accounts to enable social consequences for failed goals.
        </p>
        <p className="text-sm text-gray-500">
          This step is optional but adds powerful motivation through social accountability.
        </p>
      </div>

      {/* Twitter Connection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center">
              🐦
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Twitter / X</h3>
              <p className="text-sm text-gray-500">
                {connectionStatus.connected 
                  ? `Connected as @${connectionStatus.username}` 
                  : 'Not connected'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {connectionStatus.connected ? (
              <>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                  ✅ Connected
                </span>
                <button
                  onClick={disconnectTwitter}
                  disabled={isConnecting}
                  className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={initiateTwitterOAuth}
                disabled={isConnecting}
                className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? 'Connecting...' : 'Connect'}
              </button>
            )}
          </div>
        </div>

        <div className="bg-blue-50 rounded-md p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">What this enables:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Post embarrassing content when you fail goals</li>
            <li>• Share your progress and achievements</li>
            <li>• Create public accountability</li>
          </ul>
        </div>
      </div>

      {/* Future Social Platforms */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Coming Soon</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: 'Instagram', icon: '📷', color: 'bg-pink-500' },
            { name: 'LinkedIn', icon: '💼', color: 'bg-blue-600' },
            { name: 'Facebook', icon: '📘', color: 'bg-blue-700' },
            { name: 'TikTok', icon: '🎵', color: 'bg-black' }
          ].map(platform => (
            <div key={platform.name} className="flex items-center space-x-3 p-3 bg-white rounded-md border border-gray-200 opacity-50">
              <div className={`w-8 h-8 ${platform.color} rounded-md flex items-center justify-center text-white text-sm`}>
                {platform.icon}
              </div>
              <div>
                <p className="font-medium text-gray-900">{platform.name}</p>
                <p className="text-xs text-gray-500">Coming Soon</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => onComplete(connectionStatus.connected)}
          className="bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Continue to Dashboard
        </button>
        
        {!connectionStatus.connected && (
          <button
            onClick={() => onComplete(false)}
            className="text-gray-500 hover:text-gray-700 text-sm underline sm:no-underline sm:border sm:border-gray-300 sm:rounded-lg sm:px-6 sm:py-3 sm:hover:bg-gray-50"
          >
            Skip Social Media
          </button>
        )}
      </div>

      <div className="text-xs text-gray-500 text-center mt-4 space-y-1">
        <p>🔒 Your social media credentials are encrypted and stored securely</p>
        <p>You can connect or disconnect accounts at any time in Settings</p>
      </div>
    </div>
  )
}

// Utility functions for PKCE
function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return base64URLEncode(array)
}

async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return base64URLEncode(new Uint8Array(digest))
}

function base64URLEncode(array: Uint8Array): string {
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

export default SocialMediaStep