"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { AlertCircle, Calendar, Plus, Trash2 } from "lucide-react";
import * as React from "react";

import { DatePickerWithRange } from "@/shared/components/date-range-picker";
import { TimePickerDropdown } from "@/shared/components/time-picker-dropdown";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
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
} from "@/shared/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { eachDayOfInterval, getDay, isSameDay } from "date-fns";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ExceptionDate, OperatingHour } from "../types";

const exceptionDateSchema = z
  .object({
    dateRange: z.object({
      from: z.date(),
      to: z.date().optional(),
    }),
    reason: z.string().min(1, "Vui lòng nhập lý do"),
    is_closed: z.boolean(),
    open_time: z.string().optional(),
    close_time: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.is_closed) return true;
      return !!(data.open_time && data.close_time);
    },
    {
      message: "Vui lòng chọn đầy đủ giờ mở và đóng cửa",
      path: ["close_time"],
    }
  );

type ExceptionDateFormValues = z.infer<typeof exceptionDateSchema>;

interface ExceptionDatesManagerProps {
  initialData?: ExceptionDate[];
  regularHours?: OperatingHour[];
  onChange: (data: ExceptionDate[]) => void;
}

export function ExceptionDatesManager({
  initialData = [],
  regularHours = [],
  onChange,
}: ExceptionDatesManagerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [exceptions, setExceptions] =
    React.useState<ExceptionDate[]>(initialData);

  // Đồng bộ lại local state khi dữ liệu từ cha thay đổi
  React.useEffect(() => {
    // Đảm bảo data luôn có id (fallback sang date hoặc random nếu thiếu)
    const sanitizedData = initialData.map((item) => ({
      ...item,
      id: item.id || item.date || crypto.randomUUID(),
    }));
    setExceptions(sanitizedData);
  }, [initialData]);

  const form = useForm<ExceptionDateFormValues>({
    resolver: zodResolver(exceptionDateSchema),
    defaultValues: {
      dateRange: {
        from: new Date(),
        to: undefined,
      },
      reason: "",
      is_closed: true,
      open_time: "08:00",
      close_time: "20:00",
    },
  });

  const onSubmit = (values: ExceptionDateFormValues) => {
    const dates = values.dateRange.to
      ? eachDayOfInterval({
          start: values.dateRange.from,
          end: values.dateRange.to,
        })
      : [values.dateRange.from];

    const newExceptions: ExceptionDate[] = dates.map((date) => ({
      id: crypto.randomUUID(),
      // Chỉ lấy phần ngày YYYY-MM-DD để khớp với kiểu date của Python
      date: format(date, "yyyy-MM-dd"),
      reason: values.reason,
      is_closed: values.is_closed,
      // Đảm bảo gửi null nếu không có giá trị
      open_time:
        !values.is_closed && values.open_time ? values.open_time : undefined,
      close_time:
        !values.is_closed && values.close_time ? values.close_time : undefined,
    }));

    // Tránh trùng lặp ngày nếu người dùng thêm lại ngày đã có
    const filteredOld = exceptions.filter(
      (old) =>
        !newExceptions.some((newExp) =>
          isSameDay(new Date(old.date), new Date(newExp.date))
        )
    );

    const updated = [...filteredOld, ...newExceptions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    setExceptions(updated);
    onChange(updated);
    setIsOpen(false);
    form.reset();
  };

  const removeException = (id: string) => {
    const updated = exceptions.filter((e) => e.id !== id);
    setExceptions(updated);
    onChange(updated);
  };

  // Summary cho ngày ngoại lệ
  const summary = React.useMemo(() => {
    const closedDays = exceptions.filter((e) => e.is_closed).length;
    const adjustedDays = exceptions.filter((e) => !e.is_closed).length;
    return { closedDays, adjustedDays, total: exceptions.length };
  }, [exceptions]);

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {summary.total > 0 ? (
            <>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span className="font-medium text-foreground">{summary.total}</span> ngày ngoại lệ
              </span>
              {summary.closedDays > 0 && (
                <span>• {summary.closedDays} ngày nghỉ</span>
              )}
              {summary.adjustedDays > 0 && (
                <span>• {summary.adjustedDays} ngày điều chỉnh giờ</span>
              )}
            </>
          ) : (
            <span className="text-muted-foreground">Chưa có ngày ngoại lệ</span>
          )}
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="secondary" className="h-8 text-xs">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Thêm ngày
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Thêm ngày ngoại lệ</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 pt-4"
              >
                <FormField
                  control={form.control}
                  name="dateRange"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Ngày hoặc Khoảng ngày</FormLabel>
                      <FormControl>
                        <DatePickerWithRange
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lý do</FormLabel>
                      <FormControl>
                        <Input placeholder="Ví dụ: Nghỉ lễ Tết" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_closed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Đóng cửa cả ngày</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {!form.watch("is_closed") && (
                  <div className="flex items-center gap-4">
                    <FormField
                      control={form.control}
                      name="open_time"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Mở cửa</FormLabel>
                          <FormControl>
                            <TimePickerDropdown
                              value={field.value}
                              onChange={field.onChange}
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="close_time"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Đóng cửa</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <TimePickerDropdown
                                value={field.value}
                                onChange={field.onChange}
                                className="w-full"
                              />
                            </FormControl>
                            {form.watch("open_time") &&
                              field.value &&
                              form.watch("open_time")! > field.value && (
                                <div className="absolute top-full right-0 mt-1">
                                  <Badge
                                    variant="warning"
                                    className="h-6 px-2 text-[9px] gap-1 whitespace-nowrap"
                                  >
                                    <AlertCircle className="size-3" />
                                    <span>Sáng hôm sau (+1)</span>
                                  </Badge>
                                </div>
                              )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <DialogFooter>
                  <Button type="submit">Xác nhận</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        {exceptions.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Chưa có ngày ngoại lệ nào được thiết lập.
          </div>
        ) : (
          <div className="divide-y">
            {exceptions.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      <span className="capitalize">
                        {format(new Date(item.date), "EEEE", { locale: vi })}
                      </span>
                      , {format(new Date(item.date), "dd/MM/yyyy")}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1",
                        item.is_closed
                          ? "bg-destructive/10 text-destructive border border-destructive/20"
                          : "bg-primary/10 text-primary border border-primary/20"
                      )}
                    >
                      {item.is_closed ? (
                        "Đóng cửa"
                      ) : (
                        <>
                          {item.open_time} - {item.close_time}
                          {!item.is_closed &&
                            item.open_time &&
                            item.close_time &&
                            item.open_time > item.close_time && (
                              <Badge
                                variant="warning"
                                className="ml-1 h-5 px-1.5 text-[9px] uppercase tracking-tighter"
                              >
                                (+1)
                              </Badge>
                            )}
                        </>
                      )}
                    </span>
                    {(() => {
                      const getOverrideInfo = (dateStr: string) => {
                        const dayOfWeek = getDay(new Date(dateStr));
                        const regHour = regularHours.find(
                          (h) => h.day_of_week === dayOfWeek
                        );
                        if (regHour && !regHour.is_closed) {
                          return `(Ghi đè: ${regHour.open_time}-${regHour.close_time})`;
                        }
                        return null;
                      };

                      const overrideText = getOverrideInfo(item.date);
                      return overrideText ? (
                        <span className="text-[10px] text-muted-foreground italic">
                          {overrideText}
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.reason}</p>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xóa ngày ngoại lệ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc muốn xóa ngày ngoại lệ &ldquo;{item.reason}&rdquo; ({format(new Date(item.date), "dd/MM/yyyy", { locale: vi })})? 
                        Thao tác này không thể hoàn tác.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => removeException(item.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Xóa
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
