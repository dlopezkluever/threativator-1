import React, { useState, useEffect } from 'react'

interface SocialMediaTestStepProps {
  onComplete: (connected: boolean) => void
  onError: (error: string) => void
}

const SocialMediaTestStep: React.FC<SocialMediaTestStepProps> = ({ onComplete, onError }) => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean
    username?: string
  }>({ connected: false })

  const handleTwitterConnect = async () => {
    setIsConnecting(true)

    try {
      // Simulate OAuth flow
      setTimeout(() => {
        const mockUsername = `test_user_${Date.now().toString().slice(-4)}`
        setConnectionStatus({
          connected: true,
          username: mockUsername
        })
        setIsConnecting(false)
        
        // Auto-complete after showing connected state for a moment
        setTimeout(() => {
          onComplete(true)
        }, 1500)
      }, 2000)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect Twitter'
      onError(errorMessage)
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    setConnectionStatus({ connected: false })
  }

  return (
    <div className="w-full max-w-none">
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h4 className="text-sm font-medium text-blue-800 mb-2">🧪 Test Mode</h4>
        <p className="text-sm text-blue-700">
          Social media connections are simulated in test mode. No actual OAuth is performed.
        </p>
      </div>

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
                  onClick={handleDisconnect}
                  disabled={isConnecting}
                  className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={handleTwitterConnect}
                disabled={isConnecting}
                className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connecting...
                  </div>
                ) : (
                  'Connect'
                )}
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
      <div className="flex justify-center gap-4">
        {!connectionStatus.connected && (
          <button
            onClick={() => onComplete(false)}
            className="text-gray-500 hover:text-gray-700 underline px-4 py-2"
          >
            Skip Social Media
          </button>
        )}
      </div>

      <div className="text-center mt-4">
        <div className="text-xs text-gray-500 space-y-1">
          <p>🔒 Your social media credentials are encrypted and stored securely</p>
          <p>You can connect or disconnect accounts at any time in Settings</p>
        </div>
      </div>
    </div>
  )
}

export default SocialMediaTestStep