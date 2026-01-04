"use client"

import { Copy, Plus, Trash2 } from "lucide-react"
import { useFieldArray, useFormContext } from "react-hook-form"

import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import {
  FormControl,
  FormField,
  FormItem
} from "@/shared/ui/form"
import { Label } from "@/shared/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Switch } from "@/shared/ui/switch"


const DAYS_OF_WEEK = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"]

// WHY: 30 phút là granularity phổ biến cho lịch làm việc spa
const TIME_SLOTS = Array.from({ length: 49 }).map((_, i) => {
    const totalMinutes = i * 30
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
})

interface TimeSlotRowProps {
    dayIndex: number
    onCopyToAll?: () => void
}

export function TimeSlotRow({ dayIndex, onCopyToAll }: TimeSlotRowProps) {
    const { control, watch, formState: { errors } } = useFormContext()
    const { fields, append, remove } = useFieldArray({
        control,
        name: `days.${dayIndex}.slots`
    })

    const isEnabled = watch(`days.${dayIndex}.isEnabled`)

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
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <Label className="font-semibold">{DAYS_OF_WEEK[dayIndex]}</Label>
                            </FormItem>
                        )}
                    />
                </div>

                {isEnabled && (
                    <div className="flex-1 flex flex-col gap-2 w-full">
                        {fields.map((slot, slotIndex) => (
                            <div key={slot.id} className="flex flex-col sm:flex-row items-center gap-2">
                                <FormField
                                    control={control}
                                    name={`days.${dayIndex}.slots.${slotIndex}.openTime`}
                                    render={({ field }) => (
                                        <FormItem className="w-[120px] space-y-0">
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Mở" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {TIME_SLOTS.map((t) => (
                                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <span>-</span>
                                <FormField
                                    control={control}
                                    name={`days.${dayIndex}.slots.${slotIndex}.closeTime`}
                                    render={({ field }) => (
                                        <FormItem className="w-[120px] space-y-0">
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Đóng" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {TIME_SLOTS.map((t) => (
                                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => remove(slotIndex)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => append({ openTime: "08:00", closeTime: "20:00" })}
                        >
                            <Plus className="h-4 w-4 mr-2" /> Thêm ca
                        </Button>

                        {/* Validation Error Message */}
                        {(errors.days as any)?.[dayIndex]?.slots?.message && (
                            <p className="text-destructive text-sm font-medium">
                                {(errors.days as any)[dayIndex].slots.message}
                            </p>
                        )}

                    </div>
                )}

                {!isEnabled && <span className="text-muted-foreground italic flex-1">Đóng cửa</span>}

                {dayIndex === 1 && onCopyToAll && (
                     <Button type="button" variant="ghost" size="sm" onClick={onCopyToAll}>
                        <Copy className="h-4 w-4 mr-2"/> Copy to all
                     </Button>
                )}
            </CardContent>
        </Card>
    )
}
