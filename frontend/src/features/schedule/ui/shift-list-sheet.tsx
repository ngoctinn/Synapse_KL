"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Pencil, Trash2 } from "lucide-react"
import * as React from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog"
import { Button } from "@/shared/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"
import { createShift, deleteShift, updateShift } from "../api/actions"
import { Shift } from "../model/schemas"

const shiftFormSchema = z.object({
  name: z.string().min(1, "Tên ca không được để trống"),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, "Định dạng giờ không hợp lệ (HH:mm)"),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, "Định dạng giờ không hợp lệ (HH:mm)"),
  color_code: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Mã màu không hợp lệ"),
})

type ShiftFormValues = z.infer<typeof shiftFormSchema>

interface ShiftListSheetProps {
  shifts: Shift[]
  onRefresh: () => void
}

/**
 * WHY: Sheet quản lý định nghĩa các loại ca làm việc (CRUD).
 * Cho phép Manager tạo, sửa, xóa các ca như Sáng/Chiều/Tối.
 */
export function ShiftListSheet({ shifts, onRefresh }: ShiftListSheetProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [editingShift, setEditingShift] = React.useState<Shift | null>(null)
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null)

  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: {
      name: "",
      start_time: "08:00",
      end_time: "12:00",
      color_code: "#3b82f6",
    },
  })

  const handleEdit = (shift: Shift) => {
    setEditingShift(shift)
    form.reset({
      name: shift.name,
      start_time: shift.start_time.slice(0, 5),
      end_time: shift.end_time.slice(0, 5),
      color_code: shift.color_code || "#3b82f6",
    })
  }

  const handleCreate = () => {
    setEditingShift(null)
    form.reset({
      name: "",
      start_time: "08:00",
      end_time: "12:00",
      color_code: "#3b82f6",
    })
  }

  const onSubmit = async (data: ShiftFormValues) => {
    const payload = {
      ...data,
      start_time: `${data.start_time}:00`,
      end_time: `${data.end_time}:00`,
    }

    if (editingShift) {
      const res = await updateShift(editingShift.id, payload)
      if (res.success) {
        toast.success("Đã cập nhật ca làm việc")
        onRefresh()
        setEditingShift(null)
        form.reset()
      } else {
        toast.error(res.error || "Không thể cập nhật")
      }
    } else {
      const res = await createShift(payload)
      if (res.success) {
        toast.success("Đã tạo ca làm việc mới")
        onRefresh()
        form.reset()
      } else {
        toast.error(res.error || "Không thể tạo ca")
      }
    }
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    const res = await deleteShift(id)
    setIsDeleting(null)

    if (res.success) {
      toast.success("Đã xóa ca làm việc")
      onRefresh()
    } else {
      toast.error(res.error || "Không thể xóa")
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          Quản lý ca
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Quản lý ca làm việc</SheetTitle>
          <SheetDescription>
            Tạo và chỉnh sửa các loại ca làm việc (Ca Sáng, Ca Chiều, Ca Tối...)
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 py-4">
          {/* Form tạo/sửa ca */}
          <div className="rounded-lg border p-4">
            <h4 className="mb-4 text-sm font-medium">
              {editingShift ? "Chỉnh sửa ca" : "Thêm ca mới"}
            </h4>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên ca</FormLabel>
                      <FormControl>
                        <Input placeholder="Ca Sáng" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giờ bắt đầu</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="end_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giờ kết thúc</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="color_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Màu sắc</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input type="color" className="h-10 w-14 p-1" {...field} />
                          <Input placeholder="#3b82f6" {...field} className="flex-1" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingShift ? "Cập nhật" : "Thêm ca"}
                  </Button>
                  {editingShift && (
                    <Button type="button" variant="outline" onClick={handleCreate}>
                      Hủy
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>

          {/* Danh sách ca hiện có */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên ca</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead className="w-[100px]">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shifts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Chưa có ca làm việc nào
                    </TableCell>
                  </TableRow>
                ) : (
                  shifts.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: shift.color_code || "#3b82f6" }}
                          />
                          {shift.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(shift)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bạn có chắc muốn xóa ca "{shift.name}"? Hành động này không thể hoàn tác.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(shift.id)}
                                  disabled={isDeleting === shift.id}
                                >
                                  {isDeleting === shift.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  Xóa
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Đóng</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
