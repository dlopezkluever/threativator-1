import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import BaseModal from './BaseModal'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

// Only load Stripe if configured
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 
  loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) : 
  Promise.resolve(null)

interface PaymentFormProps {
  onSuccess: () => void
  amount: number
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSuccess, amount }) => {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !user) {
      setError('Payment system not loaded or user not authenticated')
      return
    }

    setIsProcessing(true)
    setError('')

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setError('Card element not found')
      setIsProcessing(false)
      return
    }

    try {
      // Create payment intent
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        'create-payment-intent',
        {
          body: { 
            amount: amount * 100, // Convert to cents
            userId: user.id 
          }
        }
      )

      if (paymentError) {
        throw new Error(paymentError.message || 'Failed to create payment intent')
      }

      // Confirm payment
      const { error: confirmError } = await stripe.confirmCardPayment(
        paymentData.client_secret,
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
        throw new Error(confirmError.message || 'Payment failed')
      }

      // Update user balance
      const { error: updateError } = await supabase.rpc('increment_balance', {
        user_id: user.id,
        amount: amount
      })

      if (updateError) {
        throw new Error('Failed to update balance')
      }

      showSuccess('Payment successful! Your balance has been updated.')
      onSuccess()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="
        bg-[var(--color-background-beige)] 
        border-[4px] 
        border-[var(--color-accent-black)]
        p-6
      ">
        <h3 className="text-card-title text-[var(--color-text-primary)] mb-4" style={{color: 'var(--color-text-primary)'}}>
          PAYMENT METHOD
        </h3>
        <p className="text-[var(--font-size-sm)] text-[var(--color-text-primary)] mb-6 uppercase tracking-wide" style={{color: 'var(--color-text-primary)'}}>
          ⚠️ STATE SECURITY PROTOCOL: FUNDS WILL BE SECURED FOR OPERATIONAL USE
        </p>
        
        <div className="
          bg-white 
          border-[2px] 
          border-[var(--color-accent-black)]
          p-4
        ">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#000000',
                  fontFamily: 'Roboto Condensed, Arial, sans-serif',
                  '::placeholder': {
                    color: '#666666',
                  },
                },
                invalid: {
                  color: '#DA291C',
                },
              },
            }}
          />
        </div>
        
        {error && (
          <div className="
            mt-4 p-4 
            bg-[var(--color-primary-crimson)]
            border-[2px]
            border-[var(--color-accent-black)]
          ">
            <p className="text-[var(--font-size-sm)] text-white font-bold uppercase">
              ❌ TRANSACTION FAILED: {error}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="text-[var(--color-text-primary)]" style={{color: 'var(--color-text-primary)'}}>
          <p className="text-[var(--font-size-lg)] font-[var(--font-family-display)] uppercase font-bold">
            DEPOSIT AMOUNT: <span className="text-[var(--color-primary-crimson)]">${amount}</span>
          </p>
        </div>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          variant="command"
          className="min-w-[200px]"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              PROCESSING...
            </div>
          ) : (
            `DEPOSIT $${amount}`
          )}
        </Button>
      </div>

      <div className="text-[var(--font-size-xs)] text-[var(--color-text-primary)] text-center uppercase" style={{color: 'var(--color-text-primary)'}}>
        <p>🔒 STATE-GRADE ENCRYPTION PROTOCOL ACTIVE</p>
        <p>CARD DETAILS SECURED BY STRIPE INFRASTRUCTURE</p>
      </div>
    </form>
  )
}

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const [currentBalance, setCurrentBalance] = useState<number>(0)
  const [selectedAmount, setSelectedAmount] = useState<number>(25)
  const [customAmount, setCustomAmount] = useState<string>('')
  const [isCustom, setIsCustom] = useState(false)
  const [showTransactions, setShowTransactions] = useState(false)
  const [stripeError, setStripeError] = useState<string>('')

  const PRESET_AMOUNTS = [25, 50, 100, 200]

  // Fetch current balance and transactions
  useEffect(() => {
    if (isOpen && user) {
      fetchUserData()
    }
  }, [isOpen, user])

  // Check Stripe configuration
  useEffect(() => {
    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      setStripeError('Payment system configuration missing. Contact State Administration.')
    }
  }, [])

  const fetchUserData = async () => {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('holding_cell_balance')
        .eq('id', user?.id)
        .single()

      setCurrentBalance(profile?.holding_cell_balance || 0)
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setIsCustom(false)
    setCustomAmount('')
  }

  const handleCustomAmount = (value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 5 && numValue <= 500) {
      setCustomAmount(value)
      setSelectedAmount(numValue)
      setIsCustom(true)
    } else {
      setCustomAmount(value)
    }
  }

  const handlePaymentSuccess = () => {
    fetchUserData()
    onClose()
  }

  if (stripeError) {
    return (
      <BaseModal isOpen={isOpen} onClose={onClose} title="⚠️ ESTABLISH COLLATERAL">
        <div className="text-center space-y-6">
          <div className="
            bg-[var(--color-primary-crimson)]
            border-[4px]
            border-[var(--color-accent-black)]
            p-6
          ">
            <h3 className="text-card-title text-white mb-2">
              ⚙️ SYSTEM CONFIGURATION REQUIRED
            </h3>
            <p className="text-white font-bold uppercase">
              {stripeError}
            </p>
          </div>
        </div>
      </BaseModal>
    )
  }

  const finalAmount = isCustom ? parseFloat(customAmount) || 0 : selectedAmount

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="💰 ESTABLISH COLLATERAL" size="large">
      <div className="space-y-6">
        {/* Current Balance Display */}
        <Card>
          <CardHeader>
            <CardTitle>CURRENT STATE TREASURY</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-[var(--font-family-display)] font-bold text-[var(--color-primary-crimson)]">
                ${currentBalance.toFixed(2)}
              </div>
              <p className="text-[var(--font-size-sm)] uppercase text-[var(--color-text-primary)] mt-2" style={{color: 'var(--color-text-primary)'}}>
                FUNDS UNDER STATE CONTROL
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Amount Selection */}
        <Card>
          <CardHeader>
            <CardTitle>SELECT DEPOSIT AMOUNT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {PRESET_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount && !isCustom ? "command" : "ghost"}
                  onClick={() => handleAmountSelect(amount)}
                  className="h-16 text-center"
                >
                  <div className="flex flex-col">
                    <span className="text-[var(--font-size-lg)] font-bold">${amount}</span>
                    <span className="text-[var(--font-size-xs)] opacity-70">PRESET</span>
                  </div>
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-[var(--font-size-sm)] uppercase font-bold text-[var(--color-text-primary)]" style={{color: 'var(--color-text-primary)'}}>
                CUSTOM AMOUNT ($5 - $500):
              </label>
              <input
                type="number"
                min="5"
                max="500"
                step="0.01"
                value={customAmount}
                onChange={(e) => handleCustomAmount(e.target.value)}
                className="
                  w-full p-3
                  border-[2px]
                  border-[var(--color-accent-black)]
                  bg-white
                  text-[var(--color-text-primary)]
                  font-[var(--font-family-body)]
                "
                placeholder="Enter amount..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Transaction History Toggle */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => setShowTransactions(!showTransactions)}
            className="text-[var(--font-size-sm)]"
          >
            {showTransactions ? '▼ HIDE' : '▶ SHOW'} TRANSACTION HISTORY
          </Button>
        </div>

        {/* Stripe Payment Form */}
        {finalAmount >= 5 && finalAmount <= 500 && (
          <Elements stripe={stripePromise}>
            <PaymentForm
              onSuccess={handlePaymentSuccess}
              amount={finalAmount}
            />
          </Elements>
        )}

        {/* Validation Message */}
        {(finalAmount < 5 || finalAmount > 500) && (
          <div className="
            p-4
            bg-[var(--color-primary-crimson)]
            border-[2px]
            border-[var(--color-accent-black)]
            text-center
          ">
            <p className="text-white font-bold uppercase">
              ⚠️ INVALID AMOUNT: DEPOSITS MUST BE BETWEEN $5 AND $500
            </p>
          </div>
        )}
      </div>
    </BaseModal>
  )
}

export default PaymentModal