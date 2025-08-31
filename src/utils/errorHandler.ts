import { AuthError } from '@supabase/supabase-js'

export interface ErrorMapping {
  [key: string]: string
}

// Map Supabase error codes to user-friendly messages
export const authErrorMessages: ErrorMapping = {
  // Authentication errors
  'Invalid login credentials': 'Invalid email or password. Please check your credentials and try again.',
  'Email not confirmed': 'Please check your email and confirm your account before signing in.',
  'User already registered': 'An account with this email already exists. Try signing in instead.',
  'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
  'Invalid email': 'Please enter a valid email address.',
  'Signup disabled': 'New account creation is currently disabled. Please contact support.',
  'Email rate limit exceeded': 'Too many emails sent. Please wait a few minutes before trying again.',
  'Too many requests': 'Too many attempts. Please wait a moment and try again.',
  'Session expired': 'Your session has expired. Please sign in again.',
  'Invalid refresh token': 'Your session has expired. Please sign in again.',
  
  // Password reset errors
  'Password reset token expired': 'This password reset link has expired. Please request a new one.',
  'Invalid reset token': 'This password reset link is invalid. Please request a new one.',
  'New password should be different from the old password': 'Please choose a different password than your current one.',
  
  // Network errors
  'Failed to fetch': 'Network error. Please check your connection and try again.',
  'NetworkError': 'Network error. Please check your connection and try again.',
  
  // Generic fallbacks
  'Internal server error': 'Something went wrong on our end. Please try again in a moment.',
  'Service unavailable': 'Service is temporarily unavailable. Please try again later.',
}

export const getErrorMessage = (error: AuthError | Error | string | null): string => {
  if (!error) return 'An unknown error occurred'
  
  const errorMessage = typeof error === 'string' ? error : error.message
  
  // Check if we have a specific mapping for this error
  const mappedMessage = authErrorMessages[errorMessage]
  if (mappedMessage) {
    return mappedMessage
  }
  
  // Handle specific error patterns
  if (errorMessage.includes('rate limit')) {
    return 'Too many requests. Please wait a moment and try again.'
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'Network error. Please check your connection and try again.'
  }
  
  if (errorMessage.includes('timeout')) {
    return 'Request timed out. Please try again.'
  }
  
  // Return the original message if no mapping exists, but clean it up
  return errorMessage || 'An unexpected error occurred'
}

export const isRetriableError = (error: AuthError | Error | string): boolean => {
  const errorMessage = typeof error === 'string' ? error : error.message
  
  const retriableErrors = [
    'Failed to fetch',
    'NetworkError',
    'timeout',
    'Internal server error',
    'Service unavailable',
    'Too many requests',
    'network'
  ]
  
  return retriableErrors.some(retriableError => 
    errorMessage.toLowerCase().includes(retriableError.toLowerCase())
  )
}

export const logError = (context: string, error: AuthError | Error | string) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error)
  }
  
  // In production, you would send this to your error tracking service
  // Example: Sentry.captureException(error)
}