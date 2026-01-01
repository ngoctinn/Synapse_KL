"use client";

import { batchCreateSchedulesAction } from "@/features/staff/actions";
import { staffScheduleSchema } from "@/features/staff/schemas";
import type { Shift, StaffProfile } from "@/features/staff/types";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

interface ScheduleFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffProfile;
  workDate: Date;
  shifts: Shift[];
  onSuccess?: () => void;
}

export function ScheduleFormSheet({
  open,
  onOpenChange,
  staff,
  workDate,
  shifts,
  onSuccess
}: ScheduleFormSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof staffScheduleSchema>>({
    resolver: zodResolver(staffScheduleSchema),
    defaultValues: {
      staff_id: staff.user_id,
      shift_id: "",
      work_date: format(workDate, "yyyy-MM-dd"),
      status: "DRAFT",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        staff_id: staff.user_id,
        shift_id: "",
        work_date: format(workDate, "yyyy-MM-dd"),
        status: "DRAFT",
      });
    }
  }, [open, staff, workDate, form]);

  async function onSubmit(values: z.infer<typeof staffScheduleSchema>) {
    try {
      setIsSubmitting(true);

      const result = await batchCreateSchedulesAction({
        staff_id: values.staff_id,
        shift_id: values.shift_id,
        work_dates: [values.work_date],
        status: values.status,
      });

      if (result.success) {
        toast.success("Đã phân ca thành công");
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
        <div className="bg-primary/5 p-8 border-b border-primary/10">
          <SheetHeader className="text-left space-y-1">
            <SheetTitle className="text-2xl font-bold tracking-tight text-primary">
              Phân ca làm việc
            </SheetTitle>
            <SheetDescription className="text-muted-foreground font-medium">
              Chỉnh sửa lịch cho {staff.full_name} ngày {format(workDate, "dd MMMM", { locale: vi })}.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormItem>
                <FormLabel className="text-foreground/80 font-semibold tracking-tight">Ca làm việc</FormLabel>
                <FormField
                  control={form.control}
                  name="shift_id"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl border-muted-foreground/20">
                          <SelectValue placeholder="Chọn ca..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        {shifts.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color_code || "#ccc" }} />
                              {s.name} ({s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)})
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormLabel className="text-foreground/80 font-semibold tracking-tight">Trạng thái</FormLabel>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Trạng thái..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="DRAFT">Bản nháp (Kín)</SelectItem>
                        <SelectItem value="PUBLISHED">Công khai</SelectItem>
                        <SelectItem value="CANCELLED">Hủy bỏ</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormMessage />
              </FormItem>

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
                  Lưu lịch biểu
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
