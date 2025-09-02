import React from 'react'
import { cn } from '../../lib/utils'

export interface SovietCardProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'intel' | 'success'
  size?: 'sm' | 'md' | 'lg'
  elevation?: 0 | 1 | 2 | 3
  border?: 'none' | 'thin' | 'thick'
  children: React.ReactNode
  className?: string
}

const SovietCard: React.FC<SovietCardProps> = ({
  variant = 'primary',
  size = 'md',
  elevation = 1,
  border = 'thin',
  children,
  className,
  ...props
}) => {
  const baseClasses = 'soviet-card'
  
  const variantClasses = {
    primary: 'bg-[var(--color-container-light)] text-[var(--color-text-primary)]',
    secondary: 'bg-[var(--color-background-parchment)] text-[var(--color-text-primary)]',
    danger: 'bg-[var(--color-primary-red)] text-[var(--color-text-light)]',
    intel: 'bg-[var(--color-accent-black)] text-[var(--color-text-light)]',
    success: 'bg-[var(--color-success-muted)] text-[var(--color-text-light)]'
  }
  
  const sizeClasses = {
    sm: 'p-[var(--card-padding-sm)]',
    md: 'p-[var(--card-padding)]',
    lg: 'p-[var(--space-8)]'
  }
  
  const borderClasses = {
    none: 'border-0',
    thin: 'border-[var(--border-width-thin)] border-[var(--color-border-primary)]',
    thick: 'border-[var(--border-width-thick)] border-[var(--color-border-primary)]'
  }
  
  const elevationClasses = {
    0: '',
    1: 'border-[var(--border-width-medium)] border-[var(--color-border-primary)]',
    2: 'border-[var(--border-width-medium)] border-[var(--color-border-primary)]',
    3: 'border-[var(--border-width-thick)] border-[var(--color-border-primary)]'
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        border !== 'none' ? borderClasses[border] : elevationClasses[elevation],
        'transition-colors duration-[var(--transition-fast)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default SovietCard