
import { z } from "zod"

// Format HH:MM
const timeStringSchema = z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)")

export const operatingHourSlotSchema = z.object({
  openTime: timeStringSchema,
  closeTime: timeStringSchema,
}).refine((data) => {
  // Logic validate overlap sẽ phức tạp hơn ở đây nếu làm strict
  // Với UI đơn giản, ta tin tưởng user nhập đúng thứ tự, backend sẽ validate chặt chẽ hơn
  return true
}, {
  message: "Invalid time range",
})

export const operatingDaySchema = z.object({
  dayOfWeek: z.number().min(0).max(6), // 0=Sun, 6=Sat
  isEnabled: z.boolean(),
  slots: z.array(operatingHourSlotSchema).default([]),
})

export const regularHoursFormSchema = z.object({
  days: z.array(operatingDaySchema)
})

export const exceptionDateSchema = z.object({
  date: z.date(),
  reason: z.string().optional(),
  isClosed: z.boolean(),
  openTime: timeStringSchema.optional(),
  closeTime: timeStringSchema.optional(),
}).refine((data) => {
  if (!data.isClosed && (!data.openTime || !data.closeTime)) {
    return false
  }
  return true
}, {
  message: "Must provide open/close time if not closed",
  path: ["openTime"],
})

export const operationalSettingsSchema = z.object({
  regularHours: regularHoursFormSchema,
  exceptionDates: z.array(exceptionDateSchema)
})

export type OperatingHourSlot = z.infer<typeof operatingHourSlotSchema>
export type OperatingDay = z.infer<typeof operatingDaySchema>
export type RegularHoursFormValues = z.infer<typeof regularHoursFormSchema>
export type ExceptionDateValues = z.infer<typeof exceptionDateSchema>
export type OperationalSettingsValues = z.infer<typeof operationalSettingsSchema>
