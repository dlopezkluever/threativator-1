import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Tables } from '../lib/supabase'

export interface AuthState {
  user: User | null
  session: Session | null
  userProfile: Tables<'profiles'> | null
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
  const [userProfile, setUserProfile] = useState<Tables<'profiles'> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string) => {
    console.log('🔍 [AuthContext] Starting fetchUserProfile for userId:', userId)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('❌ [AuthContext] Error fetching user profile:', error)
        return
      }
      
      console.log('✅ [AuthContext] User profile fetched successfully:', data)
      setUserProfile(data)
    } catch (err) {
      console.error('💥 [AuthContext] Exception in fetchUserProfile:', err)
    }
  }

  // Initialize auth state and set up listener
  useEffect(() => {
    console.log('🚀 [AuthContext] useEffect started - initializing auth')
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
          
          if (session?.user) {
            console.log('👤 [AuthContext] User found, fetching profile...')
            await fetchUserProfile(session.user.id)
          } else {
            console.log('🚫 [AuthContext] No user found')
          }
          
          console.log('✅ [AuthContext] Initial session setup complete, setting loading=false')
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
    console.log('👂 [AuthContext] Setting up auth state change listener')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 [AuthContext] Auth state change:', event, session ? 'Session exists' : 'No session')
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            console.log('👤 [AuthContext] User in auth change, fetching profile...')
            await fetchUserProfile(session.user.id)
          } else {
            console.log('🚫 [AuthContext] No user in auth change, clearing profile')
            setUserProfile(null)
          }
          
          console.log('✅ [AuthContext] Auth state change complete, setting loading=false')
          setLoading(false)
        } else {
          console.log('⚠️ [AuthContext] Component unmounted during auth state change')
        }
      }
    )

    return () => {
      console.log('🧹 [AuthContext] Cleanup: unmounting and unsubscribing')
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
      setUserProfile(null)
      
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
    userProfile,
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