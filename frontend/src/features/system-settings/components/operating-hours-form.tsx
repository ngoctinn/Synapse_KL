"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Check,
  ClipboardPaste,
  Clock,
  Copy,
  X,
} from "lucide-react";
import * as React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

import { TimePickerDropdown } from "@/shared/components/time-picker-dropdown";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/ui/form";
import { Switch } from "@/shared/ui/switch";
import { DayOfWeek, DAYS_OF_WEEK, OperatingHour } from "../types";

const operatingHourSchema = z.object({
  day_of_week: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
  ]),
  open_time: z.string(),
  close_time: z.string(),
  is_closed: z.boolean(),
});

const formSchema = z.object({
  regular_operating_hours: z.array(operatingHourSchema),
});

type FormValues = z.infer<typeof formSchema>;

interface OperatingHoursFormProps {
  data?: OperatingHour[];
  onChange: (data: OperatingHour[]) => void;
}

const DEFAULT_HOURS: OperatingHour[] = (
  [1, 2, 3, 4, 5, 6, 0] as DayOfWeek[]
).map((day) => ({
  day_of_week: day,
  open_time: "08:00",
  close_time: "20:00",
  is_closed: false,
}));

export function OperatingHoursForm({
  data,
  onChange,
}: OperatingHoursFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      regular_operating_hours: data || DEFAULT_HOURS,
    },
  });

  // Theo dõi thay đổi và báo cáo lên cha
  const watchedValues = form.watch("regular_operating_hours");

  const isSameHours = (a: OperatingHour[], b: OperatingHour[]) => {
    if (!a || !b || a.length !== b.length) return false;
    return a.every(
      (h, i) =>
        h.day_of_week === b[i].day_of_week &&
        h.open_time === b[i].open_time &&
        h.close_time === b[i].close_time &&
        h.is_closed === b[i].is_closed
    );
  };

  const isResetting = React.useRef(false);

  React.useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      // Nếu đang trong quá trình reset, không đẩy ngược lên cha
      if (isResetting.current) return;

      // Chỉ gửi update lên cha nếu thực sự có thay đổi từ user interaction (change/blur)
      // hoặc khi giá trị mảng thay đổi
      if (value.regular_operating_hours) {
        // Clone mảng để break reference mutation, đảm bảo component cha nhận diện thay đổi state
        onChange([...value.regular_operating_hours] as OperatingHour[]);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, onChange]);

  // Cập nhật lại form nếu data từ cha thay đổi (ví dụ: khi nhấn Hủy/Reset)
  React.useEffect(() => {
    if (data) {
      const currentValues = form.getValues("regular_operating_hours");
      // Chỉ reset nếu có sự khác biệt thực sự để tránh vòng lặp render
      const hasChanged = !isSameHours(data, currentValues);

      if (hasChanged) {
        isResetting.current = true;
        form.reset({ regular_operating_hours: data });
        setLastCopiedIndex(null);
        setPastedIndices(new Set());
        // Trả lại trạng thái sau khi reset hoàn tất trong tick tiếp theo
        setTimeout(() => {
          isResetting.current = false;
        }, 0);
      }
    }
  }, [data, form]);

  const { fields } = useFieldArray({
    name: "regular_operating_hours",
    control: form.control,
  });

  const [clipboard, setClipboard] = React.useState<{
    open_time: string;
    close_time: string;
    is_closed: boolean;
    index: number | null;
  } | null>(null);

  const [lastCopiedIndex, setLastCopiedIndex] = React.useState<number | null>(
    null
  );
  const [pastedIndices, setPastedIndices] = React.useState<Set<number>>(
    new Set()
  );

  const copyHours = (index: number) => {
    const values = form.getValues(`regular_operating_hours.${index}`);
    setClipboard({
      open_time: values.open_time,
      close_time: values.close_time,
      is_closed: values.is_closed,
      index,
    });
    setLastCopiedIndex(index);
    setTimeout(() => setLastCopiedIndex(null), 2000);
  };

  const setAllDay = (index: number) => {
    form.setValue(`regular_operating_hours.${index}.open_time`, "00:00");
    form.setValue(`regular_operating_hours.${index}.close_time`, "00:00");
    form.setValue(`regular_operating_hours.${index}.is_closed`, false);
  };

  const pasteHours = (index: number) => {
    if (!clipboard) return;
    form.setValue(
      `regular_operating_hours.${index}.open_time`,
      clipboard.open_time
    );
    form.setValue(
      `regular_operating_hours.${index}.close_time`,
      clipboard.close_time
    );
    form.setValue(
      `regular_operating_hours.${index}.is_closed`,
      clipboard.is_closed
    );

    setPastedIndices((prev) => new Set(prev).add(index));

    // Notify parent
    // Notify parent with clones
    onChange([
      ...(form.getValues("regular_operating_hours") as OperatingHour[]),
    ]);
  };

  const copyToAll = (index: number) => {
    const source = form.getValues(`regular_operating_hours.${index}`);
    const updatedHours = fields.map((_, i) => ({
      ...source,
      day_of_week: form.getValues(
        `regular_operating_hours.${i}.day_of_week`
      ) as DayOfWeek,
    }));
    form.setValue("regular_operating_hours", updatedHours);
    setPastedIndices(new Set(fields.map((_, i) => i)));
    onChange([...updatedHours]);
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm px-6">
          <div className="space-y-4">
            {fields.map((field, index) => {
              const isClosed = form.watch(
                `regular_operating_hours.${index}.is_closed`
              );
              const dayInfo = DAYS_OF_WEEK.find(
                (d) => d.value === field.day_of_week
              );

              return (
                <div
                  key={field.id}
                  className="flex flex-col gap-4 py-5 sm:grid sm:grid-cols-[160px_1fr_auto] sm:items-center sm:gap-4 border-b last:border-0"
                >
                  {/* Cột 1: Trạng thái & Ngày */}
                  <div className="flex items-center justify-between sm:justify-start gap-3">
                    <div className="flex items-center gap-3">
                      <FormField
                        control={form.control}
                        name={`regular_operating_hours.${index}.is_closed`}
                        render={({ field }) => (
                          <FormItem className="mb-0">
                            <FormControl>
                              <Switch
                                id={`switch-${index}`}
                                checked={!field.value}
                                onCheckedChange={(checked) =>
                                  field.onChange(!checked)
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <label
                        htmlFor={`switch-${index}`}
                        className={cn(
                          "text-sm font-semibold select-none cursor-pointer w-24 shrink-0",
                          isClosed
                            ? "text-muted-foreground/60"
                            : "text-foreground"
                        )}
                      >
                        {dayInfo?.label}
                      </label>
                    </div>

                    {/* Nút Action hiện ở mobile trên cùng hàng với tên ngày */}
                    <div className="flex sm:hidden items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => copyHours(index)}
                        className={cn(
                          lastCopiedIndex === index
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground"
                        )}
                      >
                        {lastCopiedIndex === index ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      {clipboard && (
                        <Button
                          type="button"
                          variant={
                            pastedIndices.has(index) ? "default" : "secondary"
                          }
                          size="icon"
                          onClick={() => pasteHours(index)}
                        >
                          <ClipboardPaste className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Cột 2: Khung giờ */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {isClosed ? (
                      <div className="flex h-10 items-center">
                        <Badge
                          variant="outline"
                          className="text-muted-foreground font-normal border-dashed uppercase text-[9px] tracking-wider px-3 py-1"
                        >
                          Đóng cửa
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                          <FormField
                            control={form.control}
                            name={`regular_operating_hours.${index}.open_time`}
                            render={({ field }) => (
                              <FormItem className="mb-0 flex-1 sm:flex-none">
                                <FormControl>
                                  <TimePickerDropdown
                                    value={field.value}
                                    onChange={field.onChange}
                                    className="w-full sm:w-[100px]"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <span className="text-muted-foreground text-xs shrink-0">
                            đến
                          </span>
                          <div className="relative flex-1 sm:flex-none">
                            <FormField
                              control={form.control}
                              name={`regular_operating_hours.${index}.close_time`}
                              render={({ field }) => (
                                <FormItem className="mb-0">
                                  <FormControl>
                                    <TimePickerDropdown
                                      value={field.value}
                                      onChange={field.onChange}
                                      className="w-full sm:w-[100px]"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            {watchedValues[index].open_time >
                              watchedValues[index].close_time && (
                              <div className="absolute top-full right-0 mt-1 z-10">
                                <Badge
                                  variant="warning"
                                  className="gap-1 px-1.5 py-0 font-medium text-[9px] whitespace-nowrap"
                                >
                                  <AlertCircle className="size-3 stroke-2" />
                                  <span>Sáng hôm sau (+1)</span>
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant={
                              watchedValues[index].open_time === "00:00" &&
                              watchedValues[index].close_time === "00:00"
                                ? "default"
                                : "secondary"
                            }
                            size="sm"
                            onClick={() => setAllDay(index)}
                            className={cn(
                              "h-8 px-3 text-[10px] font-medium transition-all flex-1 sm:flex-none",
                              watchedValues[index].open_time === "00:00" &&
                                watchedValues[index].close_time === "00:00"
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground"
                            )}
                          >
                            <Clock className="mr-1.5 size-3 stroke-2" />
                            Cả ngày
                          </Button>

                          {/* Overlap warning - visible on mobile too */}
                          {(() => {
                            const getOverlapError = (idx: number) => {
                              const prevIdx =
                                idx === 0 ? fields.length - 1 : idx - 1;
                              const prevDay = watchedValues[prevIdx];
                              const currentDay = watchedValues[idx];
                              const isPrevOvernight =
                                !prevDay.is_closed &&
                                prevDay.close_time < prevDay.open_time;
                              const isCurrentOpen = !currentDay.is_closed;

                              if (
                                isPrevOvernight &&
                                isCurrentOpen &&
                                prevDay.close_time > currentDay.open_time
                              ) {
                                return true;
                              }
                              return false;
                            };

                            if (getOverlapError(index)) {
                              return (
                                <Badge
                                  variant="error"
                                  className="h-8 px-2 text-[9px] gap-1 shrink-0"
                                >
                                  <AlertCircle className="size-3 stroke-2" />
                                  Xung đột
                                </Badge>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cột 3: Actions row-level (Chỉ hiện ở Desktop) */}
                  <div className="hidden sm:flex items-center justify-end gap-1 min-w-[150px]">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => copyHours(index)}
                      className={cn(
                        "transition-colors",
                        lastCopiedIndex === index
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground"
                      )}
                      title="Sao chép giờ"
                    >
                      {lastCopiedIndex === index ? (
                        <Check className="h-5 w-5 stroke-2" />
                      ) : (
                        <Copy className="h-5 w-5 stroke-2" />
                      )}
                    </Button>
                    {clipboard && (
                      <>
                        <Button
                          type="button"
                          variant={
                            pastedIndices.has(index) ? "default" : "secondary"
                          }
                          size="icon"
                          onClick={() => pasteHours(index)}
                          className={cn(
                            "transition-all",
                            pastedIndices.has(index)
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-primary border-primary/20 shadow-sm"
                          )}
                          title="Dán giờ"
                        >
                          <ClipboardPaste className="h-5 w-5 stroke-2" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setClipboard(null);
                            setLastCopiedIndex(null);
                            setPastedIndices(new Set());
                          }}
                          className="text-muted-foreground/30"
                          title="Hủy sao chép"
                        >
                          <X className="h-4 w-4 stroke-2" />
                        </Button>
                      </>
                    )}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => copyToAll(index)}
                      className="text-[10px] text-muted-foreground h-8 px-2 ml-1 border-dashed"
                    >
                      Tất cả
                    </Button>
                  </div>

                  {/* Nút "Áp dụng tất cả" Mobile */}
                  <div className="flex sm:hidden">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => copyToAll(index)}
                      className="w-full text-xs text-muted-foreground h-9 border-dashed"
                    >
                      Sao chép cho tất cả các ngày
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </form>
    </Form>
  );
}
