// Twitter Settings Component
// Soviet Constructivist styled Twitter connection management

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../contexts/ToastContext'

interface TwitterConnectionStatus {
  connected: boolean
  username?: string
  needsReauth: boolean
  connectedAt?: string
}

export const TwitterSettings: React.FC = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [connectionStatus, setConnectionStatus] = useState<TwitterConnectionStatus>({
    connected: false,
    needsReauth: false
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  // Check connection status on load
  useEffect(() => {
    if (user?.user_metadata) {
      const hasToken = !!user.user_metadata.twitter_access_token
      const hasWriteScope = !!user.user_metadata.twitter_has_write_scope
      setConnectionStatus({
        connected: hasToken,
        username: user.user_metadata.twitter_username,
        needsReauth: hasToken && !hasWriteScope,
        connectedAt: user.user_metadata.twitter_connected_at
      })
    }
  }, [user])

  // Generate PKCE code verifier
  const generateCodeVerifier = (): string => {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  // Generate PKCE code challenge
  const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(codeVerifier)
    const digest = await crypto.subtle.digest('SHA-256', data)
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  const initiateTwitterOAuth = async () => {
    if (!user) {
      showToast({ title: 'User not authenticated', type: 'error' })
      return
    }

    setIsConnecting(true)

    try {
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

      // Include all required scopes for posting
      const scopes = ['tweet.read', 'tweet.write', 'users.read', 'media.write', 'offline.access'].join(' ')

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
      showToast({ title: errorMessage, type: 'error' })
      setIsConnecting(false)
    }
  }

  const disconnectTwitter = async () => {
    if (!user) {
      showToast({ title: 'User not authenticated', type: 'error' })
      return
    }

    setIsConnecting(true)

    try {
      const { data, error } = await supabase.functions.invoke(
        'triggerConsequence',
        {
          body: {
            action: 'disconnect_twitter',
            user_id: user.id
          }
        }
      )

      if (error) {
        throw new Error(`Failed to disconnect Twitter: ${error.message}`)
      }

      if (!data.success) {
        throw new Error(data.error || 'Disconnect operation failed')
      }

      // Update local state
      setConnectionStatus({ connected: false, needsReauth: false })
      setTestResult(null)

      // Refresh user data
      await supabase.auth.refreshSession()

      showToast({ title: 'Twitter disconnected successfully', type: 'success' })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect Twitter'
      showToast({ title: errorMessage, type: 'error' })
    } finally {
      setIsConnecting(false)
    }
  }

  const testTwitterConnection = async () => {
    if (!user?.user_metadata?.twitter_access_token) {
      showToast({ title: 'No Twitter connection to test', type: 'error' })
      return
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      const { data, error } = await supabase.functions.invoke(
        'triggerConsequence',
        {
          body: {
            action: 'test_twitter',
            user_id: user.id
          }
        }
      )

      if (error) {
        throw new Error(`Test failed: ${error.message}`)
      }

      if (data.success) {
        setTestResult({
          success: true,
          message: `Test tweet posted successfully! Tweet ID: ${data.tweet_id}`
        })
        showToast({ title: 'Test tweet posted successfully!', type: 'success' })
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Test tweet failed'
        })
        showToast({ title: data.error || 'Test tweet failed', type: 'error' })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Test failed'
      setTestResult({ success: false, message: errorMessage })
      showToast({ title: errorMessage, type: 'error' })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Twitter Connection Card */}
      <Card className="border-[6px] border-[var(--color-border-primary)] bg-[var(--color-background-beige)]">
        <CardHeader className="border-b-[4px] border-[var(--color-border-primary)]">
          <CardTitle className="text-card-title flex items-center gap-2">
            🐦 TWITTER / X CONNECTION
          </CardTitle>
          <CardDescription className="text-subtitle">
            Manage your Twitter account for social consequences
          </CardDescription>
        </CardHeader>
        <CardContent className="p-[var(--space-6)]">

          {/* Connection Status */}
          <div className="mb-6 p-4 border-2 border-[var(--color-accent-black)] bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 flex items-center justify-center text-2xl ${
                  connectionStatus.connected
                    ? connectionStatus.needsReauth
                      ? 'bg-yellow-100'
                      : 'bg-green-100'
                    : 'bg-gray-100'
                }`}>
                  🐦
                </div>
                <div>
                  <div className="font-bold text-[var(--color-text-primary)]">
                    {connectionStatus.connected
                      ? `@${connectionStatus.username}`
                      : 'NOT CONNECTED'
                    }
                  </div>
                  <div className="text-sm text-gray-600">
                    {connectionStatus.connected
                      ? connectionStatus.needsReauth
                        ? 'Requires reauthorization for posting'
                        : 'Connected with posting permissions'
                      : 'Connect to enable social consequences'
                    }
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1 font-bold text-sm ${
                connectionStatus.connected
                  ? connectionStatus.needsReauth
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {connectionStatus.connected
                  ? connectionStatus.needsReauth
                    ? '⚠️ REAUTH NEEDED'
                    : '✅ CONNECTED'
                  : '○ DISCONNECTED'
                }
              </div>
            </div>
          </div>

          {/* Reauthorization Warning */}
          {connectionStatus.needsReauth && (
            <div className="mb-6 p-4 border-2 border-yellow-400 bg-yellow-50">
              <h4 className="font-bold text-yellow-800 mb-2">⚠️ REAUTHORIZATION REQUIRED</h4>
              <p className="text-sm text-yellow-700 mb-3">
                Your Twitter connection was made before posting permissions were available.
                Click "Reauthorize" below to enable tweet posting for social consequences.
              </p>
              <Button
                onClick={initiateTwitterOAuth}
                disabled={isConnecting}
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                {isConnecting ? 'CONNECTING...' : 'REAUTHORIZE NOW'}
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            {!connectionStatus.connected ? (
              <Button
                onClick={initiateTwitterOAuth}
                disabled={isConnecting}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isConnecting ? 'CONNECTING...' : '🐦 CONNECT TWITTER ACCOUNT'}
              </Button>
            ) : (
              <div className="flex gap-4">
                {!connectionStatus.needsReauth && (
                  <Button
                    onClick={testTwitterConnection}
                    disabled={isTesting}
                    className="flex-1 bg-[var(--color-success-muted)] hover:bg-[var(--color-success-muted)]/90"
                  >
                    {isTesting ? 'TESTING...' : '🧪 TEST CONNECTION'}
                  </Button>
                )}
                <Button
                  onClick={disconnectTwitter}
                  disabled={isConnecting}
                  variant="danger"
                  className="flex-1"
                >
                  {isConnecting ? 'DISCONNECTING...' : '🔌 DISCONNECT'}
                </Button>
              </div>
            )}
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`mt-4 p-4 border-2 ${
              testResult.success
                ? 'border-green-400 bg-green-50'
                : 'border-red-400 bg-red-50'
            }`}>
              <div className={`font-bold ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.success ? '✅ TEST SUCCESSFUL' : '❌ TEST FAILED'}
              </div>
              <p className={`text-sm mt-1 ${
                testResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {testResult.message}
              </p>
            </div>
          )}

        </CardContent>
      </Card>

      {/* What Twitter Enables */}
      <Card className="border-[6px] border-[var(--color-border-primary)] bg-[var(--color-background-beige)]">
        <CardHeader className="border-b-[4px] border-[var(--color-border-primary)]">
          <CardTitle className="text-card-title">SOCIAL CONSEQUENCES</CardTitle>
          <CardDescription className="text-subtitle">
            What happens when you fail with Twitter connected
          </CardDescription>
        </CardHeader>
        <CardContent className="p-[var(--space-6)]">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">🚨</span>
              <div>
                <div className="font-bold text-[var(--color-text-primary)]">PUBLIC SHAME TWEETS</div>
                <div className="text-sm text-gray-600">
                  Automatically post embarrassing confession tweets when you fail goals
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">📷</span>
              <div>
                <div className="font-bold text-[var(--color-text-primary)]">KOMPROMAT ATTACHMENTS</div>
                <div className="text-sm text-gray-600">
                  Your embarrassing images can be attached to shame tweets
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">✍️</span>
              <div>
                <div className="font-bold text-[var(--color-text-primary)]">CUSTOM MESSAGES</div>
                <div className="text-sm text-gray-600">
                  Customize shame tweet content per-goal during goal creation
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">📧</span>
              <div>
                <div className="font-bold text-[var(--color-text-primary)]">EMAIL FALLBACK</div>
                <div className="text-sm text-gray-600">
                  If Twitter posting fails, consequences fall back to email humiliation
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Note */}
      <Card className="border-[6px] border-[var(--color-border-primary)] bg-[var(--color-background-beige)]">
        <CardHeader className="border-b-[4px] border-[var(--color-border-primary)]">
          <CardTitle className="text-card-title">SECURITY & PRIVACY</CardTitle>
        </CardHeader>
        <CardContent className="p-[var(--space-6)]">
          <div className="space-y-3 text-sm text-[var(--color-text-primary)]">
            <p>
              <strong>🔒 Encrypted Storage:</strong> Your Twitter tokens are encrypted and stored securely
              in your account metadata.
            </p>
            <p>
              <strong>📝 Limited Permissions:</strong> We only request the minimum permissions needed:
              read tweets, post tweets, upload media, and offline access for token refresh.
            </p>
            <p>
              <strong>🚫 No DM Access:</strong> Threativator cannot read your direct messages or
              access your private information.
            </p>
            <p>
              <strong>⚡ Revoke Anytime:</strong> You can disconnect your Twitter account at any time
              from this page or revoke access directly from Twitter settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TwitterSettings
