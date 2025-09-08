// Notification Settings Component
// Soviet Constructivist styled notification preferences management

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../contexts/ToastContext'

interface NotificationPreferences {
  deadline_reminders: boolean
  submission_results: boolean
  consequence_notifications: boolean
  goal_completion: boolean
  digest_frequency: 'immediate' | 'daily' | 'weekly' | 'disabled'
  reminder_frequency: '24h_only' | '1h_only' | 'both' | 'disabled'
  email_enabled: boolean
}

interface ToggleSwitchProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
  label: string
  description?: string
  disabled?: boolean
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
  enabled, 
  onChange, 
  label, 
  description,
  disabled = false 
}) => {
  return (
    <div className="flex items-start justify-between py-4 border-b border-[var(--color-accent-black)]">
      <div className="flex-1 mr-4">
        <div className="text-card-title text-sm font-bold text-[var(--color-text-primary)]">
          {label}
        </div>
        {description && (
          <div className="text-xs text-gray-600 mt-1">
            {description}
          </div>
        )}
      </div>
      <button
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-none border-2 border-[var(--color-accent-black)]
          transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-crimson)]
          ${enabled 
            ? 'bg-[var(--color-primary-crimson)]' 
            : 'bg-[var(--color-background-beige)]'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform bg-[var(--color-accent-black)] transition-transform
            ${enabled ? 'translate-x-5' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  )
}

interface SelectFieldProps {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  label: string
  description?: string
  disabled?: boolean
}

