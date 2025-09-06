// Simple test modal to debug rendering issues
import React from 'react'

interface SimpleTestModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SimpleTestModal({ isOpen, onClose }: SimpleTestModalProps) {
  if (!isOpen) return null

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          border: '8px solid black',
          borderRadius: '0px',
          padding: '40px',
          maxWidth: '600px',
          width: '90%'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: '#DA291C',
            color: 'white',
            padding: '20px',
            textAlign: 'center',
            marginBottom: '20px',
            border: '4px solid black'
          }}
        >
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            ⚠️ TEST MODAL WORKING ⚠️
          </h1>
        </div>

        {/* Content */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '32px', color: '#DA291C', fontWeight: 'bold', margin: '20px 0' }}>
            GREAT DISHONOR
          </h2>
          <p style={{ fontSize: '18px', marginBottom: '20px' }}>
            COMES UPON YOU, COMRADE
          </p>
          <div
            style={{
              backgroundColor: '#f5f5f5',
              border: '4px solid black',
              padding: '20px',
              marginBottom: '20px'
            }}
          >
            <p style={{ fontWeight: 'bold', fontSize: '16px' }}>
              STATE DIRECTIVE HAS BEEN EXECUTED
            </p>
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '2px solid #DC2626',
                padding: '15px',
                marginTop: '15px'
              }}
            >
              <p style={{ fontWeight: 'bold' }}>MONETARY PENALTY EXECUTED</p>
              <p style={{ fontSize: '14px' }}>
                $25.00 transferred to DOCTORS WITHOUT BORDERS
              </p>
            </div>
          </div>
        </div>

        {/* Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#DA291C',
              color: 'white',
              border: '4px solid black',
              padding: '15px 30px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              borderRadius: '0px'
            }}
          >
            ACKNOWLEDGE SHAME
          </button>
        </div>
      </div>
    </div>
  )
}