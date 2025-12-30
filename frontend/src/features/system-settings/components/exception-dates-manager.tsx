"use client"

import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Plus, Trash2 } from "lucide-react"
import * as React from "react"

import { cn } from "@/shared/lib/utils"
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
import { DatePickerWithRange } from "@/shared/ui/date-range-picker"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { Switch } from "@/shared/ui/switch"
import { TimePickerDropdown } from "@/shared/ui/time-picker-dropdown"
import { zodResolver } from "@hookform/resolvers/zod"
import { eachDayOfInterval, getDay, isSameDay } from "date-fns"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ExceptionDate, OperatingHour } from "../types"
import { OvernightIndicator } from "./overnight-indicator"

const exceptionDateSchema = z.object({
  dateRange: z.object({
    from: z.date(),
    to: z.date().optional(),
  }),
  reason: z.string().min(1, "Vui lòng nhập lý do"),
  is_closed: z.boolean(),
  open_time: z.string().optional(),
  close_time: z.string().optional(),
})
.refine((data) => {
  if (data.is_closed) return true;
  return !!(data.open_time && data.close_time);
}, {
  message: "Vui lòng chọn đầy đủ giờ mở và đóng cửa",
  path: ["close_time"],
});

type ExceptionDateFormValues = z.infer<typeof exceptionDateSchema>;

interface ExceptionDatesManagerProps {
  initialData?: ExceptionDate[]
  regularHours?: OperatingHour[]
  onChange: (data: ExceptionDate[]) => void
}

export function ExceptionDatesManager({
  initialData = [],
  regularHours = [],
  onChange,
}: ExceptionDatesManagerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [exceptions, setExceptions] = React.useState<ExceptionDate[]>(initialData);

  // Đồng bộ lại local state khi dữ liệu từ cha thay đổi (ví dụ: khi nhấn Hủy/Reset)
  React.useEffect(() => {
    if (JSON.stringify(initialData) !== JSON.stringify(exceptions)) {
      setExceptions(initialData);
    }
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
      ? eachDayOfInterval({ start: values.dateRange.from, end: values.dateRange.to })
      : [values.dateRange.from];

    const newExceptions: ExceptionDate[] = dates.map(date => ({
      id: crypto.randomUUID(),
      date: date.toISOString(),
      reason: values.reason,
      is_closed: values.is_closed,
      open_time: values.open_time,
      close_time: values.close_time,
    }));

    // Tránh trùng lặp ngày nếu người dùng thêm lại ngày đã có
    const filteredOld = exceptions.filter(old =>
      !newExceptions.some(newExp => isSameDay(new Date(old.date), new Date(newExp.date)))
    );

    const updated = [...filteredOld, ...newExceptions].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    setExceptions(updated);
    onChange(updated);
    setIsOpen(false);
    form.reset();
  };

  const removeException = (id: string) => {
    const updated = exceptions.filter(e => e.id !== id);
    setExceptions(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Danh sách ngày ngoại lệ</h3>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Các thiết lập tại đây sẽ ghi đè lên Giờ hoạt động định kỳ.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Thêm ngày
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Thêm ngày ngoại lệ</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
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
                            {form.watch("open_time") && field.value && form.watch("open_time")! >= field.value && (
                              <div className="absolute top-full right-0 mt-1">
                                <OvernightIndicator />
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
              <div key={item.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      <span className="capitalize">{format(new Date(item.date), "EEEE", { locale: vi })}</span>,{" "}
                      {format(new Date(item.date), "dd/MM/yyyy")}
                    </span>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1",
                      item.is_closed
                        ? "bg-destructive/10 text-destructive border border-destructive/20"
                        : "bg-primary/10 text-primary border border-primary/20"
                    )}>
                      {item.is_closed ? "Đóng cửa" : (
                        <>
                          {item.open_time} - {item.close_time}
                          {!item.is_closed && item.open_time && item.close_time && item.open_time >= item.close_time && (
                            <span className="ml-1 text-[9px] font-medium text-amber-600 bg-amber-50/50 px-1 rounded-full border border-amber-200/60 uppercase tracking-tighter">
                              (+1)
                            </span>
                          )}
                        </>
                      )}
                    </span>
                    {(() => {
                      const dayOfWeek = getDay(new Date(item.date));
                      const regHour = regularHours.find(h => h.day_of_week === dayOfWeek);
                      if (regHour && !regHour.is_closed) {
                        return (
                          <span className="text-[10px] text-muted-foreground italic">
                            (Ghi đè: {regHour.open_time}-{regHour.close_time})
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.reason}</p>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-destructive">Xác nhận xóa?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa ngày ngoại lệ này? Hành động này không thể hoàn tác.
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
  )
}
