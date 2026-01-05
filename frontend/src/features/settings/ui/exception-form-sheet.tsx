"use client"

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker"; // Import DateRange type
import { useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { OperationalSettingsFormValues } from "../model/schemas";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import { Switch } from "@/shared/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { exceptionDateSchema, ExceptionDateValues } from "../model/schemas";
import { TimePicker } from "./time-picker";

export function ExceptionDateForm() {
  const { control } = useFormContext<OperationalSettingsFormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "exceptionDates"
  })

  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  // WHY: Isolated form for "Add New" logic to support standard validation styling
  const addForm = useForm<ExceptionDateValues>({
    resolver: zodResolver(exceptionDateSchema),
    mode: "onChange", // Enable realtime validation
    defaultValues: {
      reason: "",
      isClosed: true,
      openTime: "08:00",
      closeTime: "20:00"
    }
  })

  // WHY: Reset form when sheet opens
  const onOpenChange = (open: boolean) => {
    setIsSheetOpen(open)
    if (open) {
      setDateRange(undefined) // Reset calendar range
      addForm.reset({
        reason: "",
        isClosed: true,
        openTime: "08:00",
        closeTime: "20:00"
      })
    }
  }

  // Helper to explode generic date range to array of dates
  const getDatesInRange = (startDate: Date, endDate: Date) => {
    const dates = []
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return dates
  }

  const onAddSubmit = (data: ExceptionDateValues) => {
    // Determine dates to add based on user selection
    let datesToAdd: Date[] = []

    if (dateRange?.from && dateRange?.to) {
      datesToAdd = getDatesInRange(dateRange.from, dateRange.to)
    } else if (dateRange?.from) {
      datesToAdd = [dateRange.from]
    }

    if (datesToAdd.length === 0) {
      addForm.setError("date", { type: "manual", message: "Vui lòng chọn ngày" })
      return
    }

    // 1. Check Duplicates
    const duplicateDates = datesToAdd.filter(newDate =>
      fields.some(field =>
        field.date &&
        field.date.toDateString() === newDate.toDateString()
      )
    )

    if (duplicateDates.length > 0) {
      const duplicateStr = duplicateDates.map(d => format(d, "dd/MM")).join(", ")
      addForm.setError("date", {
        type: "manual",
        message: "Các ngày sau đã tồn tại: " + duplicateStr
      })
      return
    }

    // 2. Explode & Append
    const newEntries = datesToAdd.map(date => ({
      ...data,
      date: date
    }))

    append(newEntries)

    setIsSheetOpen(false)
    toast.success("Đã thêm " + newEntries.length + " mục vào danh sách chờ. Vui lòng bấm 'Lưu thay đổi' để hoàn tất.")
  }

  // Watch isClosed to conditionally show TimePickers
  const isClosed = addForm.watch("isClosed")

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Danh sách các ngày nghỉ lễ hoặc có giờ làm việc đặc biệt.
        </div>
        <Sheet open={isSheetOpen} onOpenChange={onOpenChange}>
          <SheetTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Thêm ngày nghỉ</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Thêm ngày ngoại lệ</SheetTitle>
              <SheetDescription>
                Cấu hình ngày nghỉ hoặc giờ làm việc đặc biệt.
              </SheetDescription>
            </SheetHeader>

            <Form {...addForm}>
              <div className="space-y-4 p-4">
                {/* Date Picker - Multi/Single Mode via Range */}
                <FormField
                  control={addForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Ngày</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !dateRange && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange?.from ? (
                                dateRange.to ? (
                                  <>
                                    {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                                    {format(dateRange.to, "dd/MM/yyyy")}
                                  </>
                                ) : (
                                  format(dateRange.from, "dd/MM/yyyy")
                                )
                              ) : (
                                <span>Chọn ngày hoặc khoảng thời gian</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="range"
                            locale={vi} // Use Vietnamese locale
                            selected={dateRange}
                            onSelect={(range) => {
                              setDateRange(range)
                              if (range?.from) {
                                addForm.setValue("date", range.from, { shouldValidate: true })
                              } else {
                                addForm.resetField("date")
                              }
                            }}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                            numberOfMonths={1} // Show only 1 month as requested
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Reason Input */}
                <FormField
                  control={addForm.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lý do / Tên dịp lễ</FormLabel>
                      <FormControl>
                        <Input placeholder="Ví dụ: Tết Nguyên Đán" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Is Closed Switch */}
                <FormField
                  control={addForm.control}
                  name="isClosed"
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

                {/* Time Pickers (Conditional) */}
                {!isClosed && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="openTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giờ mở</FormLabel>
                          <FormControl>
                            <TimePicker
                              value={field.value}
                              onChange={(v) => {
                                field.onChange(v)
                                // Trigger validation for closeTime to check relationship
                                addForm.trigger("closeTime")
                              }}
                              className={addForm.formState.errors.closeTime ? "border-destructive" : ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="closeTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giờ đóng</FormLabel>
                          <FormControl>
                            <TimePicker
                              value={field.value}
                              onChange={(v) => {
                                field.onChange(v)
                                addForm.trigger("closeTime") // Re-validate self to clear error if valid
                              }}
                              className={addForm.formState.errors.closeTime ? "border-destructive" : ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <SheetFooter>
                  <Button
                    type="button"
                    onClick={addForm.handleSubmit(onAddSubmit)}
                  >
                    Thêm vào danh sách
                  </Button>
                </SheetFooter>
              </div>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="border rounded-md bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ngày</TableHead>
              <TableHead>Lý do</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                  Chưa có ngày ngoại lệ nào.
                </TableCell>
              </TableRow>
            )}
            {fields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell>
                  {field.date ? format(field.date, "dd/MM/yyyy") : "-"}
                </TableCell>
                <TableCell>{field.reason}</TableCell>
                <TableCell>
                  {field.isClosed ? (
                    <span className="inline-flex items-center rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive ring-1 ring-inset ring-destructive/20">
                      Đóng cửa
                    </span>
                  ) : (
                    <span>{field.openTime} - {field.closeTime}</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
