"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Copy,
  Sparkles,
} from "lucide-react";
import * as React from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import * as z from "zod";

import { TimePickerDropdown } from "@/shared/components/time-picker-dropdown";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/ui/form";
import { Switch } from "@/shared/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { DayOfWeek, DAYS_OF_WEEK, OperatingHour } from "../types";

// Preset templates cho ngành Spa
const PRESETS = {
  spa_standard: {
    label: "Spa tiêu chuẩn",
    description: "T2-CN: 09:00-21:00",
    hours: [1, 2, 3, 4, 5, 6, 0].map((day) => ({
      day_of_week: day as DayOfWeek,
      open_time: "09:00",
      close_time: "21:00",
      is_closed: false,
    })),
  },
  spa_extended: {
    label: "Giờ mở rộng",
    description: "T2-CN: 08:00-22:00",
    hours: [1, 2, 3, 4, 5, 6, 0].map((day) => ({
      day_of_week: day as DayOfWeek,
      open_time: "08:00",
      close_time: "22:00",
      is_closed: false,
    })),
  },
  spa_weekend_extended: {
    label: "Cuối tuần mở rộng",
    description: "T2-T6: 09:00-20:00, T7-CN: 08:00-22:00",
    hours: [
      ...[1, 2, 3, 4, 5].map((day) => ({
        day_of_week: day as DayOfWeek,
        open_time: "09:00",
        close_time: "20:00",
        is_closed: false,
      })),
      ...[6, 0].map((day) => ({
        day_of_week: day as DayOfWeek,
        open_time: "08:00",
        close_time: "22:00",
        is_closed: false,
      })),
    ],
  },
  spa_weekday_focus: {
    label: "Nghỉ Chủ nhật",
    description: "T2-T7: 09:00-21:00, CN nghỉ",
    hours: [
      ...[1, 2, 3, 4, 5, 6].map((day) => ({
        day_of_week: day as DayOfWeek,
        open_time: "09:00",
        close_time: "21:00",
        is_closed: false,
      })),
      {
        day_of_week: 0 as DayOfWeek,
        open_time: "09:00",
        close_time: "21:00",
        is_closed: true,
      },
    ],
  },
};

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
  open_time: "09:00",
  close_time: "21:00",
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
  const isInitialMount = React.useRef(true);

  // Sử dụng useWatch thay vì form.watch() để tương thích với React Compiler
  const watchedHours = useWatch({
    control: form.control,
    name: "regular_operating_hours",
  });

  React.useEffect(() => {
    // Skip initial mount và quá trình reset
    if (isInitialMount.current || isResetting.current) return;

    // Chỉ gửi update lên cha nếu thực sự có thay đổi từ user interaction
    if (watchedHours) {
      // Clone mảng để break reference mutation, đảm bảo component cha nhận diện thay đổi state
      onChange([...watchedHours] as OperatingHour[]);
    }
  }, [watchedHours, onChange]);

  // Mark initial mount complete sau 1 tick
  React.useEffect(() => {
    requestAnimationFrame(() => {
      isInitialMount.current = false;
    });
  }, []);

  // Cập nhật lại form nếu data từ cha thay đổi (ví dụ: khi nhấn Hủy/Reset)
  React.useEffect(() => {
    if (data) {
      const currentValues = form.getValues("regular_operating_hours");
      // Chỉ reset nếu có sự khác biệt thực sự để tránh vòng lặp render
      const hasChanged = !isSameHours(data, currentValues);

      if (hasChanged) {
        isResetting.current = true;
        form.reset({ regular_operating_hours: data });
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

  // Tính toán summary
  const summary = React.useMemo(() => {
    const openDays = watchedValues.filter((d) => !d.is_closed).length;
    const closedDays = watchedValues.filter((d) => d.is_closed).length;

    // Tìm giờ phổ biến nhất
    const timePatterns = watchedValues
      .filter((d) => !d.is_closed)
      .map((d) => `${d.open_time}-${d.close_time}`);
    const mostCommon = timePatterns.sort(
      (a, b) =>
        timePatterns.filter((v) => v === b).length -
        timePatterns.filter((v) => v === a).length
    )[0];

    return { openDays, closedDays, mostCommon };
  }, [watchedValues]);

  // Quick Actions
  const applyToWeekdays = (sourceIndex: number) => {
    const source = form.getValues(`regular_operating_hours.${sourceIndex}`);
    const weekdayIndices = fields
      .map((f, i) => ({ index: i, day: f.day_of_week }))
      .filter((f) => f.day >= 1 && f.day <= 5) // T2-T6
      .map((f) => f.index);

    weekdayIndices.forEach((i) => {
      form.setValue(`regular_operating_hours.${i}.open_time`, source.open_time);
      form.setValue(
        `regular_operating_hours.${i}.close_time`,
        source.close_time
      );
      form.setValue(`regular_operating_hours.${i}.is_closed`, source.is_closed);
    });
    onChange([
      ...(form.getValues("regular_operating_hours") as OperatingHour[]),
    ]);
  };

  const applyToWeekend = (sourceIndex: number) => {
    const source = form.getValues(`regular_operating_hours.${sourceIndex}`);
    const weekendIndices = fields
      .map((f, i) => ({ index: i, day: f.day_of_week }))
      .filter((f) => f.day === 0 || f.day === 6) // CN, T7
      .map((f) => f.index);

    weekendIndices.forEach((i) => {
      form.setValue(`regular_operating_hours.${i}.open_time`, source.open_time);
      form.setValue(
        `regular_operating_hours.${i}.close_time`,
        source.close_time
      );
      form.setValue(`regular_operating_hours.${i}.is_closed`, source.is_closed);
    });
    onChange([
      ...(form.getValues("regular_operating_hours") as OperatingHour[]),
    ]);
  };

  const openAllDays = () => {
    fields.forEach((_, i) => {
      form.setValue(`regular_operating_hours.${i}.is_closed`, false);
    });
    onChange([
      ...(form.getValues("regular_operating_hours") as OperatingHour[]),
    ]);
  };

  const applyPreset = (presetKey: keyof typeof PRESETS) => {
    const preset = PRESETS[presetKey];
    preset.hours.forEach((hour) => {
      const fieldIndex = fields.findIndex(
        (f) => f.day_of_week === hour.day_of_week
      );
      if (fieldIndex !== -1) {
        form.setValue(
          `regular_operating_hours.${fieldIndex}.open_time`,
          hour.open_time
        );
        form.setValue(
          `regular_operating_hours.${fieldIndex}.close_time`,
          hour.close_time
        );
        form.setValue(
          `regular_operating_hours.${fieldIndex}.is_closed`,
          hour.is_closed
        );
      }
    });
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
    onChange([...updatedHours]);
  };

  const setAllDay = (index: number) => {
    form.setValue(`regular_operating_hours.${index}.open_time`, "00:00");
    form.setValue(`regular_operating_hours.${index}.close_time`, "00:00");
    form.setValue(`regular_operating_hours.${index}.is_closed`, false);
  };

  return (
    <Form {...form}>
      <form className="space-y-4">
        {/* Summary Bar */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span className="font-medium text-foreground">
                {summary.openDays}
              </span>{" "}
              ngày mở
            </span>
            {summary.closedDays > 0 && (
              <span>• {summary.closedDays} ngày nghỉ</span>
            )}
            {summary.mostCommon && (
              <span className="hidden sm:inline">
                • Phổ biến: {summary.mostCommon}
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Preset Dropdown */}
            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1.5"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Mẫu nhanh
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Áp dụng cấu hình có sẵn cho spa</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Chọn mẫu cấu hình</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(PRESETS).map(([key, preset]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => applyPreset(key as keyof typeof PRESETS)}
                    className="flex flex-col items-start gap-0.5 py-2"
                  >
                    <span className="font-medium">{preset.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {preset.description}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Open All Days */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openAllDays}
                    className="h-8 text-xs"
                  >
                    Mở cả tuần
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mở cửa tất cả các ngày trong tuần</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm px-6">
          <div className="divide-y">
            {/* Sắp xếp theo thứ tự T2→CN (1,2,3,4,5,6,0) */}
            {[...fields]
              .map((field, originalIndex) => ({ field, originalIndex }))
              .sort((a, b) => {
                const orderA =
                  a.field.day_of_week === 0 ? 7 : a.field.day_of_week;
                const orderB =
                  b.field.day_of_week === 0 ? 7 : b.field.day_of_week;
                return orderA - orderB;
              })
              .map(({ field, originalIndex: index }) => {
                const isClosed = form.watch(
                  `regular_operating_hours.${index}.is_closed`
                );
                const dayInfo = DAYS_OF_WEEK.find(
                  (d) => d.value === field.day_of_week
                );
                const isWeekend =
                  field.day_of_week === 0 || field.day_of_week === 6;

                return (
                  <div
                    key={field.id}
                    className={cn(
                      "flex flex-col gap-4 py-5 sm:grid sm:grid-cols-[180px_1fr_auto] sm:items-center sm:gap-4",
                      isWeekend && "bg-muted/30 -mx-6 px-6"
                    )}
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
                    </div>

                    {/* Cột 2: Khung giờ */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      {isClosed ? (
                        <div className="flex h-10 items-center">
                          <Badge
                            variant="outline"
                            className="text-muted-foreground font-normal border-dashed uppercase text-xs tracking-wider px-3 py-1"
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
                                    className="gap-1 px-1.5 py-0 font-medium text-xs whitespace-nowrap"
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
                                "h-8 px-3 text-xs font-medium transition-all flex-1 sm:flex-none",
                                watchedValues[index].open_time === "00:00" &&
                                  watchedValues[index].close_time === "00:00"
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground"
                              )}
                            >
                              <Clock className="mr-1.5 size-3 stroke-2" />
                              Cả ngày
                            </Button>

                            {/* Overlap warning */}
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
                                    className="h-8 px-2 text-xs gap-1 shrink-0"
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

                    {/* Cột 3: Actions Dropdown */}
                    <div className="flex items-center justify-end gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="h-4 w-4 mr-1.5" />
                            <span className="text-xs">Sao chép</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => copyToAll(index)}>
                            <Check className="mr-2 h-4 w-4" />
                            Áp dụng cho tất cả
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => applyToWeekdays(index)}
                          >
                            Áp dụng T2 → T6
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => applyToWeekend(index)}
                          >
                            Áp dụng T7 & CN
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
