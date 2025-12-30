"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, Search, X } from "lucide-react"
import * as React from "react"

import { cn } from "@/shared/lib/utils"

const searchInputVariants = cva(
  "flex items-center gap-2 rounded-lg border bg-card transition-all",
  {
    variants: {
      size: {
        sm: "h-10 px-3",
        default: "h-12 px-4",
        lg: "h-14 px-5",
      },
      state: {
        default: "border-input focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
        focused: "border-primary ring-2 ring-primary/20",
        error: "border-destructive focus-within:ring-2 focus-within:ring-destructive/20",
        success: "border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20",
        warning: "border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20",
        disabled: "border-input bg-muted opacity-50 cursor-not-allowed",
      },
    },
    defaultVariants: {
      size: "default",
      state: "default",
    },
  }
)

interface SearchInputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof searchInputVariants> {
  onClear?: () => void
  showClearButton?: boolean
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, size, state, value, onClear, showClearButton = true, disabled, ...props }, ref) => {
    const hasValue = value !== undefined && value !== ""
    const isError = state === "error"
    const isDisabled = disabled || state === "disabled"

    return (
      <div className={cn(searchInputVariants({ size, state: isDisabled ? "disabled" : state }), className)}>
        <Search className="size-4 text-muted-foreground shrink-0" />
        <input
          ref={ref}
          type="text"
          value={value}
          disabled={isDisabled}
          data-slot="search-input"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          {...props}
        />
        {showClearButton && hasValue && !isDisabled && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 rounded-full p-1 hover:bg-muted transition-colors"
            aria-label="Clear search"
          >
            <X className={cn("size-4", isError ? "text-destructive" : "text-muted-foreground")} />
          </button>
        )}
        {isError && !hasValue && (
          <AlertCircle className="size-4 text-destructive shrink-0" />
        )}
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

export { SearchInput, searchInputVariants }
