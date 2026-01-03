"use client";

import { useFormGuard } from "@/shared/hooks/use-form-guard";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/shared/ui/sheet";
import { zodResolver } from "@hookform/resolvers/zod";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { createShiftAction, updateShiftAction } from "../actions";
import { shiftSchema } from "../schemas";
import type { Shift } from "../types";

interface ShiftFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift?: Shift;
  onSuccess?: () => void;
}

export function ShiftFormSheet({ open, onOpenChange, shift, onSuccess }: ShiftFormSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!shift;

  const form = useForm<z.infer<typeof shiftSchema>>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      name: shift?.name || "",
      start_time: shift?.start_time?.slice(0, 5) || "08:00",
      end_time: shift?.end_time?.slice(0, 5) || "12:00",
      color_code: shift?.color_code || "#10B981",
    },
  });

  useEffect(() => {
    if (open) {
      if (shift) {
        form.reset({
          name: shift.name,
          start_time: shift.start_time.slice(0, 5),
          end_time: shift.end_time.slice(0, 5),
          color_code: shift.color_code || "#10B981",
        });
      } else {
        form.reset({
          name: "",
          start_time: "08:00",
          end_time: "12:00",
          color_code: "#10B981",
        });
      }
    }
  }, [shift, form, open]);

  const {
    handleOpenChange,
    showExitConfirm,
    setShowExitConfirm,
    handleConfirmExit,
    contentProps,
  } = useFormGuard({
    isDirty: form.formState.isDirty,
    onClose: () => onOpenChange(false),
    onReset: () => form.reset(),
  });

  async function onSubmit(values: z.infer<typeof shiftSchema>) {
    try {
      setIsSubmitting(true);

      let result;
      if (isEdit && shift) {
        result = await updateShiftAction(shift.id, values);
      } else {
        result = await createShiftAction(values);
      }

      if (result.success) {
        toast.success(result.message);
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Đã có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className="sm:max-w-md w-full overflow-y-auto" {...contentProps}>
          <SheetHeader>
            <SheetTitle>
              {isEdit ? "Sửa ca làm việc" : "Thêm ca làm việc"}
            </SheetTitle>
            <SheetDescription>
              Định nghĩa khung giờ làm việc tiêu chuẩn.
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                      <FormLabel>Màu sắc hiển thị</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input type="color" {...field} value={field.value || "#10B981"} className="w-16 h-9 p-1 cursor-pointer" />
                          <Input {...field} value={field.value || "#10B981"} placeholder="#10B981" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleOpenChange(false)}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" loading={isSubmitting}>
                    {isEdit ? "Cập nhật" : "Tạo mới"}
                  </Button>
                </div>
              </form>
            </Form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Thay đổi chưa được lưu</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn đang nhập dở thông tin ca làm việc. Thoát bây giờ sẽ làm mất các dữ liệu này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục chỉnh sửa</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmExit}
              className="bg-destructive hover:bg-destructive/90"
            >
              Thoát và bỏ qua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

