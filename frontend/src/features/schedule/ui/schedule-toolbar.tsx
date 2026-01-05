"use client"

import { Download, Filter, Plus, Send } from "lucide-react"

import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/shared/ui/dropdown-menu"
import { Shift } from "../model/schemas"
import { DateNavigation } from "./date-navigation"
import { ShiftListSheet } from "./shift-list-sheet"

interface ScheduleToolbarProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  onAddShift: () => void
  onPublishAll?: () => void
  onExport?: () => void
  onBatchCreate?: () => void
  shifts: Shift[]
  onRefreshShifts: () => void
}

/**
 * WHY: Thanh công cụ chính cho module Lịch làm việc.
 * Thiết kế 2 hàng: Hàng 1 = Tiêu đề + DateNavigation, Hàng 2 = Actions
 */
export function ScheduleToolbar({
  currentDate,
  onDateChange,
  onAddShift,
  onPublishAll,
  onExport,
  onBatchCreate,
  shifts,
  onRefreshShifts,
}: ScheduleToolbarProps) {
  return (
    <div className="flex flex-col gap-4 mb-4">
      {/* Hàng 1: Tiêu đề + Date Navigation */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Lịch làm việc</h1>
        <DateNavigation currentDate={currentDate} onDateChange={onDateChange} />
      </div>

      {/* Hàng 2: Actions Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-t pt-4">
        <ShiftListSheet shifts={shifts} onRefresh={onRefreshShifts} />

        <div className="flex-1" />

        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" /> Bộ lọc
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Chỉ hiện Bản nháp</DropdownMenuItem>
            <DropdownMenuItem>Chỉ hiện Đã công bố</DropdownMenuItem>
            <DropdownMenuItem>Lọc theo Vai trò</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" onClick={onBatchCreate}>
          <Plus className="mr-2 h-4 w-4" /> Tạo hàng loạt
        </Button>

        <Button variant="secondary" size="sm" onClick={onPublishAll}>
          <Send className="mr-2 h-4 w-4" /> Công bố lịch
        </Button>

        <Button size="sm" onClick={onAddShift}>
          <Plus className="mr-2 h-4 w-4" /> Thêm lịch
        </Button>
      </div>
    </div>
  )
}
