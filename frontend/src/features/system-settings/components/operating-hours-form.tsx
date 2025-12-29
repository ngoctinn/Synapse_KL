"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Copy } from "lucide-react"
import * as React from "react"
import { useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/ui/form"
import { Switch } from "@/shared/ui/switch"
import { TimePickerDropdown } from "@/shared/ui/time-picker-dropdown"
import { DayOfWeek, DAYS_OF_WEEK, OperatingHour } from "../types"

const operatingHourSchema = z.object({
  day_of_week: z.number(),
  open_time: z.string(),
  close_time: z.string(),
  is_closed: z.boolean(),
});

const formSchema = z.object({
  regular_operating_hours: z.array(operatingHourSchema),
});

type FormValues = z.infer<typeof formSchema>;

interface OperatingHoursFormProps {
  data?: OperatingHour[]
  onChange: (data: OperatingHour[]) => void
}

const DEFAULT_HOURS: OperatingHour[] = ([1, 2, 3, 4, 5, 6, 0] as DayOfWeek[]).map((day) => ({
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

  React.useEffect(() => {
    const subscription = form.watch((value) => {
      // Chỉ gọi onChange nếu validation thành công để tránh data rác lên cha
      if (value.regular_operating_hours) {
        onChange(value.regular_operating_hours as OperatingHour[]);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, onChange]);

  // Cập nhật lại form nếu data từ cha thay đổi (ví dụ: Reset)
  // Chỉ reset khi data khác biệt thực sự để tránh vòng lặp vô hạn
  React.useEffect(() => {
    if (data && JSON.stringify(data) !== JSON.stringify(form.getValues("regular_operating_hours"))) {
      form.reset({ regular_operating_hours: data });
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
  } | null>(null);

  const copyHours = (index: number) => {
    const values = form.getValues(`regular_operating_hours.${index}`);
    setClipboard({
      open_time: values.open_time,
      close_time: values.close_time,
      is_closed: values.is_closed,
    });
  };

  const pasteHours = (index: number) => {
    if (!clipboard) return;
    form.setValue(`regular_operating_hours.${index}.open_time`, clipboard.open_time);
    form.setValue(`regular_operating_hours.${index}.close_time`, clipboard.close_time);
    form.setValue(`regular_operating_hours.${index}.is_closed`, clipboard.is_closed);

    // Notify parent
    onChange(form.getValues("regular_operating_hours") as OperatingHour[]);
  };

  const copyToAll = (index: number) => {
    const source = form.getValues(`regular_operating_hours.${index}`);
    const updatedHours = fields.map((_, i) => ({
      ...source,
      day_of_week: form.getValues(`regular_operating_hours.${i}.day_of_week`) as DayOfWeek,
    }));
    form.setValue("regular_operating_hours", updatedHours);
    onChange(updatedHours);
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        <div className="rounded-md border p-4">
          <div className="space-y-4">
            {fields.map((field, index) => {
              const isClosed = form.watch(`regular_operating_hours.${index}.is_closed`);
              const dayInfo = DAYS_OF_WEEK.find(d => d.value === field.day_of_week);

              return (
                <div
                  key={field.id}
                  className="flex flex-col gap-4 py-3 sm:flex-row sm:items-center sm:justify-between border-b last:border-0"
                >
                  <div className="flex items-center gap-4 min-w-[120px]">
                    <FormField
                      control={form.control}
                      name={`regular_operating_hours.${index}.is_closed`}
                      render={({ field }) => (
                        <FormItem className="mb-0">
                          <FormControl>
                            <Switch
                              checked={!field.value}
                              onCheckedChange={(checked) => field.onChange(!checked)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <span className={cn("font-medium", isClosed && "text-muted-foreground")}>
                      {dayInfo?.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isClosed ? (
                      <span className="text-muted-foreground italic text-sm py-2 px-3">
                        Đóng cửa
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name={`regular_operating_hours.${index}.open_time`}
                          render={({ field }) => (
                            <FormItem className="mb-0">
                              <FormControl>
                                <TimePickerDropdown
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <span className="text-muted-foreground">đến</span>
                        <FormField
                          control={form.control}
                          name={`regular_operating_hours.${index}.close_time`}
                          render={({ field }) => (
                            <FormItem className="mb-0">
                                <FormControl>
                                  <TimePickerDropdown
                                    value={field.value}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                                {form.watch(`regular_operating_hours.${index}.open_time`) >= field.value && (
                                  <span className="text-[10px] absolute -bottom-4 right-0 text-amber-600 font-medium whitespace-nowrap">
                                    Sáng hôm sau
                                  </span>
                                )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => copyHours(index)}
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      title="Sao chép giờ"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {clipboard && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => pasteHours(index)}
                        className="h-8 w-8 text-primary animate-pulse"
                        title="Dán giờ"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                        </svg>
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToAll(index)}
                      className="text-[10px] text-muted-foreground hover:text-primary h-8 px-2"
                      title="Áp dụng cho tất cả các ngày"
                    >
                      Tất cả
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </form>
    </Form>
  )
}
