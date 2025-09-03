import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { resetUserOnboarding } from '../../utils/resetOnboarding'

const AuthTestPage: React.FC = () => {
  const { user, loading, signOut } = useAuth()
  const { showSuccess, showError, showInfo, showWarning } = useToast()
  const [isResetting, setIsResetting] = useState(false)

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      showError('Sign Out Failed', error.message)
    } else {
      showSuccess('Signed Out', 'You have been successfully signed out.')
    }
  }

  const testToasts = () => {
    showSuccess('Success!', 'This is a success message')
    setTimeout(() => showError('Error!', 'This is an error message'), 1000)
    setTimeout(() => showWarning('Warning!', 'This is a warning message'), 2000)
    setTimeout(() => showInfo('Info', 'This is an info message'), 3000)
  }

  const handleResetOnboarding = async () => {
    if (!user) {
      showError('Error', 'No user logged in')
      return
    }

    setIsResetting(true)
    try {
      const result = await resetUserOnboarding(user.id)
      if (result.success) {
        showSuccess('Onboarding Reset!', 'You can now test the onboarding flow at /onboarding')
        setTimeout(() => {
          window.location.href = '/onboarding'
        }, 2000)
      } else {
        showError('Reset Failed', 'Could not reset onboarding status')
      }
    } catch (error) {
      showError('Reset Failed', 'An error occurred while resetting')
    } finally {
      setIsResetting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Authentication Test Dashboard
          </h1>
          
          {/* Auth Status */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Authentication Status</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Authenticated:</p>
                  <p className={`text-lg ${user ? 'text-green-600' : 'text-red-600'}`}>
                    {user ? '✅ Yes' : '❌ No'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">User Email:</p>
                  <p className="text-lg text-gray-900">
                    {user?.email || 'Not signed in'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">User ID:</p>
                  <p className="text-sm text-gray-600 font-mono">
                    {user?.id || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Onboarding Complete:</p>
                  <p className="text-lg text-yellow-600">
                    ⏳ Check /onboarding
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* User Profile */}
          {user && (
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">User Info</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-700 overflow-x-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Test Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Test Actions</h2>
            <div className="space-y-4">
              {user ? (
                <div className="space-x-4">
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Sign Out
                  </button>
                  <button
                    onClick={handleResetOnboarding}
                    disabled={isResetting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isResetting ? 'Resetting...' : 'Reset Onboarding'}
                  </button>
                </div>
              ) : (
                <div className="space-x-4">
                  <a
                    href="/login"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 inline-block"
                  >
                    Go to Login
                  </a>
                  <a
                    href="/signup"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 inline-block"
                  >
                    Go to Signup
                  </a>
                </div>
              )}
              
              <button
                onClick={testToasts}
                className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                Test Toast Notifications
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Navigation Test</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/login" className="text-indigo-600 hover:text-indigo-500 underline">
                Login Page
              </a>
              <a href="/signup" className="text-indigo-600 hover:text-indigo-500 underline">
                Signup Page
              </a>
              <a href="/forgot-password" className="text-indigo-600 hover:text-indigo-500 underline">
                Forgot Password
              </a>
              <a href="/dashboard" className="text-indigo-600 hover:text-indigo-500 underline">
                Dashboard (Protected)
              </a>
              <a href="/onboarding" className="text-indigo-600 hover:text-indigo-500 underline">
                Onboarding (Protected)
              </a>
              <a href="/test-onboarding" className="text-green-600 hover:text-green-500 underline">
                🧪 Test Onboarding (UI Only)
              </a>
              <a href="/nonexistent" className="text-indigo-600 hover:text-indigo-500 underline">
                404 Test
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthTestPage