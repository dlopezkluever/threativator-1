import React from 'react'
import { cn } from '../../lib/utils'

export interface SovietGridProps {
  children: React.ReactNode
  className?: string
  columns?: 1 | 2 | 3 | 4 | 6 | 12
  gap?: 'none' | 'sm' | 'md' | 'lg'
  responsive?: boolean
}

const SovietGrid: React.FC<SovietGridProps> = ({
  children,
  className,
  columns = 12,
  gap = 'md',
  responsive = true,
  ...props
}) => {
  const baseClasses = ['soviet-grid', 'grid', 'w-full']

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3', 
    4: 'grid-cols-4',
    6: 'grid-cols-6',
    12: 'grid-cols-12'
  }

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-[var(--grid-gap-mobile)] md:gap-[var(--space-4)]',
    md: 'gap-[var(--grid-gap-mobile)] md:gap-[var(--grid-gap)]',
    lg: 'gap-[var(--space-6)] md:gap-[var(--space-10)]'
  }

  const responsiveClasses = responsive ? [
    'grid-cols-1',
    `md:${columnClasses[columns]}`
  ] : [columnClasses[columns]]

  return (
    <div
      className={cn(
        baseClasses,
        responsiveClasses,
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default SovietGrid