"use client"

import * as SwitchPrimitive from "@radix-ui/react-switch"
import * as React from "react"

import { cn } from "@/shared/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed cursor-pointer",
        // Unselected (Inactive)
        "bg-white border-neutral-30 data-[state=unchecked]:bg-white hover:border-primary/60",
        // Selected (Active)
        "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
        // Disabled States
        "disabled:border-neutral-20 disabled:bg-white",
        "disabled:data-[state=checked]:bg-primary/20 disabled:data-[state=checked]:border-transparent",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-primary pointer-events-none block size-4.5 rounded-full shadow-lg transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5 data-[state=checked]:bg-white",
          "disabled:bg-neutral-20"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }

