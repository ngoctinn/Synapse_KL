
import { z } from "zod"

// WHY: Backend trả về format HH:MM:SS
const timeStringSchema = z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, "Invalid time format")

// === API Schemas (snake_case - khớp với Backend) ===

export const operatingHourApiSchema = z.object({
  day_of_week: z.number().min(0).max(6),
  open_time: timeStringSchema,
  close_time: timeStringSchema,
  is_closed: z.boolean(),
  label: z.string().nullable().optional(),
})

export const exceptionDateApiSchema = z.object({
  date: z.string(), // WHY: API trả về ISO date string
  reason: z.string().nullable().optional(),
  is_closed: z.boolean(),
  open_time: timeStringSchema.nullable().optional(),
  close_time: timeStringSchema.nullable().optional(),
})

export const operationalSettingsApiSchema = z.object({
  regular_operating_hours: z.array(operatingHourApiSchema),
  exception_dates: z.array(exceptionDateApiSchema),
})

// === Form Schemas (camelCase - dùng trong UI) ===

export const operatingHourSlotSchema = z.object({
  openTime: timeStringSchema,
  closeTime: timeStringSchema,
})

export const operatingDaySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  isEnabled: z.boolean(),
  slots: z.array(operatingHourSlotSchema).default([]),
}).refine((data) => {
  if (!data.isEnabled || data.slots.length <= 1) return true

  // Sort slots by openTime
  const sortedSlots = [...data.slots].sort((a, b) => a.openTime.localeCompare(b.openTime))

  for (let i = 0; i < sortedSlots.length - 1; i++) {
    const current = sortedSlots[i]
    const next = sortedSlots[i + 1]

    // Check overlap: current.close > next.open
    // Lưu ý: So sánh string HH:MM hoạt động tốt
    if (current.closeTime > next.openTime) {
      return false
    }
  }
  return true
}, {
  message: "Time slots cannot overlap",
  path: ["slots"], // Sẽ hiển thị lỗi ở field slots
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
})

export const operationalSettingsFormSchema = z.object({
  days: z.array(operatingDaySchema),
  exceptionDates: z.array(exceptionDateSchema),
})

// === Types ===

export type OperatingHourApi = z.infer<typeof operatingHourApiSchema>
export type ExceptionDateApi = z.infer<typeof exceptionDateApiSchema>
export type OperationalSettingsApi = z.infer<typeof operationalSettingsApiSchema>

export type OperatingHourSlot = z.infer<typeof operatingHourSlotSchema>
export type OperatingDay = z.infer<typeof operatingDaySchema>
export type RegularHoursFormValues = z.infer<typeof regularHoursFormSchema>
export type ExceptionDateValues = z.infer<typeof exceptionDateSchema>
export type OperationalSettingsFormValues = z.infer<typeof operationalSettingsFormSchema>

