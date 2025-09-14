import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, FileText, RotateCcw } from 'lucide-react'

interface GradingResult {
  id: string
  submissionId: string
  status: 'passed' | 'failed'
  feedbackText: string
  confidenceScore?: number
  aiAnalysisResult?: any
  submissionType: 'file_upload' | 'external_url' | 'text_description'
  submittedAt: string
  gradedAt: string
  checkpointTitle: string
  goalTitle: string
  checkpointId: string
}

interface GradingResultModalProps {
  isOpen: boolean
  onClose: () => void
  result: GradingResult | null
  onResubmit?: (checkpointId: string) => void
}

export default function GradingResultModal({
  isOpen,
  onClose,
  result,
  onResubmit
}: GradingResultModalProps) {
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

  const handleResubmit = () => {
    if (result && onResubmit) {
      onResubmit(result.checkpointId)
    }
    handleClose()
  }

  const isPassed = result?.status === 'passed'

  if (!isOpen || !result) return null

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
      {/* Success flash (green) or failure flash (red) with dark overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isVisible && showContent
            ? isPassed
              ? 'rgba(34, 197, 94, 0.3)' // Green flash for success
              : 'rgba(220, 41, 28, 0.3)'  // Red flash for failure
            : 'rgba(0, 0, 0, 0.8)',
          transition: 'all 0.3s ease'
        }}
        onClick={handleClose}
      />

      {/* Modal */}
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
        {/* Header */}
        <div
          style={{
            backgroundColor: isPassed ? '#22C55E' : '#DC2626',
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
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isPassed ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              {isPassed ? '✅ SUBMISSION APPROVED' : '❌ SUBMISSION REJECTED'}
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

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {/* Result stamp */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div
              style={{
                display: 'inline-block',
                backgroundColor: isPassed ? '#22C55E' : '#DC2626',
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
              {isPassed ? 'MISSION ACCOMPLISHED' : 'SUBMISSION FAILED'}
            </div>
          </div>

          {/* Checkpoint/Goal Info */}
          <div
            style={{
              backgroundColor: '#F8F9FA',
              border: '2px solid black',
              borderRadius: '0px',
              padding: '12px',
              marginBottom: '16px'
            }}
          >
            <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', margin: '0 0 4px 0', color: '#000000' }}>
              OBJECTIVE: {result.checkpointTitle}
            </p>
            <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>
              MISSION: {result.goalTitle}
            </p>
          </div>

          {/* Main message */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2
              style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: isPassed ? '#22C55E' : '#DC2626',
                marginBottom: '8px',
                letterSpacing: '1px',
                margin: '0 0 8px 0'
              }}
            >
              {isPassed ? 'EXCELLENT WORK' : 'SUBMISSION REJECTED'}
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: '#6B7280',
                margin: '0 0 16px 0'
              }}
            >
              {isPassed
                ? 'YOUR PROOF HAS BEEN VALIDATED'
                : 'YOUR PROOF REQUIRES IMPROVEMENT'}
            </p>

            {/* AI Feedback Section */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '3px solid black',
                borderRadius: '0px',
                padding: '16px',
                marginBottom: '16px',
                textAlign: 'left'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px'
              }}>
                <FileText size={16} />
                <p style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, color: '#000000' }}>
                  AI EVALUATION REPORT
                </p>
                {result.confidenceScore && (
                  <span style={{
                    fontSize: '11px',
                    color: '#6B7280',
                    marginLeft: 'auto'
                  }}>
                    Confidence: {Math.round(result.confidenceScore * 100)}%
                  </span>
                )}
              </div>

              {result.feedbackText && (
                <div
                  style={{
                    backgroundColor: isPassed ? '#F0FDF4' : '#FEF2F2',
                    border: `2px solid ${isPassed ? '#22C55E' : '#EF4444'}`,
                    borderRadius: '0px',
                    padding: '12px',
                    marginBottom: '12px'
                  }}
                >
                  <p style={{
                    color: '#000000',
                    fontSize: '13px',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    "{result.feedbackText}"
                  </p>
                </div>
              )}

              {/* Submission Details */}
              <div style={{ fontSize: '11px', color: '#6B7280' }}>
                <p style={{ margin: '0 0 2px 0' }}>
                  Submitted: {new Date(result.submittedAt).toLocaleString()}
                </p>
                <p style={{ margin: '0 0 2px 0' }}>
                  Graded: {new Date(result.gradedAt).toLocaleString()}
                </p>
                <p style={{ margin: 0 }}>
                  Type: {result.submissionType.replace('_', ' ').toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Action message */}
          <div
            style={{
              border: '3px solid black',
              borderRadius: '0px',
              padding: '12px',
              backgroundColor: '#FFFFFF',
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
                color: '#000000'
              }}
            >
              {isPassed ? 'PROCEED TO NEXT OBJECTIVE' : 'IMMEDIATE ACTION REQUIRED'}
            </p>
            <p style={{ textAlign: 'center', color: '#000000', fontSize: '12px', margin: 0 }}>
              {isPassed
                ? "Checkpoint complete. Continue your mission with discipline."
                : "Improve your submission or request witness override."}
            </p>
          </div>

          {/* Action buttons */}
          {!acknowledged ? (
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {!isPassed && onResubmit && (
                <button
                  onClick={handleResubmit}
                  style={{
                    backgroundColor: '#DC2626',
                    color: 'white',
                    padding: '10px 20px',
                    border: '2px solid black',
                    borderRadius: '0px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                >
                  <RotateCcw size={14} />
                  RESUBMIT
                </button>
              )}

              <button
                onClick={handleAcknowledge}
                style={{
                  backgroundColor: isPassed ? '#22C55E' : '#6B7280',
                  color: 'white',
                  padding: '10px 20px',
                  border: '2px solid black',
                  borderRadius: '0px',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = isPassed ? '#16A34A' : '#4B5563'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = isPassed ? '#22C55E' : '#6B7280'
                }}
              >
                {isPassed ? 'ACKNOWLEDGE SUCCESS' : 'ACKNOWLEDGE FAILURE'}
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
                <p style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 2px 0' }}>
                  {isPassed ? 'SUCCESS ACKNOWLEDGED' : 'FAILURE ACKNOWLEDGED'}
                </p>
                <p style={{ fontSize: '11px', margin: 0 }}>Return to duties</p>
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
            {isPassed ? '"SUCCESS THROUGH DISCIPLINE"' : '"LEARN FROM FAILURE"'}
          </p>
        </div>
      </div>
    </div>
  )
}