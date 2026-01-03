"use client";

import {
  bulkCreateSchedulesAction,
  deleteSchedulesBatchAction,
} from "@/features/staff/actions";
import { type GridCellCoords } from "@/features/staff/hooks/use-drag-select";
import type { Shift, StaffProfile } from "@/features/staff/types";
import { Badge } from "@/shared/ui/badge";
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
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const UNDO_TIMEOUT_MS = 8000;

const formSchema = z.object({
  shift_id: z.string().uuid({ message: "Vui lòng chọn ca làm việc" }),
});

type FormValues = z.infer<typeof formSchema>;

interface ScheduleFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCells: GridCellCoords[];
  staffList: StaffProfile[];
  shifts: Shift[];
  onSuccess: () => void;
}

export function ScheduleFormSheet({
  open,
  onOpenChange,
  selectedCells,
  staffList,
  shifts,
  onSuccess,
}: ScheduleFormSheetProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  // Undo state
  const lastCreatedIdsRef = useRef<string[]>([]);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shift_id: "",
    },
  });

  // State for active logic
  const [activeStaffIds, setActiveStaffIds] = useState<string[]>([]);

  // Initialize active staff from selection when opening
  useEffect(() => {
    if (open && selectedCells.length > 0) {
      const ids = Array.from(new Set(selectedCells.map((c) => c.staffId)));
      setActiveStaffIds(ids);
    }
  }, [open, selectedCells]);

  const uniqueDates = Array.from(
    new Set(selectedCells.map((c) => c.dateStr))
  ).sort();

  // Helper validation
  const isValidSelection = activeStaffIds.length > 0;

  // UI Helpers
  const dateRangeDisplay =
    uniqueDates.length === 1
      ? format(new Date(uniqueDates[0]), "dd/MM/yyyy")
      : `${format(new Date(uniqueDates[0]), "dd/MM")} - ${format(
          new Date(uniqueDates[uniqueDates.length - 1]),
          "dd/MM"
        )}`;

  const handleRemoveStaff = (id: string) => {
    setActiveStaffIds((prev) => prev.filter((i) => i !== id));
    if (activeStaffIds.length <= 1) {
      toast.warning("Cần ít nhất 1 nhân viên để phân ca");
    }
  };

  async function onSubmit(values: FormValues) {
    if (!isValidSelection) return;
    setIsPending(true);

    try {
      // Collect payloads for bulk processing
      const payloads = activeStaffIds.map((staffId) => {
        const dates = selectedCells
          .filter((c) => c.staffId === staffId)
          .map((c) => c.dateStr);

        return {
          staff_id: staffId,
          shift_id: values.shift_id,
          work_dates: dates,
          status: "DRAFT" as const,
        };
      });

      // Single server action call
      const result = await bulkCreateSchedulesAction(payloads);

      if (result.success) {
        // Store created IDs for potential undo
        lastCreatedIdsRef.current = result.createdIds || [];

        // Clear any existing timeout
        if (undoTimeoutRef.current) {
          clearTimeout(undoTimeoutRef.current);
        }

        onOpenChange(false);
        form.reset();
        onSuccess();

        // Show success toast with undo action
        if (lastCreatedIdsRef.current.length > 0) {
          toast.success(
            result.message ||
              `Đã phân ca thành công cho ${selectedCells.length} ô`,
            {
              duration: UNDO_TIMEOUT_MS,
              action: {
                label: "Hoàn tác",
                onClick: async () => {
                  const idsToDelete = lastCreatedIdsRef.current;
                  if (idsToDelete.length === 0) {
                    toast.error("Không có gì để hoàn tác");
                    return;
                  }
                  const deleteResult = await deleteSchedulesBatchAction(
                    idsToDelete
                  );
                  if (deleteResult.success) {
                    toast.success("Đã hoàn tác phân ca");
                    router.refresh();
                  } else {
                    toast.error(deleteResult.message);
                  }
                  lastCreatedIdsRef.current = [];
                },
              },
            }
          );

          // Auto-clear undo state after timeout
          undoTimeoutRef.current = setTimeout(() => {
            lastCreatedIdsRef.current = [];
          }, UNDO_TIMEOUT_MS);
        } else {
          toast.success(result.message || `Đã phân ca thành công`);
        }
      } else {
        toast.error(result.message || "Có lỗi xảy ra khi phân ca");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống", { description: String(error) });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Phân ca làm việc</SheetTitle>
          <SheetDescription>
            Phân ca cho {activeStaffIds.length} nhân viên trong{" "}
            {uniqueDates.length} ngày.
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-2 mb-4">
            <div className="flex flex-col gap-2">
              <span className="text-muted-foreground">
                Nhân viên ({activeStaffIds.length}):
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto content-start p-1">
                {activeStaffIds.map((id) => {
                  const staff = staffList.find((s) => s.user_id === id);
                  return (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1 pl-2"
                    >
                      {staff?.full_name}
                      <button
                        type="button"
                        onClick={() => handleRemoveStaff(id)}
                        className="hover:bg-muted rounded-full p-0.5 ml-1"
                      >
                        <X className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </Badge>
                  );
                })}
                {activeStaffIds.length === 0 && (
                  <span className="text-sm text-destructive italic">
                    Chưa chọn nhân viên nào
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Thời gian:</span>
              <span className="font-medium">{dateRangeDisplay}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="text-muted-foreground">Tổng số ca:</span>
              <span className="font-bold text-primary">
                {selectedCells.length}
              </span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormItem>
                <FormLabel>Ca làm việc</FormLabel>
                <FormField
                  control={form.control}
                  name="shift_id"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn ca..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {shifts.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            <div className="flex items-center gap-2">
                              {/* Fix: use nullish coalescing to avoid lint errors with potentially null color_code */}
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: s.color_code ?? "#ccc",
                                }}
                              />
                              {s.name} ({s.start_time.slice(0, 5)} -{" "}
                              {s.end_time.slice(0, 5)})
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormMessage />
              </FormItem>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" loading={isPending}>
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
