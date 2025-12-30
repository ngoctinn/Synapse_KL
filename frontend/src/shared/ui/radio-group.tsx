"use client"

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"
import * as React from "react"

import { cn } from "@/shared/lib/utils"

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "aspect-square size-5 rounded-full border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer group",
        // Unselected
        "border-neutral-30 bg-white shadow-none hover:border-primary/60",
        // Selected
        "data-[state=checked]:border-primary",
        // Disabled (Inactive)
        "disabled:border-neutral-20 disabled:bg-white disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex items-center justify-center h-full w-full"
      >
        <Circle className={cn(
          "size-2.5 fill-primary text-primary",
          "group-disabled:fill-primary/30 group-disabled:text-primary/30"
        )} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
