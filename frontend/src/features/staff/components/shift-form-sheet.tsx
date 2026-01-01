"use client";

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
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { createShiftAction } from "../actions";
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
  }, [shift, form, open]);

  async function onSubmit(values: z.infer<typeof shiftSchema>) {
    try {
      setIsSubmitting(true);

      let result;
      if (isEdit) {
        // Implement updateShiftAction if needed, currently only createShiftAction exists in azioni
        result = { success: false, message: "Tính năng cập nhật chưa khả dụng" };
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full flex flex-col p-0 gap-0">
        <div className="p-6 pb-2 shrink-0 border-b">
          <SheetHeader>
            <SheetTitle>
              {isEdit ? "Sửa ca làm việc" : "Thêm ca làm việc"}
            </SheetTitle>
            <SheetDescription>
              Định nghĩa khung giờ làm việc tiêu chuẩn.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80 font-semibold tracking-tight">Tên ca</FormLabel>
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
                      <FormLabel className="text-foreground/80 font-semibold tracking-tight">Giờ bắt đầu</FormLabel>
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
                      <FormLabel className="text-foreground/80 font-semibold tracking-tight">Giờ kết thúc</FormLabel>
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
                    <FormLabel className="text-foreground/80 font-semibold tracking-tight">Màu sắc hiển thị</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input type="color" {...field} value={field.value || "#10B981"} className="w-16 p-1 cursor-pointer" />
                        <Input {...field} value={field.value || "#10B981"} placeholder="#10B981" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-6 flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 shadow-lg shadow-primary/20"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isEdit ? "Lưu thay đổi" : "Tạo ca làm"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
