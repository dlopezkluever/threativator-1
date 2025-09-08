// Unsubscribe Page Component
// Handles email unsubscribe tokens from notification emails

import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { supabase } from '../../lib/supabase'

interface UnsubscribeResult {
  success: boolean
  message: string
  email?: string
  error?: string
}

export const UnsubscribePage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [result, setResult] = useState<UnsubscribeResult | null>(null)
  const [loading, setLoading] = useState(true)

  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      handleUnsubscribe(token)
    } else {
      setResult({
        success: false,
        error: 'No unsubscribe token provided'
      })
      setLoading(false)
    }
  }, [token])

  const handleUnsubscribe = async (unsubscribeToken: string) => {
    try {
      setLoading(true)

      // Call the unsubscribe function
      const { data, error } = await supabase
        .rpc('unsubscribe_user', {
          p_unsubscribe_token: unsubscribeToken
        })

      if (error) {
        console.error('Unsubscribe error:', error)
        setResult({
          success: false,
          error: 'Failed to process unsubscribe request'
        })
        return
      }

      setResult(data as UnsubscribeResult)
    } catch (error) {
      console.error('Unsubscribe error:', error)
      setResult({
        success: false,
        error: 'An unexpected error occurred'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-main-crimson)] flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-[6px] border-[var(--color-accent-black)] bg-[var(--color-background-beige)]">
          <CardHeader className="border-b-[4px] border-[var(--color-border-primary)]">
            <CardTitle className="text-card-title text-center">
              PROCESSING UNSUBSCRIBE REQUEST
            </CardTitle>
          </CardHeader>
          <CardContent className="p-[var(--space-6)] text-center">
            <div className="animate-pulse space-y-4">
              <div className="text-xl text-[var(--color-text-primary)]">
                The State Authority is processing your request...
              </div>
              <div className="h-4 bg-gray-300 mx-auto w-3/4"></div>
              <div className="h-4 bg-gray-300 mx-auto w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-[var(--color-main-crimson)] flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-[6px] border-[var(--color-accent-black)] bg-[var(--color-background-beige)]">
          <CardHeader className="border-b-[4px] border-[var(--color-border-primary)]">
            <CardTitle className="text-card-title text-center text-[var(--color-primary-crimson)]">
              INVALID REQUEST
            </CardTitle>
          </CardHeader>
          <CardContent className="p-[var(--space-6)] text-center">
            <div className="text-[var(--color-text-primary)] space-y-4">
              <p>No valid unsubscribe token was provided.</p>
              <p className="text-sm text-gray-600">
                Please use the unsubscribe link from your email notification.
              </p>
              <div className="mt-6">
                <Link to="/dashboard">
                  <Button>RETURN TO DASHBOARD</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-main-crimson)] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-[6px] border-[var(--color-accent-black)] bg-[var(--color-background-beige)]">
        <CardHeader className="border-b-[4px] border-[var(--color-border-primary)]">
          <CardTitle 
            className={`text-card-title text-center ${
              result.success 
                ? 'text-[var(--color-success-muted)]' 
                : 'text-[var(--color-primary-crimson)]'
            }`}
          >
            {result.success ? 'UNSUBSCRIBED SUCCESSFULLY' : 'UNSUBSCRIBE FAILED'}
          </CardTitle>
          <CardDescription className="text-subtitle text-center">
            {result.success ? 'Notification preferences updated' : 'Unable to process request'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-[var(--space-6)]">
          <div className="text-[var(--color-text-primary)] space-y-6">
            {/* Result Message */}
            <div className={`p-4 border-4 border-[var(--color-accent-black)] ${
              result.success 
                ? 'bg-[var(--color-success-muted)]/10' 
                : 'bg-[var(--color-primary-crimson)]/10'
            }`}>
              <p className="font-bold text-center">
                {result.success ? result.message : result.error}
              </p>
              {result.email && (
                <p className="text-sm text-center mt-2 text-gray-600">
                  Account: {result.email}
                </p>
              )}
            </div>

            {/* Success Information */}
            {result.success && (
              <div className="space-y-4">
                <div className="text-sm">
                  <strong>What happens now:</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside ml-4">
                    <li>All email notifications have been disabled</li>
                    <li>You will no longer receive deadline reminders</li>
                    <li>Submission results won't be emailed to you</li>
                    <li>Consequence notifications are disabled</li>
                    <li>Goal completion celebrations are disabled</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-yellow-50 border-2 border-yellow-400">
                  <p className="text-sm font-bold text-yellow-800">
                    ⚠️ IMPORTANT: Consequences will still be executed!
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Disabling notifications doesn't stop the State Authority from enforcing 
                    accountability. You simply won't receive advance warning of deadlines 
                    or penalty execution.
                  </p>
                </div>
              </div>
            )}

            {/* Resubscribe Options */}
            <div className="border-t-4 border-[var(--color-border-primary)] pt-6">
              <h3 className="text-card-title text-sm mb-4">
                WANT TO CHANGE YOUR MIND?
              </h3>
              <div className="space-y-4 text-sm">
                <p>
                  You can re-enable notifications or customize your preferences by 
                  logging into your account and visiting the settings page.
                </p>
                <div className="flex gap-4 justify-center">
                  <Link to="/login">
                    <Button variant="outline">
                      LOG IN TO ACCOUNT
                    </Button>
                  </Link>
                  <Link to="/settings">
                    <Button>
                      NOTIFICATION SETTINGS
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Return to Dashboard */}
            <div className="text-center pt-4">
              <Link to="/dashboard">
                <Button variant="ghost" className="text-sm">
                  RETURN TO DASHBOARD
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default UnsubscribePage