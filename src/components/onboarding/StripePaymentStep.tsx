import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

// Only load Stripe if configured
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 
  loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) : 
  Promise.resolve(null)

interface StripePaymentFormProps {
  onSuccess: (customerId: string) => void
  onError: (error: string) => void
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ onSuccess, onError }) => {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !user) {
      onError('Stripe not loaded or user not authenticated')
      return
    }

    setIsLoading(true)
    setError('')

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      onError('Card element not found')
      setIsLoading(false)
      return
    }

    try {
      // Create Stripe customer first
      const { data: customerData, error: customerError } = await supabase.functions.invoke(
        'create-stripe-customer',
        {
          body: { 
            email: user.email,
            userId: user.id 
          }
        }
      )

      if (customerError) {
        throw new Error(customerError.message || 'Failed to create customer')
      }

      const customerId = customerData.customerId

      // Create SetupIntent for payment method
      const { data: setupIntentData, error: setupError } = await supabase.functions.invoke(
        'create-setup-intent',
        {
          body: { customerId }
        }
      )

      if (setupError) {
        throw new Error(setupError.message || 'Failed to create setup intent')
      }

      // Confirm the SetupIntent with the card
      const { error: confirmError } = await stripe.confirmCardSetup(
        setupIntentData.client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              email: user.email,
            },
          },
        }
      )

      if (confirmError) {
        throw new Error(confirmError.message || 'Payment method setup failed')
      }

      // Update user profile with Stripe customer ID
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        throw new Error('Failed to save payment information')
      }

      onSuccess(customerId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Payment Method Setup
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          We'll securely store your payment method for future goals. You won't be charged until you create a goal with stakes.
        </p>
        
        <div className="bg-white p-4 border border-gray-200 rounded-md">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
        
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Setting up payment method...
          </div>
        ) : (
          'Save Payment Method'
        )}
      </button>

      <div className="text-xs text-gray-500 text-center">
        <p>🔒 Your payment information is securely processed by Stripe</p>
        <p>We never store your card details on our servers</p>
      </div>
    </form>
  )
}

interface StripePaymentStepProps {
  onComplete: (customerId: string) => void
  onError: (error: string) => void
}

const StripePaymentStep: React.FC<StripePaymentStepProps> = ({ onComplete, onError }) => {
  const [stripeError, setStripeError] = useState<string>('')

  useEffect(() => {
    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      setStripeError('Stripe configuration is missing. Please contact support.')
    }
  }, [])

  if (stripeError) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            💳 Payment Method Setup
          </h2>
          <p className="text-gray-600">
            Secure your commitment with a payment method. This enables monetary stakes for your goals.
          </p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚙️ Configuration Required</h3>
          <p className="text-yellow-700 mb-4">
            Stripe payment integration needs to be configured to collect payment methods.
          </p>
          <div className="bg-yellow-100 rounded p-3 mb-4">
            <p className="text-sm text-yellow-800 font-mono">
              Add VITE_STRIPE_PUBLISHABLE_KEY to your .env file
            </p>
          </div>
          <p className="text-sm text-yellow-600">
            For testing, you can skip this step and configure payment methods later.
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={() => onComplete('')}
            className="bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Skip Payment Setup (Configure Later)
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          💳 Payment Method Setup
        </h2>
        <p className="text-gray-600">
          Secure your commitment with a payment method. This enables monetary stakes for your goals.
        </p>
      </div>

      {stripePromise ? (
        <Elements stripe={stripePromise}>
          <StripePaymentForm onSuccess={onComplete} onError={onError} />
        </Elements>
      ) : (
        <div className="text-center">
          <p className="text-gray-600 mb-4">Stripe not configured</p>
          <button
            onClick={() => onComplete('')}
            className="bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700"
          >
            Skip Payment Setup
          </button>
        </div>
      )}
    </div>
  )
}

export default StripePaymentStep