import * as React from "react"

import { cn } from "../../lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Kompromator Propaganda styling - thick borders, beige background
      "border-[var(--border-width-thick)] border-[var(--color-border-primary)] bg-[var(--color-background-beige)] text-[var(--color-text-primary)] shadow-none",
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
      // Kompromator propaganda header - thick borders, strong typography
      "flex flex-col space-y-2 p-[var(--space-6)] bg-[var(--color-background-beige)] text-[var(--color-text-primary)] border-b-[var(--border-width-thick)] border-[var(--color-border-primary)]",
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
      // Kompromator propaganda card titles - large, bold, authoritative
      "text-card-title text-[var(--color-text-primary)]",
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
      // Kompromator subtitle styling - readable, authoritative
      "text-subtitle text-[var(--color-text-primary)] opacity-80",
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
    className={cn("p-[var(--space-6)] text-[var(--color-text-primary)]", className)} 
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
      // Kompromator footer with thick borders
      "flex items-center p-[var(--space-4)] bg-[var(--color-background-beige)] text-[var(--color-text-primary)] border-t-[var(--border-width-thick)] border-[var(--color-border-primary)]",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
