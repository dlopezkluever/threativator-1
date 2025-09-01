import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredOnboarding?: boolean
  redirectTo?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredOnboarding = false,
  redirectTo = '/login' 
}) => {
  const { user, userProfile, loading } = useAuth()
  const location = useLocation()

  console.log('🛡️ [ProtectedRoute] Checking protection for:', location.pathname)
  console.log('🛡️ [ProtectedRoute] State - loading:', loading, 'user:', !!user, 'userProfile:', !!userProfile, 'requiredOnboarding:', requiredOnboarding)
  
  if (userProfile) {
    console.log('🛡️ [ProtectedRoute] UserProfile onboarding_completed:', userProfile.onboarding_completed)
  }

  // Show loading spinner while checking auth status
  if (loading) {
    console.log('⏳ [ProtectedRoute] Still loading, showing spinner')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is not authenticated, redirect to login with return URL
  if (!user) {
    console.log('🚫 [ProtectedRoute] No user, redirecting to:', redirectTo)
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }}
        replace 
      />
    )
  }

  // If onboarding is required but not completed, redirect to onboarding
  if (requiredOnboarding && userProfile && !userProfile.onboarding_completed) {
    console.log('🔄 [ProtectedRoute] Onboarding required but not completed, redirecting to /onboarding')
    return (
      <Navigate 
        to="/onboarding" 
        state={{ from: location }}
        replace 
      />
    )
  }

  // User is authenticated and meets requirements, render children
  console.log('✅ [ProtectedRoute] All checks passed, rendering children')
  return <>{children}</>
}

export default ProtectedRoute