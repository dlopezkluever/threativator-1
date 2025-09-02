import React from 'react'
import { cn } from '../../lib/utils'

export interface SovietContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'none'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const SovietContainer: React.FC<SovietContainerProps> = ({
  children,
  className,
  maxWidth = 'xl',
  padding = 'md',
  ...props
}) => {
  const baseClasses = ['soviet-container', 'w-full', 'mx-auto']

  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-[var(--container-max-width)]',
    full: 'max-w-full',
    none: ''
  }

  const paddingClasses = {
    none: '',
    sm: 'px-[var(--container-padding-mobile)] md:px-[var(--container-padding-tablet)]',
    md: 'px-[var(--container-padding-mobile)] md:px-[var(--container-padding-tablet)] lg:px-[var(--container-padding-desktop)]',
    lg: 'px-[var(--space-6)] md:px-[var(--space-8)] lg:px-[var(--space-12)]'
  }

  return (
    <div
      className={cn(
        baseClasses,
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default SovietContainer