import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface FormErrors {
  email?: string
  general?: string
}

const ForgotPasswordPage: React.FC = () => {
  const { resetPassword, loading } = useAuth()
  
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setEmail(value)
    
    // Clear previous errors on input
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    setErrors({})
    
    try {
      const { error } = await resetPassword(email)
      
      if (error) {
        // For security reasons, we don't want to reveal if an email exists or not
        // But we still handle specific errors internally
        console.error('Password reset error:', error)
        
        // Show generic success message regardless of whether email exists
        setIsSubmitted(true)
      } else {
        setIsSubmitted(true)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      // Even on error, show success message for security
      setIsSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-green-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 48 48" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Check your email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We've sent password reset instructions to{' '}
              <span className="font-medium text-gray-900">{email}</span>
            </p>
            <p className="mt-4 text-center text-xs text-gray-500">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => {
                  setIsSubmitted(false)
                  setEmail('')
                }}
                className="text-indigo-600 hover:text-indigo-500 underline"
              >
                try again
              </button>
            </p>
          </div>
          
          <div className="text-center">
            <Link 
              to="/login" 
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            No worries! Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={handleInputChange}
              className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={!email || isSubmitting || loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                email && !isSubmitting && !loading
                  ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  : 'bg-gray-400 cursor-not-allowed'
              } transition duration-150 ease-in-out`}
            >
              {isSubmitting || loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending instructions...
                </>
              ) : (
                'Send Reset Instructions'
              )}
            </button>
          </div>

          <div className="text-center">
            <Link 
              to="/login" 
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              ← Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ForgotPasswordPage