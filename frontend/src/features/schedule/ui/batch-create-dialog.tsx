"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { eachDayOfInterval, endOfWeek, format, isWeekend, startOfWeek } from "date-fns"
import { vi } from "date-fns/locale"
import { Loader2 } from "lucide-react"
import * as React from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { StaffProfile } from "@/features/staff/model/schemas"
import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { z } from "zod"
import { batchCreateStaffSchedules } from "../api/actions"
import { BatchCreateSchedule, ScheduleStatus, Shift } from "../model/schemas"

interface BatchCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staffList: StaffProfile[]
  shifts: Shift[]
  currentDate: Date
  onSuccess?: () => void
}

/**
 * WHY: Dialog tạo lịch làm việc hàng loạt.
 * Cho phép chọn nhiều ngày trong tuần cùng lúc.
 */
export function BatchCreateDialog({
  open,
  onOpenChange,
  staffList,
  shifts,
  currentDate,
  onSuccess,
}: BatchCreateDialogProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const [selectedDays, setSelectedDays] = React.useState<string[]>([])

  const formSchema = z.object({
    staff_id: z.string().uuid("Cần chọn nhân viên"),
    shift_id: z.string().uuid("Cần chọn ca làm việc"),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      staff_id: "",
      shift_id: "",
    },
  })

  const toggleDay = (dateStr: string) => {
    setSelectedDays((prev) =>
      prev.includes(dateStr)
        ? prev.filter((d) => d !== dateStr)
        : [...prev, dateStr]
    )
  }

  const selectWeekdays = () => {
    const weekdays = weekDays.filter((d) => !isWeekend(d)).map((d) => format(d, "yyyy-MM-dd"))
    setSelectedDays(weekdays)
  }

  const selectAll = () => {
    setSelectedDays(weekDays.map((d) => format(d, "yyyy-MM-dd")))
  }

  const clearAll = () => setSelectedDays([])

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (selectedDays.length === 0) {
      toast.error("Vui lòng chọn ít nhất một ngày")
      return
    }

    const payload: BatchCreateSchedule = {
      staff_id: data.staff_id,
      shift_id: data.shift_id,
      work_dates: selectedDays,
      status: ScheduleStatus.DRAFT,
    }

    const res = await batchCreateStaffSchedules(payload)
    if (res.success) {
      toast.success(`Đã tạo ${selectedDays.length} lịch làm việc`)
      onSuccess?.()
      onOpenChange(false)
      setSelectedDays([])
      form.reset()
    } else {
      toast.error(res.error || "Không thể tạo lịch hàng loạt")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tạo lịch hàng loạt</DialogTitle>
          <DialogDescription>
            Tạo lịch làm việc cho nhiều ngày trong tuần {format(weekStart, "dd/MM", { locale: vi })} - {format(weekEnd, "dd/MM/yyyy", { locale: vi })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="staff_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhân viên</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn nhân viên" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {staffList.map((staff) => (
                        <SelectItem key={staff.userId} value={staff.userId}>
                          {staff.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shift_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ca làm việc</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn ca" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {shifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          {shift.name} ({shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Day selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Chọn ngày</FormLabel>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={selectWeekdays}>
                    Ngày thường
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={selectAll}>
                    Tất cả
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
                    Xóa
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd")
                  const isSelected = selectedDays.includes(dateStr)
                  const isWe = isWeekend(day)

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => toggleDay(dateStr)}
                      className={`flex flex-col items-center p-2 rounded-md border transition-colors ${isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : isWe
                          ? "bg-muted/50 border-muted"
                          : "hover:bg-accent border-border"
                        }`}
                    >
                      <span className="text-xs font-medium">
                        {format(day, "EEE", { locale: vi })}
                      </span>
                      <span className="text-sm font-bold">
                        {format(day, "dd")}
                      </span>
                    </button>
                  )
                })}
              </div>

              {selectedDays.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Đã chọn {selectedDays.length} ngày
                </p>
              )}
            </div>

            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Hủy
                </Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tạo lịch
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
