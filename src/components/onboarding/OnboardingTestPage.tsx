import React from 'react'
import OnboardingWizard from './OnboardingWizard'

const OnboardingTestPage: React.FC = () => {
  return (
    <div>
      {/* Test version that works without authentication checks */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">🧪 Testing Mode</h3>
        <p className="text-sm text-blue-700">
          This is a test version of the onboarding wizard. Some features may not work without proper authentication.
        </p>
      </div>
      <OnboardingWizard />
    </div>
  )
}

export default OnboardingTestPage