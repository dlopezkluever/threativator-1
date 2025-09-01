import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/login' 
}) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  console.log('🛡️ [ProtectedRoute] Simple auth check for:', location.pathname)
  console.log('🛡️ [ProtectedRoute] State - loading:', loading, 'user:', !!user)

  // Show Soviet-themed loading spinner while checking auth status
  if (loading) {
    console.log('⏳ [ProtectedRoute] Loading auth state, showing Soviet spinner')
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5EEDC]">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#DA291C] border-2 border-[#000000] flex items-center justify-center mb-4 mx-auto animate-pulse">
            <span className="text-[#FFFFFF] font-['Stalinist_One'] text-2xl">★</span>
          </div>
          <p className="text-[#000000] font-['Stalinist_One'] text-sm uppercase tracking-wider">
            ACCESSING STATE NETWORK...
          </p>
          <p className="text-[#333333] font-['Roboto_Condensed'] text-xs mt-2">
            Verifying operative credentials
          </p>
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

  // User is authenticated - render children immediately
  console.log('✅ [ProtectedRoute] User authenticated, rendering dashboard')
  return <>{children}</>
}

export default ProtectedRoute