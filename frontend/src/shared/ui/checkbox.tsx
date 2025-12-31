"use client"

import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon, MinusIcon } from "lucide-react"
import * as React from "react"

import { cn } from "@/shared/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-5 shrink-0 rounded-[4px] border-2 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer",
        // Default (Unselected)
        "border-neutral-30 bg-card hover:border-primary/60",
        // Selected (Checked)
        "data-[state=checked]:bg-neutral-100 data-[state=checked]:border-neutral-100 data-[state=checked]:text-neutral-0",
        // Indeterminate
        "data-[state=indeterminate]:bg-neutral-100 data-[state=indeterminate]:border-neutral-100 data-[state=indeterminate]:text-neutral-0",
        // DISABLED STATES
        // Inactive Unselected
        "disabled:border-neutral-20 disabled:bg-muted disabled:cursor-not-allowed",
        // Inactive Selected
        "disabled:data-[state=checked]:bg-primary/20 disabled:data-[state=checked]:border-transparent disabled:data-[state=checked]:text-primary-foreground/80",
        // Inactive Indeterminate
        "disabled:data-[state=indeterminate]:bg-primary/20 disabled:data-[state=indeterminate]:border-transparent disabled:data-[state=indeterminate]:text-primary-foreground/80",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center h-full w-full"
      >
        <CheckIcon className="size-3.5 block data-[state=indeterminate]:hidden text-current stroke-[3]" />
        <MinusIcon className="size-3.5 hidden data-[state=indeterminate]:block text-current stroke-[4]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }

