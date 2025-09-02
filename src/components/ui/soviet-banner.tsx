import React from 'react'
import { cn } from '../../lib/utils'

export interface SovietBannerProps {
  type?: 'header' | 'alert' | 'status' | 'classified'
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

const SovietBanner: React.FC<SovietBannerProps> = ({
  type = 'header',
  icon,
  children,
  className,
  ...props
}) => {
  const baseClasses = [
    'soviet-banner',
    'font-[var(--font-family-display)] text-display uppercase',
    'flex items-center gap-[var(--space-2)]',
    'px-[var(--space-4)] py-[var(--space-3)]',
    'border-[var(--border-width-medium)] border-solid'
  ]

  const typeClasses = {
    header: [
      'bg-[var(--color-accent-black)] text-[var(--color-text-light)]',
      'border-[var(--color-primary-red)]',
      'text-[var(--font-size-xl)]',
      'tracking-wider'
    ],
    alert: [
      'bg-[var(--color-primary-red)] text-[var(--color-text-light)]',
      'border-[var(--color-accent-black)]',
      'text-[var(--font-size-lg)]'
    ],
    status: [
      'bg-[var(--color-success-muted)] text-[var(--color-text-light)]',
      'border-[var(--color-accent-black)]',
      'text-[var(--font-size-base)]'
    ],
    classified: [
      'bg-[var(--color-background-parchment)] text-[var(--color-text-primary)]',
      'border-[var(--color-primary-red)]',
      'text-[var(--font-size-lg)]'
    ]
  }

  return (
    <div
      className={cn(
        baseClasses,
        typeClasses[type],
        className
      )}
      {...props}
    >
      {icon && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}
      <span className="flex-1">
        {children}
      </span>
    </div>
  )
}

export default SovietBanner