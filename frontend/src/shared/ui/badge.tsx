import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/shared/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Soft/Pastel variants - nền nhạt, text đậm
        default: "border-transparent bg-primary/15 text-primary hover:bg-primary/25",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive/15 text-destructive hover:bg-destructive/25",
        outline: "border-border bg-background text-foreground hover:bg-accent",
        // Semantic variants using alert tokens from globals.css
        success: "border-[hsl(var(--alert-success-border))] bg-[hsl(var(--alert-success))] text-[hsl(var(--alert-success-foreground))] hover:bg-[hsl(var(--alert-success))]/80",
        warning: "border-[hsl(var(--alert-warning-border))] bg-[hsl(var(--alert-warning))] text-[hsl(var(--alert-warning-foreground))] hover:bg-[hsl(var(--alert-warning))]/80",
        error: "border-transparent bg-destructive/15 text-destructive hover:bg-destructive/25",
        "soft-error": "border-transparent bg-destructive/10 text-destructive hover:bg-destructive/20",
        info: "border-[hsl(var(--alert-info-border))] bg-[hsl(var(--alert-info))] text-[hsl(var(--alert-info-foreground))] hover:bg-[hsl(var(--alert-info))]/80",
      },
      size: {
        sm: "h-5 px-2 text-[10px]",
        default: "h-6 px-2.5 text-xs",
        lg: "h-7 px-3 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

