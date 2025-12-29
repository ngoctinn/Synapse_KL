"use client"

import { format, setHours, setMinutes } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon, Clock } from "lucide-react"
import * as React from "react"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Calendar } from "@/shared/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"
import { ScrollArea } from "@/shared/ui/scroll-area"

interface DateTimePickerProps {
  date?: Date
  onChange?: (date: Date | undefined) => void
  label?: string
  placeholder?: string
  disabled?: boolean
}

/**
 * DateTimePicker - Bộ chọn ngày và giờ kết hợp dành cho đặt lịch.
 * Tối ưu chọn nhanh trên một giao diện.
 */
export function DateTimePicker({
  date,
  onChange,
  label,
  placeholder = "Chọn ngày và giờ",
  disabled,
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)
  const [isOpen, setIsOpen] = React.useState(false)

  // Tạo danh sách các khung giờ từ 08:00 đến 21:00 (mỗi 30 phút)
  const timeSlots = React.useMemo(() => {
    const slots = []
    for (let hour = 8; hour <= 21; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`)
      slots.push(`${hour.toString().padStart(2, "0")}:30`)
    }
    return slots
  }, [])

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return

    // Giữ lại giờ cũ nếu đã có
    const hours = selectedDate ? selectedDate.getHours() : 9
    const minutes = selectedDate ? selectedDate.getMinutes() : 0

    const combinedDate = setMinutes(setHours(newDate, hours), minutes)
    setSelectedDate(combinedDate)
    onChange?.(combinedDate)
  }

  const handleTimeSelect = (time: string) => {
    if (!selectedDate) {
      // Nếu chưa chọn ngày, lấy ngày hôm nay
      const today = new Date()
      const [hours, minutes] = time.split(":").map(Number)
      const combinedDate = setMinutes(setHours(today, hours), minutes)
      setSelectedDate(combinedDate)
      onChange?.(combinedDate)
    } else {
      const [hours, minutes] = time.split(":").map(Number)
      const combinedDate = setMinutes(setHours(selectedDate, hours), minutes)
      setSelectedDate(combinedDate)
      onChange?.(combinedDate)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-foreground/80">{label}</label>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal hover:bg-accent/50 group transition-all",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-primary group-hover:text-primary/80" />
            {selectedDate ? (
              format(selectedDate, "HH:mm - dd/MM/yyyy", { locale: vi })
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 flex flex-col md:flex-row shadow-xl" align="start">
          <div className="p-3 border-r border-border/50">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
              locale={vi}
            />
          </div>
          <div className="flex flex-col w-full md:w-32 bg-muted/20">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50 font-medium text-xs text-foreground/70">
              <Clock className="size-3" />
              Giờ hẹn
            </div>
            <ScrollArea className="h-[300px]">
              <div className="flex flex-col p-1">
                {timeSlots.map((time) => {
                  const isSelected = selectedDate && format(selectedDate, "HH:mm") === time
                  return (
                    <Button
                      key={time}
                      variant={isSelected ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "justify-center font-normal text-sm",
                        isSelected && "hover:bg-primary/90"
                      )}
                      onClick={() => handleTimeSelect(time)}
                    >
                      {time}
                    </Button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
