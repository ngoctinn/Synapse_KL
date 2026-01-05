"use client"

import { Copy, Plus, Trash2 } from "lucide-react"
import { useFieldArray, useFormContext, useWatch } from "react-hook-form"

import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/shared/ui/form"
import { Label } from "@/shared/ui/label"
import { Switch } from "@/shared/ui/switch"
import { TimePicker } from "./time-picker"


const DAYS_OF_WEEK = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"]

interface TimeSlotRowProps {
  dayIndex: number
  onCopyToAll?: (type: string) => void
}

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number)
  const totalMins = h * 60 + m + mins

  // Handle overload 24h
  if (totalMins >= 24 * 60) return "23:55"

  const newH = Math.floor(totalMins / 60).toString().padStart(2, '0')
  const newM = (totalMins % 60).toString().padStart(2, '0')
  return `${newH}:${newM}`
}

export function TimeSlotRow({ dayIndex, onCopyToAll }: TimeSlotRowProps) {
  const { control, trigger, formState: { errors } } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: `days.${dayIndex}.slots`
  })

  // WHY: Dùng useWatch để subscribe updates chính xác cho từng row
  const isEnabled = useWatch({
    control,
    name: `days.${dayIndex}.isEnabled`
  })

  const handleSwitchChange = (checked: boolean, fieldOnChange: (v: boolean) => void) => {
    fieldOnChange(checked)
    if (checked && fields.length === 0) {
      append({ openTime: "08:00", closeTime: "20:00" })
    } else if (!checked && fields.length > 0) {
      for (let i = fields.length - 1; i >= 0; i--) {
        remove(i)
      }
    }
  }

  const handleAddSlot = () => {
    if (fields.length === 0) {
      append({ openTime: "08:00", closeTime: "20:00" })
      return
    }

    // Smart append: Start new slot 15 mins after last slot ends
    const lastSlot = fields[fields.length - 1] as any
    const lastCloseTime = lastSlot.closeTime || "17:00"

    const newOpenTime = addMinutes(lastCloseTime, 15) // +15 mins buffer
    const newCloseTime = addMinutes(newOpenTime, 240) // +4 hours default duration

    append({ openTime: newOpenTime, closeTime: newCloseTime })
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="w-32 flex items-center gap-2">
          <FormField
            control={control}
            name={`days.${dayIndex}.isEnabled`}
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => handleSwitchChange(checked, field.onChange)}
                  />
                </FormControl>
                <Label className="font-semibold">{DAYS_OF_WEEK[dayIndex]}</Label>
              </FormItem>
            )}
          />
        </div>

        {isEnabled && (
          <div className="flex-1 flex flex-col gap-4 w-full">
            {fields.map((slot, slotIndex) => (
              <div key={slot.id} className="flex flex-col gap-1">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2">
                  <FormField
                    control={control}
                    name={`days.${dayIndex}.slots.${slotIndex}.openTime`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giờ mở</FormLabel>
                        <FormControl>
                          <TimePicker
                            value={field.value}
                            onChange={(v) => {
                              field.onChange(v);
                              // Trigger validation to re-check "Open < Close" rule
                              // This rule attaches error to 'closeTime', so we must trigger it.
                              trigger(`days.${dayIndex}.slots.${slotIndex}.closeTime`)

                              // Also trigger openTime to re-check Overlap rules if needed (handled by superRefine on parent, but good to trigger self)
                              trigger(`days.${dayIndex}.slots.${slotIndex}.openTime`)

                              // Trigger parent array to run superRefine for overlap check
                              trigger(`days.${dayIndex}.slots`)
                            }}
                            className={(errors.days as any)?.[dayIndex]?.slots?.[slotIndex]?.openTime ? "border-destructive rounded-md" : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <span className="hidden sm:inline pb-3 text-muted-foreground">-</span>
                  <FormField
                    control={control}
                    name={`days.${dayIndex}.slots.${slotIndex}.closeTime`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giờ đóng</FormLabel>
                        <FormControl>
                          <TimePicker
                            value={field.value}
                            onChange={(v) => {
                              field.onChange(v);
                              // Trigger validation to re-check "Open < Close" rule
                              trigger(`days.${dayIndex}.slots.${slotIndex}.closeTime`)

                              // Trigger parent array to run superRefine for overlap check
                              trigger(`days.${dayIndex}.slots`)
                            }}
                            className={(errors.days as any)?.[dayIndex]?.slots?.[slotIndex]?.closeTime ? "border-destructive rounded-md" : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(slotIndex)}
                    className="text-muted-foreground hover:text-destructive mb-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full sm:w-auto self-start"
              onClick={handleAddSlot}
            >
              <Plus className="h-4 w-4 mr-2" /> Thêm ca
            </Button>
          </div>
        )}

        {!isEnabled && <span className="text-muted-foreground italic flex-1">Đóng cửa</span>}

        {dayIndex === 1 && onCopyToAll && (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs w-[160px] justify-between">
                  Sao chép lịch...
                  <Copy className="h-3 w-3 ml-2 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => onCopyToAll("weekdays")}>
                  Sang các ngày trong tuần (T2-T6)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCopyToAll("weekend")}>
                  Sang cuối tuần (T7, CN)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCopyToAll("all")}>
                  Sang tất cả các ngày (T2-CN)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

