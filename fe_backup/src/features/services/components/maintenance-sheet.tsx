"use client";

import { DateTimePicker } from "@/shared/components/date-time-picker";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { Textarea } from "@/shared/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createMaintenanceAction } from "../actions";
import { maintenanceCreateSchema, type MaintenanceCreateForm } from "../schemas";
import type { Resource } from "../types";

interface MaintenanceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: Resource | null;
}

export function MaintenanceSheet({
  open,
  onOpenChange,
  resource,
}: MaintenanceSheetProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(maintenanceCreateSchema),
    defaultValues: {
      start_time: "",
      end_time: "",
      reason: "",
    },
  });

  // Reset form
  useEffect(() => {
    if (open) {
      form.reset({
        start_time: "",
        end_time: "",
        reason: "",
      });
    }
  }, [open, form]);

  const {
    handleOpenChange,
    showExitConfirm,
    setShowExitConfirm,
    handleConfirmExit,
    contentProps
  } = useFormGuard({
    isDirty: form.formState.isDirty,
    onClose: () => onOpenChange(false),
    onReset: () => form.reset(),
  });

  async function onSubmit(data: MaintenanceCreateForm) {
    if (!resource) return;

    startTransition(async () => {
      try {
        // DateTimePicker đã return ISO string, không cần convert
        await createMaintenanceAction(resource.id, data);
        toast.success("Đã lên lịch bảo trì thành công");
        onOpenChange(false);
        form.reset();
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Đã có lỗi xảy ra";
        if (msg.includes("trùng")) {
          toast.error("Xung đột lịch: " + msg, {
            description: "Vui lòng chọn khung giờ khác cho tài nguyên này.",
            duration: 5000,
          });
        } else {
          toast.error(msg);
        }
      }
    });
  }

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          className="sm:max-w-md flex flex-col"
          {...contentProps}
        >
          <SheetHeader>
            <SheetTitle>Lên lịch bảo trì</SheetTitle>
            <SheetDescription>
              Tạm ngưng hoạt động tài nguyên &quot;{resource?.name}&quot; để bảo trì.
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-4 flex-1"
            >
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Bắt đầu</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          date={field.value ? new Date(field.value) : undefined}
                          onChange={(date: Date | undefined) => field.onChange(date?.toISOString() || "")}
                          placeholder="Chọn thời gian bắt đầu"
                        />
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
                      <FormLabel required>Kết thúc</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          date={field.value ? new Date(field.value) : undefined}
                          onChange={(date: Date | undefined) => field.onChange(date?.toISOString() || "")}
                          placeholder="Chọn thời gian kết thúc"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lý do bảo trì</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="VD: Kiểm tra định kỳ, Sửa chân ghế..."
                        className="resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-6 border-t mt-auto">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleOpenChange(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isPending} className="min-w-[100px]">
                  Xác nhận
                </Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy bỏ thay đổi?</AlertDialogTitle>
            <AlertDialogDescription>
              Thông tin lịch bảo trì chưa được lưu. Bạn có chắc muốn thoát?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmExit}
              className="bg-destructive hover:bg-destructive/90"
            >
              Thoát
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
