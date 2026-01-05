"use client"

import { addDays, format, startOfWeek } from "date-fns"
import { vi } from "date-fns/locale"
import { Plus } from "lucide-react"

import { StaffProfile } from "@/features/staff/model/schemas"
import { Button } from "@/shared/ui/button"
import { ScrollArea, ScrollBar } from "@/shared/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"
import { StaffSchedule } from "../model/schemas"
import { ShiftCard } from "./shift-card"

interface ScheduleGridProps {
  currentDate: Date
  staffList: StaffProfile[]
  schedules: StaffSchedule[]
  onAddShift: (staffId: string, date: string) => void
  onEditShift: (schedule: StaffSchedule) => void
}

/**
 * WHY: Lưới hiển thị lịch làm việc tập trung.
 * Cho phép xem nhanh sự phân bổ nhân sự trong tuần.
 */
export function ScheduleGrid({
  currentDate,
  staffList,
  schedules,
  onAddShift,
  onEditShift,
}: ScheduleGridProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="rounded-md border bg-background max-w-[100vw] md:max-w-full overflow-hidden">
      {/* WHY: ScrollArea cho phép horizontal scroll mượt mà trên mọi thiết bị */}
      <ScrollArea className="w-full">
        <div className="min-w-[1000px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px] sticky left-0 bg-background z-20 border-r">
                  Nhân viên
                </TableHead>
                {days.map((day) => (
                  <TableHead key={day.toISOString()} className="w-[120px] text-center">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground uppercase">
                        {format(day, "EEEE", { locale: vi })}
                      </span>
                      <span className="text-sm font-bold">
                        {format(day, "dd/MM")}
                      </span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    Chưa có nhân viên nào
                  </TableCell>
                </TableRow>
              ) : (
                staffList.map((staff) => (
                  <TableRow key={staff.userId} className="group">
                    <TableCell className="sticky left-0 bg-background z-10 font-medium border-r">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: staff.colorCode }}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="truncate">{staff.fullName}</span>
                          <span className="text-xs text-muted-foreground font-normal truncate">
                            {staff.title}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    {days.map((day) => {
                      const dayStr = format(day, "yyyy-MM-dd")
                      const daySchedules = schedules.filter(
                        (s) => s.staff_id === staff.userId && s.work_date === dayStr
                      )

                      return (
                        <TableCell key={day.toISOString()} className="p-2 align-top h-[100px]">
                          <div className="flex flex-col gap-1 h-full">
                            {daySchedules.length === 0 ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-full w-full border border-dashed text-muted-foreground hover:text-foreground"
                                onClick={() => onAddShift(staff.userId, dayStr)}
                              >
                                <Plus className="h-4 w-4 mr-1" /> Thêm
                              </Button>
                            ) : (
                              <>
                                {daySchedules.map((sch) => (
                                  <ShiftCard
                                    key={sch.id}
                                    schedule={sch}
                                    onClick={() => onEditShift(sch)}
                                  />
                                ))}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="mt-auto h-6 w-full text-xs text-muted-foreground opacity-0 group-hover:opacity-100"
                                  onClick={() => onAddShift(staff.userId, dayStr)}
                                >
                                  <Plus className="h-3 w-3 mr-1" /> Thêm
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea >
    </div >
  )
}
