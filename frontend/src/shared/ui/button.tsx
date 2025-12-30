import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import * as React from "react"

import { cn } from "@/shared/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        // Contained (Primary)
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
        // Destructive
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/80 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        // Outlined
        outline:
          "border border-primary/30 bg-transparent text-primary shadow-xs hover:bg-primary/10 hover:border-primary/50 active:bg-primary/20",
        // Secondary
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70",
        // Ghost/Texted
        ghost:
          "text-primary hover:bg-primary/10 hover:text-primary active:bg-primary/20 dark:hover:bg-accent/50",
        // Link
        link: "text-primary underline-offset-4 hover:underline active:text-primary/80",
      },
      size: {
        sm: "h-9 rounded-md gap-1.5 px-4 has-[>svg]:px-3",
        default: "h-12 px-8 py-2 has-[>svg]:px-6",
        lg: "h-14 rounded-lg px-10 has-[>svg]:px-8",
        icon: "size-12",
        "icon-sm": "size-9",
        "icon-lg": "size-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </Comp>
  )
}

export { Button, buttonVariants }
