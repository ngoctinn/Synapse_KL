"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { maintenanceCreateSchema, type MaintenanceCreateForm } from "../schemas";
import { createMaintenanceAction } from "../actions";
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

  async function onSubmit(data: MaintenanceCreateForm) {
    if (!resource) return;

    startTransition(async () => {
      try {
        await createMaintenanceAction(resource.id, data);
        toast.success("Đã lên lịch bảo trì thành công");
        onOpenChange(false);
        form.reset();
      } catch (error) {
        // Backend trả về 409 Conflict sẽ hiện message ở đây
        toast.error(error instanceof Error ? error.message : "Xung đột lịch hoặc lỗi hệ thống");
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Lên lịch bảo trì</SheetTitle>
          <SheetDescription>
            Tạm ngưng hoạt động tài nguyên "{resource?.name}" để bảo trì.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bắt đầu</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
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
                    <FormLabel>Kết thúc</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
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
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                Xác nhận
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
