import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/shared/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // New Pastel Variants for "Chips"
        success: "border-transparent bg-[var(--alert-success)] text-[var(--alert-success-foreground)] hover:bg-[var(--alert-success)]/80",
        warning: "border-transparent bg-[var(--alert-warning)] text-[var(--alert-warning-foreground)] hover:bg-[var(--alert-warning)]/80",
        error: "border-transparent bg-[var(--alert-warning-border)] text-destructive hover:bg-[var(--alert-warning-border)]/80", /* Using warning border as base for check or distinct error color? Design shows 'Error' as light red. Let's use destructive/15 */
        "soft-error": "border-transparent bg-destructive/15 text-destructive hover:bg-destructive/25",
        info: "border-transparent bg-[var(--alert-info)] text-[var(--alert-info-foreground)] hover:bg-[var(--alert-info)]/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
