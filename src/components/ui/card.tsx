import * as React from "react"

import { cn } from "../../lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Soviet Constructivist styling - sharp edges, high contrast
      "border-[var(--border-width-medium)] border-[var(--color-border-primary)] bg-[var(--color-container-light)] text-[var(--color-text-primary)] shadow-none",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Soviet banner header styling
      "flex flex-col space-y-1 p-[var(--space-4)] bg-[var(--color-primary-red)] text-[var(--color-text-light)] border-b-[var(--border-width-medium)] border-[var(--color-border-primary)]",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Soviet display typography
      "text-[var(--font-size-lg)] font-[var(--font-family-display)] uppercase tracking-wider leading-none text-[var(--color-text-light)]",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Soviet body text styling
      "text-[var(--font-size-xs)] font-[var(--font-family-body)] text-[var(--color-text-light)] opacity-90 normal-case",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("p-[var(--space-4)] pt-[var(--space-4)]", className)} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Soviet footer with dark background
      "flex items-center p-[var(--space-3)] bg-[var(--color-accent-black)] text-[var(--color-text-light)] border-t-[var(--border-width-medium)] border-[var(--color-primary-red)]",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
