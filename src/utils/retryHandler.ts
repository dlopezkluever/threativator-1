import { AuthError } from '@supabase/supabase-js'
import { isRetriableError, logError } from './errorHandler'

interface RetryOptions {
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
  onRetry?: (error: Error, attempt: number) => void
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
  onRetry: () => {}
}

export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
  context: string = 'Unknown operation'
): Promise<T> => {
  const config = { ...defaultOptions, ...options }
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      // Log the error
      logError(`${context} (attempt ${attempt})`, lastError)
      
      // Don't retry if it's the last attempt
      if (attempt === config.maxAttempts) {
        break
      }
      
      // Don't retry if the error is not retriable
      if (!isRetriableError(lastError)) {
        break
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffFactor, attempt - 1),
        config.maxDelay
      )
      
      // Call onRetry callback
      config.onRetry(lastError, attempt)
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  // If we get here, all attempts failed
  throw lastError
}

export const createRetriableAuthOperation = <T extends any[], R>(
  operation: (...args: T) => Promise<{ data?: R; error: AuthError | null }>,
  context: string,
  options?: RetryOptions
) => {
  return async (...args: T) => {
    return withRetry(
      async () => {
        const result = await operation(...args)
        
        // If there's an error, throw it so the retry logic can handle it
        if (result.error) {
          throw result.error
        }
        
        return result
      },
      options,
      context
    )
  }
}

// Pre-configured retry operations for common auth functions
export const retryableSignIn = createRetriableAuthOperation(
  async (email: string, password: string) => {
    const { supabase } = await import('../lib/supabase')
    return supabase.auth.signInWithPassword({ email, password })
  },
  'Sign In'
)

export const retryableSignUp = createRetriableAuthOperation(
  async (email: string, password: string) => {
    const { supabase } = await import('../lib/supabase')
    return supabase.auth.signUp({ email, password })
  },
  'Sign Up'
)

export const retryableResetPassword = createRetriableAuthOperation(
  async (email: string) => {
    const { supabase } = await import('../lib/supabase')
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
  },
  'Reset Password'
)

export const retryableSignOut = createRetriableAuthOperation(
  async () => {
    const { supabase } = await import('../lib/supabase')
    return supabase.auth.signOut()
  },
  'Sign Out'
)