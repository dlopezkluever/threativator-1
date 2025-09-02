import React from 'react'
import { cn } from '../../lib/utils'

export interface SovietButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'command' | 'action' | 'danger' | 'ghost' | 'success'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  isLoading?: boolean
  children: React.ReactNode
}

const SovietButton: React.FC<SovietButtonProps> = ({
  variant = 'action',
  size = 'md',
  icon,
  isLoading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = [
    'inline-flex items-center justify-center gap-2',
    'font-[var(--font-family-display)] text-display uppercase',
    'transition-colors duration-[var(--transition-fast)]',
    'border-[var(--border-width-medium)] border-solid',
    'cursor-pointer',
    'disabled:cursor-not-allowed disabled:opacity-50'
  ]

  const variantClasses = {
    command: [
      'bg-[var(--color-accent-black)] text-[var(--color-text-light)]',
      'border-[var(--color-container-light)]',
      'hover:bg-[var(--color-container-light)] hover:text-[var(--color-accent-black)]',
      'hover:border-[var(--color-accent-black)]'
    ],
    action: [
      'bg-[var(--color-container-light)] text-[var(--color-text-primary)]',
      'border-[var(--color-accent-black)]',
      'hover:bg-[var(--color-success-muted)] hover:text-[var(--color-text-light)]',
      'hover:border-[var(--color-success-muted)]'
    ],
    danger: [
      'bg-[var(--color-primary-red)] text-[var(--color-text-light)]',
      'border-[var(--color-accent-black)]',
      'hover:bg-[var(--color-accent-black)] hover:text-[var(--color-primary-red)]',
      'hover:border-[var(--color-primary-red)]'
    ],
    ghost: [
      'bg-transparent text-[var(--color-text-primary)]',
      'border-[var(--color-accent-black)]',
      'hover:bg-[var(--color-accent-black)] hover:text-[var(--color-text-light)]'
    ],
    success: [
      'bg-[var(--color-success-muted)] text-[var(--color-text-light)]',
      'border-[var(--color-accent-black)]',
      'hover:bg-[var(--color-accent-black)] hover:text-[var(--color-success-muted)]',
      'hover:border-[var(--color-success-muted)]'
    ]
  }

  const sizeClasses = {
    sm: ['text-[var(--font-size-xs)]', 'px-[var(--space-3)] py-[var(--space-2)]', 'min-h-[32px]'],
    md: ['text-[var(--font-size-sm)]', 'px-[var(--space-4)] py-[var(--space-3)]', 'min-h-[40px]'],
    lg: ['text-[var(--font-size-base)]', 'px-[var(--space-6)] py-[var(--space-4)]', 'min-h-[48px]']
  }

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-none" />
      )}
      {icon && !isLoading && icon}
      {children}
    </button>
  )
}

export default SovietButton