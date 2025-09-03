import React, { useState, useEffect } from 'react'
import BaseModal from './BaseModal'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { Link2, Unlink, Twitter, AlertTriangle, Shield, Info } from 'lucide-react'

interface SocialConnection {
  platform: string
  connected: boolean
  username?: string
  verified?: boolean
  lastConnected?: string
}

interface SocialMediaModalProps {
  isOpen: boolean
  onClose: () => void
}

// Helper functions for Twitter OAuth PKCE
const generateCodeVerifier = (): string => {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => String.fromCharCode(byte))
    .join('')
    .replace(/[^A-Za-z0-9\-_~]/g, '')
    .substring(0, 128)
}

const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

const SocialMediaModal: React.FC<SocialMediaModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const { showSuccess, showError, showInfo } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [connections, setConnections] = useState<SocialConnection[]>([])
  const [twitterConfigured, setTwitterConfigured] = useState(false)

  // Check Twitter configuration and fetch connections
  useEffect(() => {
    if (isOpen && user) {
      checkTwitterConfiguration()
      fetchSocialConnections()
    }
  }, [isOpen, user])

  const checkTwitterConfiguration = () => {
    const clientId = import.meta.env.VITE_TWITTER_CLIENT_ID
    setTwitterConfigured(!!clientId)
  }

  const fetchSocialConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('twitter_username, twitter_access_token, updated_at')
        .eq('id', user?.id)
        .single()

      if (error) throw error

      const twitterConnection: SocialConnection = {
        platform: 'Twitter',
        connected: !!(data?.twitter_access_token && data?.twitter_username),
        username: data?.twitter_username || undefined,
        verified: true, // Assume verified if we have tokens
        lastConnected: data?.updated_at
      }

      setConnections([twitterConnection])
    } catch (error) {
      console.error('Failed to fetch social connections:', error)
      setConnections([
        {
          platform: 'Twitter',
          connected: false
        }
      ])
    }
  }

  const initiateTwitterOAuth = async () => {
    if (!user) {
      showError('User not authenticated')
      return
    }

    if (!twitterConfigured) {
      showError('Twitter integration not configured')
      return
    }

    setIsLoading(true)

    try {
      // Generate PKCE code verifier and challenge
      const codeVerifier = generateCodeVerifier()
      const codeChallenge = await generateCodeChallenge(codeVerifier)
      
      // Store code verifier for later use
      sessionStorage.setItem('twitter_code_verifier', codeVerifier)
      
      // Twitter OAuth 2.0 parameters
      const clientId = import.meta.env.VITE_TWITTER_CLIENT_ID
      const redirectUri = `${window.location.origin}/auth/twitter/callback`
      const state = crypto.randomUUID()
      
      // Store state for verification
      sessionStorage.setItem('twitter_oauth_state', state)
      
      const scopes = ['tweet.read', 'tweet.write', 'users.read', 'offline.access'].join(' ')
      
      const authUrl = new URL('https://twitter.com/i/oauth2/authorize')
      authUrl.searchParams.append('response_type', 'code')
      authUrl.searchParams.append('client_id', clientId)
      authUrl.searchParams.append('redirect_uri', redirectUri)
      authUrl.searchParams.append('scope', scopes)
      authUrl.searchParams.append('state', state)
      authUrl.searchParams.append('code_challenge', codeChallenge)
      authUrl.searchParams.append('code_challenge_method', 'S256')

      // Store the modal close function to call after successful connection
      sessionStorage.setItem('social_modal_return', 'true')

      showInfo('Redirecting to Twitter for authorization...')
      
      // Redirect to Twitter OAuth
      window.location.href = authUrl.toString()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate Twitter connection'
      showError(errorMessage)
      setIsLoading(false)
    }
  }

  const disconnectTwitter = async () => {
    if (!user) {
      showError('User not authenticated')
      return
    }

    const confirmed = confirm('DISCONNECT SOCIAL MEDIA SURVEILLANCE?\n\nThis will disable Twitter posting capabilities for consequence enforcement.\nAre you certain, Comrade?')
    if (!confirmed) return

    setIsLoading(true)

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

      showSuccess('Twitter account disconnected successfully')
      fetchSocialConnections()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect Twitter'
      showError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="🔗 SOCIAL SURVEILLANCE NETWORK" size="large">
      <div className="space-y-6">
        {/* Configuration Warning */}
        {!twitterConfigured && (
          <div className="
            bg-[var(--color-primary-crimson)]
            border-[4px]
            border-[var(--color-accent-black)]
            p-6
            text-center
          ">
            <AlertTriangle className="mx-auto h-8 w-8 text-white mb-2" />
            <h3 className="text-card-title text-white mb-2">
              ⚙️ SOCIAL INTEGRATION OFFLINE
            </h3>
            <p className="text-white font-bold uppercase">
              Twitter configuration missing. Contact State Administration.
            </p>
          </div>
        )}

        {/* Connected Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>SURVEILLANCE NETWORK STATUS</CardTitle>
          </CardHeader>
          <CardContent>
            {connections.map((connection) => (
              <div key={connection.platform} className="
                border-[2px]
                border-[var(--color-accent-black)]
                bg-white
                p-4
                mb-4
                last:mb-0
              ">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="
                      w-12 h-12
                      bg-[var(--color-background-beige)]
                      border-[2px]
                      border-[var(--color-accent-black)]
                      flex items-center justify-center
                    ">
                      <Twitter className="h-6 w-6 text-[var(--color-text-primary)]" />
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-[var(--color-text-primary)] uppercase" style={{color: 'var(--color-text-primary)'}}>
                        {connection.platform} NETWORK
                      </h3>
                      
                      {connection.connected ? (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Shield className="h-4 w-4 text-[var(--color-success-muted)]" />
                            <span className="text-[var(--color-success-muted)] font-bold uppercase text-[var(--font-size-sm)]">
                              SURVEILLANCE ACTIVE
                            </span>
                          </div>
                          <p className="text-[var(--font-size-sm)] text-[var(--color-text-primary)]" style={{color: 'var(--color-text-primary)'}}>
                            Account: <span className="font-bold">@{connection.username}</span>
                          </p>
                          {connection.lastConnected && (
                            <p className="text-[var(--font-size-xs)] text-[var(--color-text-primary)]" style={{color: 'var(--color-text-primary)'}}>
                              Connected: {new Date(connection.lastConnected).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Unlink className="h-4 w-4 text-[var(--color-primary-crimson)]" />
                            <span className="text-[var(--color-primary-crimson)] font-bold uppercase text-[var(--font-size-sm)]">
                              NETWORK DISCONNECTED
                            </span>
                          </div>
                          <p className="text-[var(--font-size-sm)] text-[var(--color-text-primary)]" style={{color: 'var(--color-text-primary)'}}>
                            Connect to enable consequence posting
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {connection.connected ? (
                      <Button
                        variant="danger"
                        onClick={disconnectTwitter}
                        disabled={isLoading || !twitterConfigured}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            DISCONNECTING...
                          </div>
                        ) : (
                          <>
                            <Unlink className="h-4 w-4 mr-2" />
                            DISCONNECT
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="command"
                        onClick={initiateTwitterOAuth}
                        disabled={isLoading || !twitterConfigured}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            CONNECTING...
                          </div>
                        ) : (
                          <>
                            <Link2 className="h-4 w-4 mr-2" />
                            CONNECT
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Capabilities Info */}
        <Card>
          <CardHeader>
            <CardTitle>SURVEILLANCE CAPABILITIES</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="
              border-[2px]
              border-[var(--color-accent-black)]
              bg-white
              p-4
            ">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-[var(--color-text-primary)] mt-1" />
                <div>
                  <h4 className="font-bold text-[var(--color-text-primary)] uppercase mb-1" style={{color: 'var(--color-text-primary)'}}>
                    AUTOMATIC CONSEQUENCE POSTING
                  </h4>
                  <p className="text-[var(--font-size-sm)] text-[var(--color-text-primary)]" style={{color: 'var(--color-text-primary)'}}>
                    When you fail to meet goal deadlines, Major Kompromat will be automatically posted to your connected social media accounts as consequence enforcement.
                  </p>
                </div>
              </div>
            </div>

            <div className="
              border-[2px]
              border-[var(--color-accent-black)]
              bg-white
              p-4
            ">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-[var(--color-text-primary)] mt-1" />
                <div>
                  <h4 className="font-bold text-[var(--color-text-primary)] uppercase mb-1" style={{color: 'var(--color-text-primary)'}}>
                    SECURE OAUTH 2.0 PROTOCOL
                  </h4>
                  <p className="text-[var(--font-size-sm)] text-[var(--color-text-primary)]" style={{color: 'var(--color-text-primary)'}}>
                    Your social media credentials are secured using industry-standard OAuth authentication. We never store your passwords.
                  </p>
                </div>
              </div>
            </div>

            <div className="
              border-[2px]
              border-[var(--color-accent-black)]
              bg-white
              p-4
            ">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-[var(--color-primary-crimson)] mt-1" />
                <div>
                  <h4 className="font-bold text-[var(--color-text-primary)] uppercase mb-1" style={{color: 'var(--color-text-primary)'}}>
                    REVOCATION PERMISSIONS
                  </h4>
                  <p className="text-[var(--font-size-sm)] text-[var(--color-text-primary)]" style={{color: 'var(--color-text-primary)'}}>
                    You can revoke access at any time through this interface or directly through your social media account settings. However, revoking access will disable consequence enforcement.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warning Footer */}
        <div className="
          bg-[var(--color-primary-crimson)]
          border-[2px]
          border-[var(--color-accent-black)]
          p-4
          text-center
        ">
          <p className="text-white font-bold uppercase text-[var(--font-size-sm)]">
            ⚠️ WARNING: SOCIAL MEDIA CONSEQUENCES ARE IRREVERSIBLE ⚠️
          </p>
          <p className="text-white text-[var(--font-size-xs)] mt-1">
            Once kompromat is posted as consequence enforcement, it cannot be automatically removed by the system
          </p>
        </div>
      </div>
    </BaseModal>
  )
}

export default SocialMediaModal