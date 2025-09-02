import React, { useState, useEffect, useRef } from 'react'
import { Button } from '../ui/button'

export interface TextData {
  content: string
  characterCount: number
  isValid: boolean
}

interface Props {
  onTextChange: (textData: TextData) => void
  disabled?: boolean
  initialValue?: string
}

const TextDescriptionInput: React.FC<Props> = ({ 
  onTextChange, 
  disabled = false, 
  initialValue = '' 
}) => {
  const [content, setContent] = useState(initialValue)
  const [characterCount, setCharacterCount] = useState(initialValue.length)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()

  const MAX_CHARACTERS = 5000
  const MIN_CHARACTERS = 50

  const isValid = characterCount >= MIN_CHARACTERS && characterCount <= MAX_CHARACTERS

  // Auto-save to localStorage every 30 seconds
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (content.trim()) {
        localStorage.setItem('threativator_submission_draft', content)
      }
    }, 30000) // 30 seconds

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [content])

  // Load draft from localStorage on mount
  useEffect(() => {
    if (!initialValue) {
      const draft = localStorage.getItem('threativator_submission_draft')
      if (draft) {
        setContent(draft)
        setCharacterCount(draft.length)
      }
    }
  }, [initialValue])

  // Update parent component when content changes
  useEffect(() => {
    const textData: TextData = {
      content,
      characterCount,
      isValid
    }
    onTextChange(textData)
  }, [content, characterCount, isValid, onTextChange])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    
    // Enforce character limit
    if (newContent.length <= MAX_CHARACTERS) {
      setContent(newContent)
      setCharacterCount(newContent.length)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow navigation and deletion even at character limit
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 
      'ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab'
    ]
    
    if (characterCount >= MAX_CHARACTERS && !allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
    }
  }

  const clearDraft = () => {
    localStorage.removeItem('threativator_submission_draft')
    setContent('')
    setCharacterCount(0)
  }

  const getCharacterCountColor = () => {
    if (characterCount < MIN_CHARACTERS) {
      return 'text-[var(--color-primary-crimson)]'
    }
    if (characterCount > MAX_CHARACTERS * 0.9) {
      return 'text-orange-600'
    }
    return 'text-[var(--color-success-muted)]'
  }

  return (
    <div className="space-y-[var(--space-4)]">
      <div>
        <label className="block text-[var(--font-size-sm)] font-[var(--font-family-display)] font-bold uppercase mb-2">
          PROOF DESCRIPTION:
        </label>
        
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Describe your completed work in detail. Include:
• What you accomplished
• How it meets the requirements
• Any challenges you overcame
• Evidence of completion (screenshots, metrics, etc.)

Example: 'I completed chapters 1-3 of my novel, totaling 12,000 words. Each chapter follows the outline I created, with character development arcs for the main protagonist. I've included timestamps showing consistent daily writing sessions...'"
          className="w-full h-64 p-[var(--space-3)] border border-[var(--color-accent-black)] bg-white text-[var(--font-size-base)] font-[var(--font-family-body)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-crimson)] disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* Character Count and Validation */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className={`text-[var(--font-size-sm)] font-bold ${getCharacterCountColor()}`}>
            {characterCount} / {MAX_CHARACTERS} characters
          </div>
          
          {characterCount < MIN_CHARACTERS && (
            <p className="text-[var(--color-primary-crimson)] text-[var(--font-size-xs)]">
              Minimum {MIN_CHARACTERS} characters required
            </p>
          )}
          
          {characterCount > MAX_CHARACTERS * 0.9 && characterCount < MAX_CHARACTERS && (
            <p className="text-orange-600 text-[var(--font-size-xs)]">
              Approaching character limit
            </p>
          )}
        </div>

        {content.trim() && (
          <Button
            onClick={clearDraft}
            disabled={disabled}
            variant="ghost"
            size="sm"
            className="text-[var(--font-size-xs)] font-bold uppercase"
          >
            CLEAR DRAFT
          </Button>
        )}
      </div>

      {/* Validation Status */}
      <div className="min-h-[20px]">
        {content && (
          <>
            {isValid ? (
              <div className="flex items-center gap-2 text-[var(--color-success-muted)] text-[var(--font-size-sm)]">
                <span>✓</span>
                <span>Ready for submission</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[var(--color-primary-crimson)] text-[var(--font-size-sm)]">
                <span>✗</span>
                <span>
                  {characterCount < MIN_CHARACTERS 
                    ? `Need ${MIN_CHARACTERS - characterCount} more characters`
                    : 'Content too long'
                  }
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Auto-save Indicator */}
      <div className="text-[var(--font-size-xs)] text-[var(--color-text-primary)] opacity-50">
        💾 Auto-saved to local storage every 30 seconds
      </div>
    </div>
  )
}

export default TextDescriptionInput