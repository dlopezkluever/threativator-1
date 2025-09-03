import { useState } from 'react'

interface ModalState {
  [key: string]: boolean
}

interface ModalControl {
  openModal: (modalName: string) => void
  closeModal: (modalName: string) => void
  closeAllModals: () => void
  isModalOpen: (modalName: string) => boolean
}

export const useModalState = (initialModals: string[] = []): [ModalState, ModalControl] => {
  const [modals, setModals] = useState<ModalState>(() => 
    initialModals.reduce((acc, modal) => ({ ...acc, [modal]: false }), {})
  )

  const openModal = (modalName: string) => {
    setModals(prev => {
      // Close all other modals first (only one modal open at a time)
      const newState = Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {})
      return { ...newState, [modalName]: true }
    })
  }

  const closeModal = (modalName: string) => {
    setModals(prev => ({ ...prev, [modalName]: false }))
  }

  const closeAllModals = () => {
    setModals(prev => 
      Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {})
    )
  }

  const isModalOpen = (modalName: string) => {
    return modals[modalName] || false
  }

  return [
    modals,
    {
      openModal,
      closeModal,
      closeAllModals,
      isModalOpen
    }
  ]
}

// Predefined modal names for consistency
export const MODAL_NAMES = {
  PAYMENT: 'payment',
  KOMPROMAT: 'kompromat', 
  CONTACT: 'contact',
  SOCIAL_MEDIA: 'socialMedia'
} as const

export type ModalName = typeof MODAL_NAMES[keyof typeof MODAL_NAMES]