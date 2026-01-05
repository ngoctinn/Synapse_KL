"use client"

import { addDays, format, startOfWeek } from "date-fns"
import { vi } from "date-fns/locale"
import { Plus, Trash2 } from "lucide-react"; // Import Trash2
import { useTransition } from "react"
import { toast } from "sonner"

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
import { batchDeleteStaffSchedules, deleteStaffSchedule } from "../api/actions"; // Import actions
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
  const [isPending, startTransition] = useTransition()

  // Handler xóa 1 ca
  const handleDeleteShift = (id: string) => {
    startTransition(async () => {
      const res = await deleteStaffSchedule(id)
      if (!res.success) {
        toast.error("Không thể xóa lịch làm việc")
      } else {
        toast.success("Đã xóa lịch làm việc")
      }
    })
  }

  // Handler xóa toàn bộ tuần của nhân viên
  const handleClearWeek = (staffId: string) => {
    // Tìm tất cả lịch của staff này trong tuần hiện tại (đang hiển thị)
    const weekSchedules = schedules.filter(s => s.staff_id === staffId);
    if (weekSchedules.length === 0) return;

    const scheduleIds = weekSchedules.map(s => s.id);

    if (!confirm(`Bạn có chắc muốn xóa toàn bộ ${weekSchedules.length} ca làm việc này?`)) return;

    startTransition(async () => {
      const res = await batchDeleteStaffSchedules(scheduleIds)
      if (!res.success) {
        toast.error("Lỗi khi xóa lịch hàng loạt")
      } else {
        toast.success(`Đã xóa ${weekSchedules.length} ca làm việc`)
      }
    })
  }

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
                    <TableCell className="sticky left-0 bg-background z-10 font-medium border-r group/cell">
                      <div className="flex items-center justify-between gap-2">
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

                        {/* Nút xóa tuần - Chỉ hiện khi hover vào ô tên nhân viên */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover/cell:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                          title="Xóa lịch tuần này"
                          onClick={() => handleClearWeek(staff.userId)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
                                    onDelete={() => handleDeleteShift(sch.id)}
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
