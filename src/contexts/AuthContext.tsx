import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
// Removed Tables import - no longer using userProfile

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: AuthError | null
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  // Initialize auth state and set up listener
  useEffect(() => {
    console.log('🚀 [AuthContext] Simple auth initialization started')
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      console.log('🔄 [AuthContext] Getting initial session...')
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('📋 [AuthContext] Initial session retrieved:', session ? 'Found session' : 'No session')
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          console.log('✅ [AuthContext] Simple session setup complete, setting loading=false')
          setLoading(false)
        } else {
          console.log('⚠️ [AuthContext] Component unmounted during initial session setup')
        }
      } catch (error) {
        console.error('💥 [AuthContext] Error in getInitialSession:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth state changes
    console.log('👂 [AuthContext] Setting up simple auth state change listener')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 [AuthContext] Auth state change:', event, session ? 'Session exists' : 'No session')
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          console.log('✅ [AuthContext] Simple auth state change complete, setting loading=false')
          setLoading(false)
        } else {
          console.log('⚠️ [AuthContext] Component unmounted during auth state change')
        }
      }
    )

    return () => {
      console.log('🧹 [AuthContext] Simple cleanup: unmounting and unsubscribing')
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Sign in with email and password
  const signIn = async (email: string, password: string, _rememberMe = false) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      return { error }
    } catch (err) {
      console.error('Sign in error:', err)
      return { error: err as AuthError }
    } finally {
      setLoading(false)
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      return { error }
    } catch (err) {
      console.error('Sign up error:', err)
      return { error: err as AuthError }
    } finally {
      setLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.signOut()
      
      // Clear local state
      setUser(null)
      setSession(null)
      
      return { error }
    } catch (err) {
      console.error('Sign out error:', err)
      return { error: err as AuthError }
    } finally {
      setLoading(false)
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      
      return { error }
    } catch (err) {
      console.error('Reset password error:', err)
      return { error: err as AuthError }
    } finally {
      setLoading(false)
    }
  }

  // Clear error state
  const clearError = () => {
    setError(null)
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}