import * as React from "react"

import { cn } from "../../lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Kompromator Constructivist styling - sharp edges, beige background
      "border-[var(--border-width-medium)] border-[var(--color-border-primary)] bg-[var(--color-background-beige)] text-[var(--color-text-primary)] shadow-none",
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
      // Kompromator header styling - beige background, black text
      "flex flex-col space-y-1 p-[var(--space-4)] bg-[var(--color-background-beige)] text-[var(--color-text-primary)] border-b-[var(--border-width-medium)] border-[var(--color-border-primary)]",
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
      // Kompromator display typography - black text for headers
      "text-[var(--font-size-lg)] font-[var(--font-family-display)] uppercase tracking-wider leading-none text-[var(--color-text-primary)]",
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
      // Kompromator body text styling - black text for descriptions
      "text-[var(--font-size-xs)] font-[var(--font-family-body)] text-[var(--color-text-primary)] opacity-70 normal-case",
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
      // Kompromator footer with beige background
      "flex items-center p-[var(--space-3)] bg-[var(--color-background-beige)] text-[var(--color-text-primary)] border-t-[var(--border-width-medium)] border-[var(--color-border-primary)]",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
