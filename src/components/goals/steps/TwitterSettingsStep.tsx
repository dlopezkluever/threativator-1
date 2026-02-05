import React, { useState, useEffect } from 'react'
import { GoalFormData } from '../GoalCreation'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { useAuth } from '../../../contexts/AuthContext'

interface Props {
  formData: GoalFormData
  updateFormData: (updates: Partial<GoalFormData>) => void
  onValidationChange: (isValid: boolean) => void
}

type MessagePreset = 'dramatic_shame' | 'public_confession' | 'accountability_notice' | 'custom'

const presetOptions: Array<{
  value: MessagePreset
  label: string
  icon: string
  description: string
  preview: string
}> = [
  {
    value: 'dramatic_shame',
    label: 'DRAMATIC SHAME',
    icon: '🚨',
    description: 'Full theatrical confession with maximum embarrassment',
    preview: '🚨 ACCOUNTABILITY PROTOCOL EXECUTED 🚨\n\nI have FAILED my commitment completely and must face the consequences...'
  },
  {
    value: 'public_confession',
    label: 'PUBLIC CONFESSION',
    icon: '📢',
    description: 'Straightforward admission of failure',
    preview: '📢 OFFICIAL FAILURE NOTICE 📢\n\nThe State has executed judgment upon me for missing my deadline...'
  },
  {
    value: 'accountability_notice',
    label: 'ACCOUNTABILITY NOTICE',
    icon: '⚡',
    description: 'Brief, professional notification',
    preview: '⚡ I failed to meet my goal deadline and must share this as proof of my commitment to accountability...'
  },
  {
    value: 'custom',
    label: 'CUSTOM MESSAGE',
    icon: '✍️',
    description: 'Write your own shame tweet',
    preview: ''
  }
]

