"use client"

import { addDays, endOfWeek, format, startOfWeek, subDays } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Calendar } from "@/shared/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover"

interface DateNavigationProps {
  currentDate: Date
  onDateChange: (date: Date) => void
}

/**
 * WHY: Component điều hướng thời gian (Tuần trước/sau, Picker).
 * Đảm bảo trải nghiệm mượt mà khi quan sát lịch làm việc.
 */
export function DateNavigation({ currentDate, onDateChange }: DateNavigationProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })

  const handlePrevWeek = () => onDateChange(subDays(currentDate, 7))
  const handleNextWeek = () => onDateChange(addDays(currentDate, 7))
  const handleToday = () => onDateChange(new Date())

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" onClick={handlePrevWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={handleToday}>
          Hôm nay
        </Button>
        <Button variant="outline" size="icon" onClick={handleNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !currentDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>
              {format(weekStart, "dd/MM", { locale: vi })} - {" "}
              {format(weekEnd, "dd/MM/yyyy", { locale: vi })}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={(date) => date && onDateChange(date)}
            initialFocus
            locale={vi}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