const SelectField: React.FC<SelectFieldProps> = ({
  value,
  onChange,
  options,
  label,
  description,
  disabled = false
}) => {
  return (
    <div className="py-4 border-b border-[var(--color-accent-black)]">
      <label className="block text-card-title text-sm font-bold text-[var(--color-text-primary)] mb-2">
        {label}
      </label>
      {description && (
        <p className="text-xs text-gray-600 mb-3">
          {description}
        </p>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full p-2 border-2 border-[var(--color-accent-black)] bg-[var(--color-background-beige)]
          text-[var(--color-text-primary)] font-bold text-sm
          focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-crimson)]
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        style={{ borderRadius: '0px' }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export const NotificationSettings: React.FC = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const digestFrequencyOptions = [
    { value: 'immediate', label: 'Immediate (as they happen)' },
    { value: 'daily', label: 'Daily Digest' },
    { value: 'weekly', label: 'Weekly Summary' },
    { value: 'disabled', label: 'Disabled' }
  ]

  const reminderFrequencyOptions = [
    { value: 'both', label: 'Both 24h and 1h reminders' },
    { value: '24h_only', label: '24 hour reminders only' },
    { value: '1h_only', label: '1 hour reminders only' },
    { value: 'disabled', label: 'No deadline reminders' }
  ]

  useEffect(() => {
    loadPreferences()
  }, [user])

  const loadPreferences = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .rpc('get_or_create_notification_preferences', {
          p_user_id: user.id
        })

      if (error) {
        console.error('Error loading preferences:', error)
        showToast('Failed to load notification preferences', 'error')
        return
      }

      setPreferences(data)
    } catch (error) {
      console.error('Error loading preferences:', error)
      showToast('Failed to load notification preferences', 'error')
    } finally {
      setLoading(false)
    }
  }

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user || !preferences) return

    try {
      setSaving(true)

      const { data, error } = await supabase
        .rpc('update_notification_preferences', {
          p_user_id: user.id,
          p_deadline_reminders: updates.deadline_reminders,
          p_submission_results: updates.submission_results,
          p_consequence_notifications: updates.consequence_notifications,
          p_goal_completion: updates.goal_completion,
          p_digest_frequency: updates.digest_frequency,
          p_reminder_frequency: updates.reminder_frequency,
          p_email_enabled: updates.email_enabled
        })

      if (error) {
        console.error('Error updating preferences:', error)
        showToast('Failed to save notification preferences', 'error')
        return
      }

      setPreferences(data)
      showToast('Notification preferences updated successfully', 'success')
    } catch (error) {
      console.error('Error updating preferences:', error)
      showToast('Failed to save notification preferences', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleChange = (field: keyof NotificationPreferences) => (value: boolean | string) => {
    if (!preferences) return

    const updates = { [field]: value }
    setPreferences({ ...preferences, ...updates })
    updatePreferences(updates)
  }

  const disableAllNotifications = async () => {
    const updates: Partial<NotificationPreferences> = {
      deadline_reminders: false,
      submission_results: false,
      consequence_notifications: false,
      goal_completion: false,
      email_enabled: false,
      digest_frequency: 'disabled',
      reminder_frequency: 'disabled'
    }

    setPreferences(prev => prev ? { ...prev, ...updates } : null)
    await updatePreferences(updates)
  }

  const enableAllNotifications = async () => {
    const updates: Partial<NotificationPreferences> = {
      deadline_reminders: true,
      submission_results: true,
      consequence_notifications: true,
      goal_completion: true,
      email_enabled: true,
      digest_frequency: 'immediate',
      reminder_frequency: 'both'
    }

    setPreferences(prev => prev ? { ...prev, ...updates } : null)
    await updatePreferences(updates)
  }

  if (loading) {
    return (
      <Card className="border-[6px] border-[var(--color-border-primary)] bg-[var(--color-background-beige)]">
        <CardHeader className="border-b-[4px] border-[var(--color-border-primary)]">
          <CardTitle className="text-card-title">NOTIFICATION PREFERENCES</CardTitle>
          <CardDescription className="text-subtitle">Loading preferences...</CardDescription>
        </CardHeader>
        <CardContent className="p-[var(--space-6)]">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-300"></div>
            <div className="h-4 bg-gray-300"></div>
            <div className="h-4 bg-gray-300"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!preferences) {
    return (
      <Card className="border-[6px] border-[var(--color-border-primary)] bg-[var(--color-background-beige)]">
        <CardHeader className="border-b-[4px] border-[var(--color-border-primary)]">
          <CardTitle className="text-card-title">NOTIFICATION PREFERENCES</CardTitle>
          <CardDescription className="text-subtitle">Failed to load preferences</CardDescription>
        </CardHeader>
        <CardContent className="p-[var(--space-6)]">
          <Button onClick={loadPreferences} className="w-full">
            RETRY LOADING
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Preferences Card */}
      <Card className="border-[6px] border-[var(--color-border-primary)] bg-[var(--color-background-beige)]">
        <CardHeader className="border-b-[4px] border-[var(--color-border-primary)]">
          <CardTitle className="text-card-title">NOTIFICATION PREFERENCES</CardTitle>
          <CardDescription className="text-subtitle">
            Control which emails the State Authority sends you
          </CardDescription>
        </CardHeader>
        <CardContent className="p-[var(--space-6)]">
          {/* Master Email Toggle */}
          <div className="mb-6">
            <ToggleSwitch
              enabled={preferences.email_enabled}
              onChange={handleToggleChange('email_enabled')}
              label="MASTER EMAIL CONTROL"
              description="Disable this to stop ALL email notifications from the State Authority"
            />
          </div>

          {/* Individual Notification Types */}
          <div className="space-y-1">
            <ToggleSwitch
              enabled={preferences.deadline_reminders}
              onChange={handleToggleChange('deadline_reminders')}
              disabled={!preferences.email_enabled}
              label="DEADLINE REMINDERS"
              description="Receive warnings 24h and 1h before deadlines approach"
            />

            <ToggleSwitch
              enabled={preferences.submission_results}
              onChange={handleToggleChange('submission_results')}
              disabled={!preferences.email_enabled}
              label="SUBMISSION RESULTS"
              description="Get notified when your proof is graded (pass/fail with feedback)"
            />

            <ToggleSwitch
              enabled={preferences.consequence_notifications}
              onChange={handleToggleChange('consequence_notifications')}
              disabled={!preferences.email_enabled}
              label="CONSEQUENCE NOTIFICATIONS"
              description="Alerts when penalties are executed (monetary/humiliation)"
            />

            <ToggleSwitch
              enabled={preferences.goal_completion}
              onChange={handleToggleChange('goal_completion')}
              disabled={!preferences.email_enabled}
              label="GOAL COMPLETION CELEBRATIONS"
              description="Victory notifications when you complete major goals"
            />
          </div>

          {/* Frequency Settings */}
          <div className="mt-8 space-y-4">
            <SelectField
              value={preferences.reminder_frequency}
              onChange={handleToggleChange('reminder_frequency')}
              options={reminderFrequencyOptions}
              disabled={!preferences.email_enabled || !preferences.deadline_reminders}
              label="REMINDER FREQUENCY"
              description="Choose which deadline reminders to receive"
            />

            <SelectField
              value={preferences.digest_frequency}
              onChange={handleToggleChange('digest_frequency')}
              options={digestFrequencyOptions}
              disabled={!preferences.email_enabled}
              label="DIGEST FREQUENCY"
              description="How often to receive summary notifications"
            />
          </div>

          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t-4 border-[var(--color-border-primary)]">
            <div className="flex gap-4">
              <Button
                onClick={enableAllNotifications}
                disabled={saving}
                className="flex-1 bg-[var(--color-success-muted)] hover:bg-[var(--color-success-muted)]/90"
              >
                {saving ? 'UPDATING...' : 'ENABLE ALL'}
              </Button>
              <Button
                onClick={disableAllNotifications}
                disabled={saving}
                variant="destructive"
                className="flex-1"
              >
                {saving ? 'UPDATING...' : 'DISABLE ALL'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unsubscribe Information */}
      <Card className="border-[6px] border-[var(--color-border-primary)] bg-[var(--color-background-beige)]">
        <CardHeader className="border-b-[4px] border-[var(--color-border-primary)]">
          <CardTitle className="text-card-title">UNSUBSCRIBE OPTIONS</CardTitle>
          <CardDescription className="text-subtitle">
            Alternative methods to manage notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="p-[var(--space-6)]">
          <div className="space-y-4 text-sm text-[var(--color-text-primary)]">
            <div>
              <strong>Email Footer Links:</strong> All State Authority emails contain an "Manage Notifications" 
              link that allows instant unsubscribe without logging in.
            </div>
            <div>
              <strong>Complete Unsubscribe:</strong> Using email footer links will disable ALL notifications. 
              Use these settings for more granular control.
            </div>
            <div className="text-xs text-gray-600 pt-4 border-t border-gray-300">
              <strong>Note:</strong> Disabling notifications may reduce the effectiveness of the State Authority's 
              accountability enforcement. Consequences will still be executed, but you won't receive advance warning.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NotificationSettings