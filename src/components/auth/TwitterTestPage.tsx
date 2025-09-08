import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { supabase } from '../../lib/supabase'

const TwitterTestPage: React.FC = () => {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isTestingDisconnect, setIsTestingDisconnect] = useState(false)
  const [testResults, setTestResults] = useState<string>('')

  const testTwitterConnection = async () => {
    if (!user?.user_metadata?.twitter_access_token) {
      showError('No Twitter access token found - please connect Twitter first')
      return
    }

    setIsTestingConnection(true)
    setTestResults('')

    try {
      console.log('Testing Twitter API connection...')
      
      const { data, error } = await supabase.functions.invoke('testTwitter', {
        body: {
          access_token: user.user_metadata.twitter_access_token,
          test_message: '🧪 Threativator Twitter integration test successful! The consequence system is ready to enforce accountability. #ThreativatorTest #AccountabilityTech'
        }
      })

      if (error) {
        throw new Error(`Function error: ${error.message}`)
      }

      if (data.success) {
        setTestResults(`✅ Twitter API Test SUCCESS!\n\nTweet ID: ${data.tweet_id}\nTweet URL: ${data.tweet_url}\n\nThe Twitter consequence system is ready for deployment!`)
        showSuccess('Twitter API test successful! Tweet posted.')
      } else {
        setTestResults(`❌ Twitter API Test FAILED!\n\nError: ${data.error}\n\nPlease check your Twitter API credentials and permissions.`)
        showError(`Twitter test failed: ${data.error}`)
      }

    } catch (error) {
      const errorMsg = `❌ Test Error!\n\n${error instanceof Error ? error.message : 'Unknown error'}`
      setTestResults(errorMsg)
      showError('Twitter test failed - see console for details')
      console.error('Twitter test error:', error)
    } finally {
      setIsTestingConnection(false)
    }
  }

  const testDisconnect = async () => {
    if (!user) {
      showError('User not authenticated')
      return
    }

    setIsTestingDisconnect(true)
    setTestResults('')

    try {
      console.log('Testing Twitter disconnect...')
      
      const { data, error } = await supabase.functions.invoke('triggerConsequence', {
        body: {
          action: 'disconnect_twitter',
          user_id: user.id
        }
      })

      if (error) {
        throw new Error(`Function error: ${error.message}`)
      }

      if (data.success) {
        setTestResults('✅ Twitter Disconnect SUCCESS!\n\nTwitter credentials have been removed from your account.')
        showSuccess('Twitter account disconnected successfully!')
        
        // Refresh user session to get updated metadata
        await supabase.auth.refreshSession()
      } else {
        setTestResults(`❌ Twitter Disconnect FAILED!\n\nError: ${data.error}`)
        showError(`Disconnect failed: ${data.error}`)
      }

    } catch (error) {
      const errorMsg = `❌ Disconnect Error!\n\n${error instanceof Error ? error.message : 'Unknown error'}`
      setTestResults(errorMsg)
      showError('Twitter disconnect failed - see console for details')
      console.error('Twitter disconnect error:', error)
    } finally {
      setIsTestingDisconnect(false)
    }
  }

  const twitterConnected = !!user?.user_metadata?.twitter_access_token
  const twitterUsername = user?.user_metadata?.twitter_username

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🐦 Twitter Integration Test Suite
          </h1>
          
          {/* Connection Status */}
          <div className="mb-8 p-6 border-2 border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
            
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-4 h-4 rounded-full ${twitterConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">
                {twitterConnected ? '✅ Connected' : '❌ Not Connected'}
              </span>
              {twitterUsername && (
                <span className="text-gray-600">@{twitterUsername}</span>
              )}
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>User ID:</strong> {user?.id || 'Not authenticated'}</p>
              <p><strong>Access Token:</strong> {twitterConnected ? '••••••••' : 'None'}</p>
              <p><strong>Refresh Token:</strong> {user?.user_metadata?.twitter_refresh_token ? '••••••••' : 'None'}</p>
            </div>
          </div>

          {/* Test Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 border-2 border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🧪 API Connection Test</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Tests the Twitter API by posting a test tweet to verify the consequence system can post successfully.
              </p>
              <button
                onClick={testTwitterConnection}
                disabled={isTestingConnection || !twitterConnected}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  twitterConnected && !isTestingConnection
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isTestingConnection ? 'Testing...' : 'Test Twitter API'}
              </button>
            </div>

            <div className="p-6 border-2 border-red-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🔌 Disconnect Test</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Tests the Twitter disconnect functionality by removing stored credentials from your account.
              </p>
              <button
                onClick={testDisconnect}
                disabled={isTestingDisconnect || !twitterConnected}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  twitterConnected && !isTestingDisconnect
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isTestingDisconnect ? 'Disconnecting...' : 'Test Disconnect'}
              </button>
            </div>
          </div>

          {/* Test Results */}
          {testResults && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Test Results</h3>
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
                {testResults}
              </div>
            </div>
          )}

          {/* System Info */}
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">📋 System Information</h3>
            <div className="text-sm text-blue-700 space-y-2">
              <p><strong>Task 8 Status:</strong> Twitter OAuth 2.0 integration implemented ✅</p>
              <p><strong>Features:</strong> Token refresh, error handling, posting with media attachments</p>
              <p><strong>Consequence Types:</strong> humiliation_social now supported alongside monetary and email</p>
              <p><strong>Edge Function:</strong> triggerConsequence updated with Twitter posting capability</p>
              <p><strong>Modal Support:</strong> ConsequenceModalCompact updated to show Twitter consequences</p>
            </div>
          </div>

          {!twitterConnected && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> You need to connect your Twitter account first to test these features. 
                Go to the onboarding flow or social media settings to connect Twitter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TwitterTestPage