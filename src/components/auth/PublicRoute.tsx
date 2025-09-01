import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface PublicRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  redirectTo = '/dashboard' 
}) => {
  const { user, loading } = useAuth()

  // Show Soviet-themed loading spinner while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5EEDC]">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#DA291C] border-2 border-[#000000] flex items-center justify-center mb-4 mx-auto animate-pulse">
            <span className="text-[#FFFFFF] font-['Stalinist_One'] text-2xl">★</span>
          </div>
          <p className="text-[#000000] font-['Stalinist_One'] text-sm uppercase tracking-wider">
            VERIFYING CREDENTIALS...
          </p>
        </div>
      </div>
    )
  }

  // If user is authenticated, redirect to dashboard immediately
  if (user) {
    return <Navigate to={redirectTo} replace />
  }

  // User is not authenticated, show public page
  return <>{children}</>
}

export default PublicRoute