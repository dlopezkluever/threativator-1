import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  // Kompromator base button styling - sharp edges, strong typography
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-[var(--font-family-display)] uppercase tracking-wide ring-offset-background transition-colors duration-[var(--transition-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-[var(--border-width-medium)] border-solid",
  {
    variants: {
      variant: {
        // Kompromator Command button - black with beige text
        command: "bg-[var(--color-accent-black)] text-[var(--color-background-beige)] border-[var(--color-background-beige)] hover:bg-[var(--color-background-beige)] hover:text-[var(--color-accent-black)] hover:border-[var(--color-accent-black)]",
        // Kompromator Action button - beige with black text
        action: "bg-[var(--color-background-beige)] text-[var(--color-text-primary)] border-[var(--color-accent-black)] hover:bg-[var(--color-success-muted)] hover:text-[var(--color-background-beige)] hover:border-[var(--color-success-muted)]",
        // Kompromator Danger button - crimson
        danger: "bg-[var(--color-primary-crimson)] text-[var(--color-background-beige)] border-[var(--color-accent-black)] hover:bg-[var(--color-accent-black)] hover:text-[var(--color-primary-crimson)] hover:border-[var(--color-primary-crimson)]",
        // Kompromator Ghost button - transparent
        ghost: "bg-transparent text-[var(--color-text-primary)] border-[var(--color-accent-black)] hover:bg-[var(--color-accent-black)] hover:text-[var(--color-background-beige)]",
        // Kompromator Success button - green
        success: "bg-[var(--color-success-muted)] text-[var(--color-background-beige)] border-[var(--color-accent-black)] hover:bg-[var(--color-accent-black)] hover:text-[var(--color-success-muted)] hover:border-[var(--color-success-muted)]",
      },
      size: {
        default: "h-10 px-[var(--space-4)] py-[var(--space-2)]",
        sm: "h-8 px-[var(--space-3)] py-[var(--space-1)] text-[var(--font-size-xs)]",
        lg: "h-12 px-[var(--space-6)] py-[var(--space-3)] text-[var(--font-size-base)]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "action",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }