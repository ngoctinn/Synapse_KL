"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Loader2 } from "lucide-react"
import * as React from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { StaffProfile } from "@/features/staff/model/schemas"
import { Button } from "@/shared/ui/button"
import {
  Dialog,
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
import { createStaffSchedule, deleteStaffSchedule } from "../api/actions"
import { CreateStaffSchedule, ScheduleStatus, Shift, createStaffScheduleSchema } from "../model/schemas"

interface ShiftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staffList: StaffProfile[]
  shifts: Shift[]
  initialValues?: Partial<CreateStaffSchedule> & { id?: string }
  onSuccess?: () => void
}

/**
 * WHY: Dialog để thêm hoặc chỉnh sửa phân công ca làm việc.
 * Tích hợp validation và phản hồi người dùng ngay lập tức.
 */
export function ShiftDialog({
  open,
  onOpenChange,
  staffList,
  shifts,
  initialValues,
  onSuccess,
}: ShiftDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  const form = useForm<CreateStaffSchedule>({
    resolver: zodResolver(createStaffScheduleSchema),
    defaultValues: {
      staff_id: initialValues?.staff_id || "",
      shift_id: initialValues?.shift_id || "",
      work_date: initialValues?.work_date || format(new Date(), "yyyy-MM-dd"),
      status: initialValues?.status || ScheduleStatus.DRAFT,
    },
  })

  // WHY: Cập nhật form khi initialValues thay đổi (ví dụ khi click vào ô grid cụ thể)
  React.useEffect(() => {
    if (open && initialValues) {
      form.reset({
        staff_id: initialValues.staff_id || "",
        shift_id: initialValues.shift_id || "",
        work_date: initialValues.work_date || format(new Date(), "yyyy-MM-dd"),
        status: initialValues.status || ScheduleStatus.DRAFT,
      })
    }
  }, [open, initialValues, form])

  const onSubmit = async (data: CreateStaffSchedule) => {
    const res = await createStaffSchedule(data)
    if (res.success) {
      toast.success("Đã lưu lịch làm việc")
      onSuccess?.()
      onOpenChange(false)
    } else {
      toast.error(res.error || "Không thể lưu lịch làm việc")
    }
  }

  const handleDelete = async () => {
    if (!initialValues?.id) return

    setIsDeleting(true)
    const res = await deleteStaffSchedule(initialValues.id)
    setIsDeleting(false)

    if (res.success) {
      toast.success("Đã xóa lịch làm việc")
      onSuccess?.()
      onOpenChange(false)
    } else {
      toast.error(res.error || "Không thể xóa lịch làm việc")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialValues?.id ? "Chỉnh sửa lịch" : "Thêm lịch làm việc"}
          </DialogTitle>
          <DialogDescription>
            Phân công ca làm việc cho nhân viên vào ngày {initialValues?.work_date && format(new Date(initialValues.work_date), "dd/MM/yyyy", { locale: vi })}
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
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!!initialValues?.id}
                  >
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

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ScheduleStatus).map((value) => (
                        <SelectItem key={value} value={value}>
                          {value === ScheduleStatus.DRAFT ? "Bản nháp" : value === ScheduleStatus.PUBLISHED ? "Đã công bố" : "Đã hủy"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              {initialValues?.id && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting || form.formState.isSubmitting}
                >
                  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Xóa
                </Button>
              )}
              <div className="flex-1" />
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
