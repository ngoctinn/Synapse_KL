"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { cn } from "@/shared/lib/utils"

interface TimePickerDropdownProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  step?: number // minutes, default 30
}

export function TimePickerDropdown({
  value,
  onChange,
  placeholder = "--:--",
  className,
  disabled,
  step = 30,
}: TimePickerDropdownProps) {
  const options = React.useMemo(() => {
    const times: string[] = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += step) {
        const h = hour.toString().padStart(2, "0")
        const m = minute.toString().padStart(2, "0")
        times.push(`${h}:${m}`)
      }
    }
    return times
  }, [step])

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger 
        className={cn("h-10 w-[120px]", className)}
        aria-label="Select time"
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((time) => (
          <SelectItem key={time} value={time}>
            {time}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
