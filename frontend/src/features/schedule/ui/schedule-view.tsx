"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { endOfWeek, format, startOfWeek } from "date-fns"
import * as React from "react"

import { getStaffList } from "@/features/staff/api/actions"
import { Skeleton } from "@/shared/ui/skeleton"
import { getShifts, getStaffSchedules } from "../api/actions"
import { CreateStaffSchedule, StaffSchedule } from "../model/schemas"
import { BatchCreateDialog } from "./batch-create-dialog"
import { ScheduleGrid } from "./schedule-grid"
import { ScheduleToolbar } from "./schedule-toolbar"
import { ShiftDialog } from "./shift-dialog"

/**
 * WHY: Component chính điều phối toàn bộ module Lịch làm việc.
 * Quản lý trạng thái chia sẻ giữa toolbar, grid và dialog.
 */
export function ScheduleView() {
  const queryClient = useQueryClient()
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isBatchDialogOpen, setIsBatchDialogOpen] = React.useState(false)
  const [editingSchedule, setEditingSchedule] = React.useState<(Partial<CreateStaffSchedule> & { id?: string }) | undefined>()

  const weekStart = format(startOfWeek(currentDate, { weekStartsOn: 1 }), "yyyy-MM-dd")
  const weekEnd = format(endOfWeek(currentDate, { weekStartsOn: 1 }), "yyyy-MM-dd")

  // WHY: Lấy danh sách nhân viên để hiển thị các hàng trong Grid
  const staffQuery = useQuery({
    queryKey: ["staff", "list"],
    queryFn: () => getStaffList(),
  })

  // WHY: Lấy danh sách các loại ca để chọn trong Dialog
  const shiftsQuery = useQuery({
    queryKey: ["shifts"],
    queryFn: async () => {
      const res = await getShifts()
      if (res.success) return res.data
      throw new Error(res.error)
    },
  })

  // WHY: Lấy dữ liệu phân công lịch trong tuần hiện tại
  const schedulesQuery = useQuery({
    queryKey: ["schedules", weekStart, weekEnd],
    queryFn: async () => {
      const res = await getStaffSchedules(weekStart, weekEnd)
      if (res.success) return res.data
      throw new Error(res.error)
    },
  })

  const handleAddShift = (staffId?: string, date?: string) => {
    setEditingSchedule({
      staff_id: staffId,
      work_date: date,
    })
    setIsDialogOpen(true)
  }

  const handleEditShift = (schedule: StaffSchedule) => {
    setEditingSchedule({
      id: schedule.id,
      staff_id: schedule.staff_id,
      shift_id: schedule.shift_id,
      work_date: schedule.work_date,
      status: schedule.status,
    })
    setIsDialogOpen(true)
  }

  // WHY: Làm giàu dữ liệu schedule bằng thông tin ca làm việc nếu backend không trả về sẵn nested object.
  // Điều này đảm bảo ShiftCard luôn có đủ dữ liệu để hiển thị.
  const enrichedSchedules = React.useMemo(() => {
    const schedules = schedulesQuery.data || []
    const shifts = shiftsQuery.data || []

    return schedules.map((schedule) => {
      if (schedule.shift) return schedule
      const shift = shifts.find((s) => s.id === schedule.shift_id)
      return { ...schedule, shift }
    })
  }, [schedulesQuery.data, shiftsQuery.data])

  const isLoading = staffQuery.isLoading || shiftsQuery.isLoading || schedulesQuery.isLoading

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["schedules"] })
  }

  return (
    <div className="flex flex-col gap-4">
      <ScheduleToolbar
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onAddShift={() => handleAddShift()}
        onPublishAll={() => console.log("Publish all")}
        onExport={() => console.log("Export")}
        onBatchCreate={() => setIsBatchDialogOpen(true)}
        shifts={shiftsQuery.data || []}
        onRefreshShifts={() => shiftsQuery.refetch()}
      />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : (
        <ScheduleGrid
          currentDate={currentDate}
          staffList={staffQuery.data || []}
          schedules={enrichedSchedules}
          onAddShift={handleAddShift}
          onEditShift={handleEditShift}
        />
      )}

      <ShiftDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        staffList={staffQuery.data || []}
        shifts={shiftsQuery.data || []}
        initialValues={editingSchedule}
        onSuccess={onSuccess}
      />

      <BatchCreateDialog
        open={isBatchDialogOpen}
        onOpenChange={setIsBatchDialogOpen}
        staffList={staffQuery.data || []}
        shifts={shiftsQuery.data || []}
        currentDate={currentDate}
        onSuccess={onSuccess}
      />
    </div>
  )
}
