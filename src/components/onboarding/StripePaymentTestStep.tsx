import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

// Test version - simulates Stripe without backend
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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      onError('Stripe not loaded')
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
      // For testing, we'll simulate the payment method creation
      const { error: paymentMethodError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      })

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message || 'Payment method creation failed')
      }

      // Simulate successful customer creation
      const mockCustomerId = `cus_test_${Date.now()}`
      
      // Show success for a moment
      setTimeout(() => {
        onSuccess(mockCustomerId)
      }, 1000)

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
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">🧪 Test Mode</h4>
        <p className="text-sm text-blue-700">
          This is a test version that simulates Stripe payment setup without requiring backend functions.
        </p>
      </div>

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
        
        {/* Test card instructions */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">Test Card Numbers:</h4>
          <div className="text-sm text-yellow-700 space-y-1">
            <p><strong>Success:</strong> 4242 4242 4242 4242</p>
            <p><strong>Decline:</strong> 4000 0000 0000 0002</p>
            <p><strong>3D Secure:</strong> 4000 0000 0000 3220</p>
            <p><strong>Exp:</strong> Any future date (e.g., 12/34)</p>
            <p><strong>CVC:</strong> Any 3 digits (e.g., 123)</p>
            <p><strong>ZIP:</strong> Any 5 digits (e.g., 12345)</p>
          </div>
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
        <p>🧪 Test mode: No actual charges will be made</p>
      </div>
    </form>
  )
}

interface StripePaymentTestStepProps {
  onComplete: (customerId: string) => void
  onError: (error: string) => void
}

const StripePaymentTestStep: React.FC<StripePaymentTestStepProps> = ({ onComplete, onError }) => {
  const [stripeError, setStripeError] = useState<string>('')

  useEffect(() => {
    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      setStripeError('Stripe configuration is missing. Please contact support.')
    }
  }, [])

  if (stripeError) {
    return (
      <div className="w-full max-w-none">
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
    <div className="w-full max-w-none">
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

export default StripePaymentTestStep