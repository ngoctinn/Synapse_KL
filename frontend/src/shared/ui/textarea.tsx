import { cn } from "@/shared/lib/utils"
import * as React from "react"

type TextareaProps = React.ComponentProps<"textarea">

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "border-input placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20 flex min-h-[80px] w-full rounded-lg border bg-card px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
