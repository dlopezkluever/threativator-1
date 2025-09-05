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

export default function ConsequenceModal({ 
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
    <div className={`fixed inset-0 z-50 transition-all duration-500 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Red screen flash effect */}
      <div className={`absolute inset-0 bg-red-600 transition-opacity duration-300 ${
        isVisible && showContent ? 'opacity-20' : 'opacity-0'
      }`} />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-75" />
      
      {/* Main modal */}
      <div className={`
        relative flex items-center justify-center min-h-screen p-4
        ${showContent ? 'animate-pulse' : ''}
      `}>
        <div className={`
          bg-white border-8 border-black max-w-2xl w-full
          transform transition-all duration-700
          ${showContent ? 'scale-100 rotate-0' : 'scale-50 rotate-3'}
        `}>
          {/* Header */}
          <div className="bg-red-600 px-8 py-6 text-center relative">
            <div className="absolute inset-0 bg-red-600" 
                 style={{
                   backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)'
                 }} />
            
            <div className="relative z-10">
              <div className="text-white text-3xl font-bold mb-2 tracking-wider">
                ⚠️ OFFICIAL STATE COMMUNICATION ⚠️
              </div>
              <div className="text-white text-sm tracking-widest">
                THREATIVATOR ACCOUNTABILITY DIVISION
              </div>
            </div>
            
            {acknowledged && (
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-white hover:text-gray-200 z-20"
              >
                <X size={24} />
              </button>
            )}
          </div>

          {/* Main content */}
          <div className="p-8 bg-white">
            {/* Consequence stamp */}
            <div className="text-center mb-8">
              <div className="inline-block bg-red-600 text-white px-8 py-4 border-4 border-black transform rotate-2">
                <div className="text-2xl font-bold tracking-wider">
                  {isFinalDeadline ? 'FINAL JUDGMENT EXECUTED' : 'CONSEQUENCE TRIGGERED'}
                </div>
              </div>
            </div>

            {/* Main message */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-red-600 mb-4 tracking-wider">
                GREAT DISHONOR
              </h2>
              <p className="text-xl text-black mb-6">
                COMES UPON YOU, COMRADE
              </p>
              
              <div className="bg-gray-100 border-4 border-black p-6 mb-6">
                <p className="text-lg font-bold mb-4">STATE DIRECTIVE HAS BEEN EXECUTED</p>
                
                {!wasTriggered ? (
                  <div className="bg-green-100 border-2 border-green-600 p-4">
                    <p className="text-green-800 font-bold">
                      THE STATE SHOWS MERCY
                    </p>
                    <p className="text-green-700 text-sm">
                      Russian Roulette has spared you... this time.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-red-700 font-bold">
                      {isFinalDeadline ? 'MAXIMUM PENALTY ENFORCED' : 'DISCIPLINARY ACTION TAKEN'}
                    </p>
                    
                    {/* Show consequence details */}
                    {consequence?.consequence_type === 'monetary' && (
                      <div className="bg-red-50 border-2 border-red-400 p-4">
                        <p className="font-bold">MONETARY PENALTY EXECUTED</p>
                        <p className="text-sm">
                          ${consequence.monetary_amount?.toFixed(2)} transferred to {consequence.charity_destination?.replace(/_/g, ' ').toUpperCase()}
                        </p>
                        {consequence.execution_details?.stripe_transaction_id && (
                          <p className="text-xs text-gray-600 mt-2">
                            Transaction: {consequence.execution_details.stripe_transaction_id}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {consequence?.consequence_type === 'humiliation_email' && (
                      <div className="bg-red-50 border-2 border-red-400 p-4">
                        <p className="font-bold">HUMILIATION PROTOCOL EXECUTED</p>
                        <p className="text-sm">
                          Your compromising material has been dispatched to a random contact.
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          The identity of the recipient shall remain classified.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Official messaging */}
            <div className="border-4 border-black p-6 bg-gray-50 mb-8">
              <p className="text-lg font-bold text-center mb-4">
                LEARN FROM THIS FAILURE
              </p>
              <p className="text-center text-gray-700">
                {isFinalDeadline 
                  ? "Your goal has been marked as FAILED. The consequences of procrastination are severe and final."
                  : "You have missed a checkpoint deadline. Your commitment to self-improvement has been questioned."}
              </p>
              <p className="text-center text-gray-700 text-sm mt-4">
                Future success requires greater discipline and dedication to your stated objectives.
              </p>
            </div>

            {/* Acknowledgment button */}
            {!acknowledged ? (
              <div className="text-center">
                <button
                  onClick={handleAcknowledge}
                  className="bg-red-600 text-white px-12 py-4 border-4 border-black font-bold text-xl tracking-wider hover:bg-red-700 transition-colors"
                >
                  ACKNOWLEDGE SHAME
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="inline-block bg-black text-white px-8 py-3 border-2 border-gray-400">
                  <p className="text-lg font-bold">SHAME ACKNOWLEDGED</p>
                  <p className="text-sm">You may now return to your duties</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-black text-white text-center py-4">
            <p className="text-sm tracking-widest">
              "DISCIPLINE THROUGH CONSEQUENCES"
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}