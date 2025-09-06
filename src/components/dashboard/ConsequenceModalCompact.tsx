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

export default function ConsequenceModalCompact({ 
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
      const timer1 = setTimeout(() => setShowContent(true), 300)
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
    setTimeout(handleClose, 800)
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
        transition: 'all 0.3s ease',
        opacity: isVisible ? 1 : 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      {/* Red flash + dark overlay combined */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isVisible && showContent ? 'rgba(220, 41, 28, 0.3)' : 'rgba(0, 0, 0, 0.8)',
          transition: 'all 0.3s ease'
        }}
        onClick={handleClose}
      />
      
      {/* Compact Modal */}
      <div 
        style={{
          position: 'relative',
          backgroundColor: 'white',
          border: '6px solid black',
          borderRadius: '0px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          transform: showContent ? 'scale(1)' : 'scale(0.8)',
          transition: 'all 0.4s ease',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header */}
        <div 
          style={{
            backgroundColor: '#DC2626',
            padding: '12px 20px',
            textAlign: 'center',
            position: 'relative',
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(0,0,0,0.1) 8px, rgba(0,0,0,0.1) 16px)'
          }}
        >
          <div style={{ position: 'relative', zIndex: 10 }}>
            <div 
              style={{
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                letterSpacing: '1px'
              }}
            >
              ⚠️ STATE COMMUNICATION ⚠️
            </div>
          </div>
          
          {acknowledged && (
            <button
              onClick={handleClose}
              style={{
                position: 'absolute',
                top: '8px',
                right: '12px',
                color: 'white',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                zIndex: 20
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Compact Content */}
        <div style={{ padding: '20px' }}>
          {/* Consequence stamp - smaller */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div 
              style={{
                display: 'inline-block',
                backgroundColor: '#DC2626',
                color: 'white',
                padding: '8px 16px',
                border: '3px solid black',
                borderRadius: '0px',
                transform: 'rotate(1deg)',
                fontSize: '14px',
                fontWeight: 'bold',
                letterSpacing: '1px'
              }}
            >
              {isFinalDeadline ? 'FINAL JUDGMENT' : 'CONSEQUENCE TRIGGERED'}
            </div>
          </div>

          {/* Compact main message */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#DC2626',
                marginBottom: '8px',
                letterSpacing: '2px',
                margin: '0 0 8px 0'
              }}
            >
              GREAT DISHONOR
            </h2>
            <p 
              style={{
                fontSize: '16px',
                color: 'black',
                margin: '0 0 16px 0'
              }}
            >
              COMES UPON YOU, COMRADE
            </p>
            
            <div 
              style={{
                backgroundColor: '#FFFFFF',  // Pure white background
                border: '3px solid black',
                borderRadius: '0px',
                padding: '16px',
                marginBottom: '16px'
              }}
            >
              <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', margin: '0 0 12px 0', color: '#000000' }}>
                STATE DIRECTIVE EXECUTED
              </p>
              
              {!wasTriggered ? (
                <div 
                  style={{
                    backgroundColor: '#F0FDF4',
                    border: '2px solid #16A34A',
                    borderRadius: '0px',
                    padding: '12px'
                  }}
                >
                  <p style={{ color: '#166534', fontWeight: 'bold', fontSize: '13px', margin: 0 }}>
                    THE STATE SHOWS MERCY
                  </p>
                  <p style={{ color: '#15803D', fontSize: '12px', margin: '4px 0 0 0' }}>
                    Russian Roulette spared you... this time.
                  </p>
                </div>
              ) : (
                <div>
                  <p 
                    style={{
                      color: '#000000',  // BLACK text for readability on light background
                      fontWeight: 'bold',
                      marginBottom: '12px',
                      fontSize: '13px',
                      margin: '0 0 12px 0'
                    }}
                  >
                    {isFinalDeadline ? 'MAXIMUM PENALTY' : 'DISCIPLINARY ACTION'}
                  </p>
                  
                  {consequence?.consequence_type === 'monetary' && (
                    <div 
                      style={{
                        backgroundColor: '#FEF2F2',
                        border: '2px solid #EF4444',
                        borderRadius: '0px',
                        padding: '12px'
                      }}
                    >
                      <p style={{ fontWeight: 'bold', fontSize: '12px', margin: '0 0 4px 0', color: '#000000' }}>MONETARY PENALTY</p>
                      <p style={{ fontSize: '12px', margin: '0 0 6px 0', color: '#000000' }}>
                        ${consequence.monetary_amount?.toFixed(2)} → {consequence.charity_destination?.replace(/_/g, ' ').toUpperCase()}
                      </p>
                      {consequence.execution_details?.stripe_transaction_id && (
                        <p style={{ fontSize: '10px', color: '#000000', margin: 0 }}>
                          ID: {consequence.execution_details.stripe_transaction_id.slice(-8)}
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
                        padding: '12px'
                      }}
                    >
                      <p style={{ fontWeight: 'bold', fontSize: '12px', margin: '0 0 4px 0', color: '#000000' }}>HUMILIATION PROTOCOL</p>
                      <p style={{ fontSize: '12px', margin: 0, color: '#000000' }}>
                        Compromising material dispatched. Recipient classified.
                      </p>
                    </div>
                  )}
                  
                  {consequence?.consequence_type === 'grading_failure' && (
                    <div 
                      style={{
                        backgroundColor: '#FEF2F2',
                        border: '2px solid #EF4444',
                        borderRadius: '0px',
                        padding: '12px'
                      }}
                    >
                      <p style={{ fontWeight: 'bold', fontSize: '12px', margin: '0 0 4px 0', color: '#000000' }}>SUBMISSION REJECTED</p>
                      <p style={{ fontSize: '12px', margin: 0, color: '#000000' }}>
                        Your proof failed state evaluation. Resubmit better evidence or seek witness override.
                      </p>
                      {consequence?.execution_details?.feedback && (
                        <p style={{ fontSize: '10px', color: '#000000', margin: '4px 0 0 0', fontStyle: 'italic' }}>
                          "{consequence.execution_details.feedback}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Compact message */}
          <div 
            style={{
              border: '3px solid black',
              borderRadius: '0px',
              padding: '12px',
              backgroundColor: '#FFFFFF',  // Pure white background
              marginBottom: '20px'
            }}
          >
            <p 
              style={{
                fontSize: '13px',
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: '8px',
                margin: '0 0 8px 0',
                color: '#000000'  // BLACK text for readability
              }}
            >
              LEARN FROM THIS FAILURE
            </p>
            <p style={{ textAlign: 'center', color: '#000000', fontSize: '12px', margin: 0 }}>
              {isFinalDeadline 
                ? "Goal marked FAILED. Procrastination has severe consequences."
                : "Checkpoint missed. Your discipline commitment questioned."}
            </p>
          </div>

          {/* Compact button */}
          {!acknowledged ? (
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handleAcknowledge}
                style={{
                  backgroundColor: '#DC2626',
                  color: 'white',
                  padding: '12px 24px',
                  border: '3px solid black',
                  borderRadius: '0px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
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
                  padding: '8px 16px',
                  border: '2px solid #6B7280',
                  borderRadius: '0px'
                }}
              >
                <p style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 2px 0' }}>SHAME ACKNOWLEDGED</p>
                <p style={{ fontSize: '11px', margin: 0 }}>Return to duties</p>
              </div>
            </div>
          )}
        </div>

        {/* Compact Footer */}
        <div 
          style={{
            backgroundColor: 'black',
            color: 'white',
            textAlign: 'center',
            padding: '8px'
          }}
        >
          <p 
            style={{
              fontSize: '10px',
              letterSpacing: '2px',
              margin: 0
            }}
          >
            "DISCIPLINE THROUGH CONSEQUENCES"
          </p>
        </div>
      </div>
    </div>
  )
}