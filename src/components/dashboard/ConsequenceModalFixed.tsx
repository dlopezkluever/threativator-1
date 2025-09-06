import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface ConsequenceData {
  id: string
  consequence_type: string
  triggered_at: string
  execution_status: string
  execution_details: any
  checkpoint_id?: string
  goal_id: string
  monetary_amount?: number
  charity_destination?: string
}

interface ConsequenceModalProps {
  isOpen: boolean
  onClose: () => void
  consequence: ConsequenceData | null
  failureType: 'checkpoint' | 'final_deadline'
}

export default function ConsequenceModalFixed({ 
  isOpen, 
  onClose, 
  consequence, 
  failureType 
}: ConsequenceModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Dramatic entrance sequence
      const timer1 = setTimeout(() => setShowContent(true), 500)
      return () => clearTimeout(timer1)
    } else {
      setIsVisible(false)
      setShowContent(false)
      setAcknowledged(false)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const handleAcknowledge = () => {
    setAcknowledged(true)
    setTimeout(handleClose, 1000)
  }

  const isFinalDeadline = failureType === 'final_deadline'
  const wasTriggered = consequence?.execution_details?.triggered !== false

  if (!isOpen) return null

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        transition: 'all 0.5s ease',
        opacity: isVisible ? 1 : 0
      }}
    >
      {/* Red screen flash effect */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#DC2626',
          transition: 'opacity 0.3s ease',
          opacity: (isVisible && showContent) ? 0.2 : 0
        }}
      />
      
      {/* Dark overlay */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)'
        }}
      />
      
      {/* Main modal */}
      <div 
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '16px',
          animation: showContent ? 'pulse 1s infinite' : undefined
        }}
      >
        <div 
          style={{
            backgroundColor: 'white',
            border: '8px solid black',
            borderRadius: '0px',
            maxWidth: '768px',
            width: '100%',
            transform: showContent ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(3deg)',
            transition: 'all 0.7s ease'
          }}
        >
          {/* Header */}
          <div 
            style={{
              backgroundColor: '#DC2626',
              padding: '32px 32px',
              textAlign: 'center',
              position: 'relative',
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)'
            }}
          >
            <div style={{ position: 'relative', zIndex: 10 }}>
              <div 
                style={{
                  color: 'white',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  letterSpacing: '2px'
                }}
              >
                ⚠️ OFFICIAL STATE COMMUNICATION ⚠️
              </div>
              <div 
                style={{
                  color: 'white',
                  fontSize: '14px',
                  letterSpacing: '4px'
                }}
              >
                THREATIVATOR ACCOUNTABILITY DIVISION
              </div>
            </div>
            
            {acknowledged && (
              <button
                onClick={handleClose}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  color: 'white',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  zIndex: 20
                }}
              >
                <X size={24} />
              </button>
            )}
          </div>

          {/* Main content */}
          <div style={{ padding: '32px', backgroundColor: 'white' }}>
            {/* Consequence stamp */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div 
                style={{
                  display: 'inline-block',
                  backgroundColor: '#DC2626',
                  color: 'white',
                  padding: '16px 32px',
                  border: '4px solid black',
                  borderRadius: '0px',
                  transform: 'rotate(2deg)'
                }}
              >
                <div 
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    letterSpacing: '2px'
                  }}
                >
                  {isFinalDeadline ? 'FINAL JUDGMENT EXECUTED' : 'CONSEQUENCE TRIGGERED'}
                </div>
              </div>
            </div>

            {/* Main message */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 
                style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: '#DC2626',
                  marginBottom: '16px',
                  letterSpacing: '2px'
                }}
              >
                GREAT DISHONOR
              </h2>
              <p 
                style={{
                  fontSize: '20px',
                  color: 'black',
                  marginBottom: '24px'
                }}
              >
                COMES UPON YOU, COMRADE
              </p>
              
              <div 
                style={{
                  backgroundColor: '#F3F4F6',
                  border: '4px solid black',
                  borderRadius: '0px',
                  padding: '24px',
                  marginBottom: '24px'
                }}
              >
                <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
                  STATE DIRECTIVE HAS BEEN EXECUTED
                </p>
                
                {!wasTriggered ? (
                  <div 
                    style={{
                      backgroundColor: '#F0FDF4',
                      border: '2px solid #16A34A',
                      borderRadius: '0px',
                      padding: '16px'
                    }}
                  >
                    <p style={{ color: '#166534', fontWeight: 'bold' }}>
                      THE STATE SHOWS MERCY
                    </p>
                    <p style={{ color: '#15803D', fontSize: '14px' }}>
                      Russian Roulette has spared you... this time.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p 
                      style={{
                        color: '#B91C1C',
                        fontWeight: 'bold',
                        marginBottom: '16px'
                      }}
                    >
                      {isFinalDeadline ? 'MAXIMUM PENALTY ENFORCED' : 'DISCIPLINARY ACTION TAKEN'}
                    </p>
                    
                    {/* Show consequence details */}
                    {consequence?.consequence_type === 'monetary' && (
                      <div 
                        style={{
                          backgroundColor: '#FEF2F2',
                          border: '2px solid #EF4444',
                          borderRadius: '0px',
                          padding: '16px'
                        }}
                      >
                        <p style={{ fontWeight: 'bold' }}>MONETARY PENALTY EXECUTED</p>
                        <p style={{ fontSize: '14px' }}>
                          ${consequence.monetary_amount?.toFixed(2)} transferred to {consequence.charity_destination?.replace(/_/g, ' ').toUpperCase()}
                        </p>
                        {consequence.execution_details?.stripe_transaction_id && (
                          <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
                            Transaction: {consequence.execution_details.stripe_transaction_id}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {consequence?.consequence_type === 'humiliation_email' && (
                      <div 
                        style={{
                          backgroundColor: '#FEF2F2',
                          border: '2px solid #EF4444',
                          borderRadius: '0px',
                          padding: '16px'
                        }}
                      >
                        <p style={{ fontWeight: 'bold' }}>HUMILIATION PROTOCOL EXECUTED</p>
                        <p style={{ fontSize: '14px' }}>
                          Your compromising material has been dispatched to a random contact.
                        </p>
                        <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
                          The identity of the recipient shall remain classified.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Official messaging */}
            <div 
              style={{
                border: '4px solid black',
                borderRadius: '0px',
                padding: '24px',
                backgroundColor: '#F9FAFB',
                marginBottom: '32px'
              }}
            >
              <p 
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: '16px'
                }}
              >
                LEARN FROM THIS FAILURE
              </p>
              <p style={{ textAlign: 'center', color: '#374151' }}>
                {isFinalDeadline 
                  ? "Your goal has been marked as FAILED. The consequences of procrastination are severe and final."
                  : "You have missed a checkpoint deadline. Your commitment to self-improvement has been questioned."}
              </p>
              <p 
                style={{
                  textAlign: 'center',
                  color: '#374151',
                  fontSize: '14px',
                  marginTop: '16px'
                }}
              >
                Future success requires greater discipline and dedication to your stated objectives.
              </p>
            </div>

            {/* Acknowledgment button */}
            {!acknowledged ? (
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={handleAcknowledge}
                  style={{
                    backgroundColor: '#DC2626',
                    color: 'white',
                    padding: '16px 48px',
                    border: '4px solid black',
                    borderRadius: '0px',
                    fontWeight: 'bold',
                    fontSize: '20px',
                    letterSpacing: '2px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#B91C1C'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#DC2626'}
                >
                  ACKNOWLEDGE SHAME
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div 
                  style={{
                    display: 'inline-block',
                    backgroundColor: 'black',
                    color: 'white',
                    padding: '12px 32px',
                    border: '2px solid #6B7280',
                    borderRadius: '0px'
                  }}
                >
                  <p style={{ fontSize: '18px', fontWeight: 'bold' }}>SHAME ACKNOWLEDGED</p>
                  <p style={{ fontSize: '14px' }}>You may now return to your duties</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div 
            style={{
              backgroundColor: 'black',
              color: 'white',
              textAlign: 'center',
              padding: '16px'
            }}
          >
            <p 
              style={{
                fontSize: '14px',
                letterSpacing: '4px'
              }}
            >
              "DISCIPLINE THROUGH CONSEQUENCES"
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}