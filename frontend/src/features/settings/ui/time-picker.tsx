import { cn } from "@/shared/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

interface TimePickerProps {
  value?: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
}

// WHY: Step 5 phút để đảm bảo độ linh hoạt cho recovery time 10-15p
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"]
const HOURS = Array.from({ length: 24 }).map((_, i) => i.toString().padStart(2, "0"))

export function TimePicker({ value, onChange, className, disabled }: TimePickerProps) {
  // Parse value "HH:MM". Default to empty string parts if undefined to force user selection or show placeholder
  const [hour, minute] = value ? value.split(":") : ["", ""]

  const handleHourChange = (newHour: string) => {
    // If minute is not set yet, default to "00"
    onChange(`${newHour}:${minute || "00"}`)
  }

  const handleMinuteChange = (newMinute: string) => {
    // If hour is not set yet, default to "08" (start of day) or similar
    onChange(`${hour || "08"}:${newMinute}`)
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Select value={hour} onValueChange={handleHourChange} disabled={disabled}>
        <SelectTrigger className="w-[70px] focus:ring-0 focus:ring-offset-0">
          <SelectValue placeholder="Giờ" />
        </SelectTrigger>
        <SelectContent>
          {HOURS.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground">:</span>
      <Select value={minute} onValueChange={handleMinuteChange} disabled={disabled}>
        <SelectTrigger className="w-[70px] focus:ring-0 focus:ring-offset-0">
          <SelectValue placeholder="Phút" />
        </SelectTrigger>
        <SelectContent>
          {MINUTES.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