const TwitterSettingsStep: React.FC<Props> = ({ formData, updateFormData, onValidationChange }) => {
  const { user } = useAuth()
  const [isTwitterConnected, setIsTwitterConnected] = useState(false)
  const [twitterUsername, setTwitterUsername] = useState<string>('')
  const [characterCount, setCharacterCount] = useState(0)

  // Check Twitter connection status
  useEffect(() => {
    if (user?.user_metadata) {
      const hasToken = !!user.user_metadata.twitter_access_token
      const hasWriteScope = !!user.user_metadata.twitter_has_write_scope
      setIsTwitterConnected(hasToken && hasWriteScope)
      setTwitterUsername(user.user_metadata.twitter_username || '')
    }
  }, [user])

  // Update character count when custom message changes
  useEffect(() => {
    setCharacterCount(formData.twitterCustomMessage?.length || 0)
  }, [formData.twitterCustomMessage])

  // Validate step
  useEffect(() => {
    const isValid = formData.twitterMessagePreset !== 'custom' ||
      !!(formData.twitterCustomMessage && formData.twitterCustomMessage.length > 0 && formData.twitterCustomMessage.length <= 280)
    onValidationChange(isValid)
  }, [formData.twitterMessagePreset, formData.twitterCustomMessage, onValidationChange])

  const getPreviewText = (): string => {
    if (formData.twitterMessagePreset === 'custom') {
      return formData.twitterCustomMessage || 'Your custom message will appear here...'
    }
    return presetOptions.find(p => p.value === formData.twitterMessagePreset)?.preview || ''
  }

  if (!isTwitterConnected) {
    return (
      <div className="space-y-[var(--space-6)]">
        <div className="text-center">
          <h3 className="text-[var(--font-size-xl)] font-[var(--font-family-display)] font-bold uppercase tracking-wide text-[var(--color-text-primary)] mb-[var(--space-2)]">
            TWITTER CONSEQUENCE SETTINGS
          </h3>
          <p className="text-[var(--color-text-primary)] text-[var(--font-size-base)] opacity-80">
            Configure social media humiliation consequences
          </p>
        </div>

        <Card>
          <CardContent className="p-[var(--space-6)]">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🐦</span>
              </div>
              <h4 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
                TWITTER NOT CONNECTED
              </h4>
              <p className="text-[var(--color-text-primary)] opacity-70 mb-4">
                Connect your Twitter account in Settings to enable social media consequences.
              </p>
              <p className="text-[var(--font-size-sm)] text-gray-500">
                You can skip this step if you don't want Twitter consequences.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-[var(--space-6)]">

      {/* Header */}
      <div className="text-center">
        <h3 className="text-[var(--font-size-xl)] font-[var(--font-family-display)] font-bold uppercase tracking-wide text-[var(--color-text-primary)] mb-[var(--space-2)]">
          TWITTER CONSEQUENCE SETTINGS
        </h3>
        <p className="text-[var(--color-text-primary)] text-[var(--font-size-base)] opacity-80">
          Customize your public shame tweet for @{twitterUsername}
        </p>
      </div>

      {/* Message Preset Selection */}
      <Card>
        <CardHeader>
          <CardTitle>SELECT SHAME MESSAGE STYLE</CardTitle>
        </CardHeader>
        <CardContent className="space-y-[var(--space-3)]">
          {presetOptions.map((preset) => (
            <label
              key={preset.value}
              className={`flex items-start gap-[var(--space-3)] border-[var(--border-width-medium)] p-[var(--space-4)] cursor-pointer transition-colors ${
                formData.twitterMessagePreset === preset.value
                  ? 'border-[var(--color-primary-crimson)] bg-red-50'
                  : 'border-[var(--color-accent-black)] bg-white hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="twitterPreset"
                checked={formData.twitterMessagePreset === preset.value}
                onChange={() => updateFormData({ twitterMessagePreset: preset.value })}
                className="mt-1 w-4 h-4"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{preset.icon}</span>
                  <span className="font-bold text-[var(--font-size-base)] uppercase">
                    {preset.label}
                  </span>
                </div>
                <p className="text-[var(--font-size-sm)] text-gray-600 mt-1">
                  {preset.description}
                </p>
              </div>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Custom Message Input (only shown when 'custom' is selected) */}
      {formData.twitterMessagePreset === 'custom' && (
        <Card>
          <CardHeader>
            <CardTitle>COMPOSE CUSTOM SHAME MESSAGE</CardTitle>
          </CardHeader>
          <CardContent className="space-y-[var(--space-4)]">
            <div>
              <textarea
                value={formData.twitterCustomMessage || ''}
                onChange={(e) => updateFormData({ twitterCustomMessage: e.target.value })}
                placeholder="Write your custom shame tweet..."
                maxLength={280}
                rows={4}
                className={`w-full border-[var(--border-width-thick)] bg-[var(--color-background-beige)] p-[var(--space-3)] text-[var(--color-text-primary)] font-[var(--font-family-body)] text-[var(--font-size-base)] resize-none ${
                  characterCount > 280
                    ? 'border-red-500'
                    : 'border-[var(--color-accent-black)]'
                }`}
                style={{ borderRadius: '0px' }}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-[var(--font-size-xs)] text-gray-500">
                  This message will be posted to your Twitter when consequence triggers
                </p>
                <span className={`text-[var(--font-size-sm)] font-bold ${
                  characterCount > 280 ? 'text-red-500' : 'text-gray-600'
                }`}>
                  {characterCount}/280
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kompromat Image Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>IMAGE ATTACHMENT</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-start gap-[var(--space-3)] cursor-pointer">
            <input
              type="checkbox"
              checked={formData.twitterIncludeKompromat ?? true}
              onChange={(e) => updateFormData({ twitterIncludeKompromat: e.target.checked })}
              className="mt-1 w-5 h-5"
            />
            <div>
              <span className="font-bold text-[var(--font-size-base)] text-[var(--color-text-primary)]">
                INCLUDE KOMPROMAT IMAGE
              </span>
              <p className="text-[var(--font-size-sm)] text-gray-600 mt-1">
                Attach your embarrassing kompromat image to the shame tweet.
                Minor kompromat for checkpoint failures, major for final deadline.
              </p>
            </div>
          </label>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>TWEET PREVIEW</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white border-[var(--border-width-medium)] border-gray-300 p-[var(--space-4)]">
            {/* Twitter Header Mock */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {twitterUsername?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <div className="font-bold text-[var(--color-text-primary)]">
                  @{twitterUsername}
                </div>
                <div className="text-[var(--font-size-xs)] text-gray-500">
                  Posted via Threativator
                </div>
              </div>
            </div>

            {/* Tweet Content */}
            <div className="text-[var(--color-text-primary)] whitespace-pre-line text-[var(--font-size-base)]">
              {getPreviewText()}
            </div>

            {/* Image Placeholder */}
            {(formData.twitterIncludeKompromat ?? true) && (
              <div className="mt-3 bg-gray-100 border border-gray-300 p-4 text-center">
                <span className="text-gray-500 text-[var(--font-size-sm)]">
                  📷 [Kompromat image will be attached]
                </span>
              </div>
            )}

            {/* Hashtags */}
            <div className="mt-3 text-blue-500 text-[var(--font-size-sm)]">
              #Threativator #AccountabilityFail
            </div>
          </div>

          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200">
            <p className="text-[var(--font-size-xs)] text-yellow-800">
              ⚠️ <strong>WARNING:</strong> This tweet will be posted publicly to your Twitter account
              if you fail your goal. Make sure you're comfortable with this level of accountability.
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

export default TwitterSettingsStep
