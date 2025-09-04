import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'default' | 'large' | 'full'
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
}

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'large',
  closeOnBackdrop = true,
  closeOnEscape = true
}) => {
  // Handle ESC key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose, closeOnEscape])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const getSizeStyles = () => {
    switch (size) {
      case 'full':
        return {
          width: '100%',
          height: '100%'
        }
      case 'large':
        return {
          width: '90%',
          maxWidth: '896px', // 4xl = 56rem = 896px
          height: '90vh',
          maxHeight: '800px'
        }
      default:
        return {
          width: '80%',
          maxWidth: '672px', // 2xl = 42rem = 672px
          height: 'auto',
          maxHeight: '80vh'
        }
    }
  }

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closeOnBackdrop) {
      onClose()
    }
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={handleBackdropClick}
    >
      <div 
        style={{
          ...getSizeStyles(),
          backgroundColor: '#F5EEDC',
          border: '6px solid #000000',
          borderRadius: '0px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          backgroundColor: '#F5EEDC',
          borderBottom: '4px solid #000000',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <h2 style={{
            fontFamily: 'Stalinist One, Arial Black, sans-serif',
            fontSize: '24px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#000000',
            margin: 0
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              height: '32px',
              width: '32px',
              padding: '0',
              backgroundColor: 'transparent',
              border: '2px solid #000000',
              borderRadius: '0px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#C11B17'
              e.currentTarget.style.color = '#F5EEDC'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#000000'
            }}
          >
            <X style={{ height: '16px', width: '16px', color: 'inherit' }} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px'
        }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default BaseModal