
import { z } from "zod"

// WHY: Backend trả về format HH:MM:SS, UI dùng HH:MM
const timeStringSchema = z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, "Định dạng giờ không hợp lệ")

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

// WHY: Parse time string thành phút để so sánh
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export const operatingHourSlotSchema = z.object({
  openTime: timeStringSchema,
  closeTime: timeStringSchema,
}).refine((data) => {
  // WHY: Validate giờ mở < giờ đóng (không hỗ trợ overnight ở UI)
  return timeToMinutes(data.openTime) < timeToMinutes(data.closeTime)
}, {
  message: "Giờ mở cửa phải trước giờ đóng cửa",
  path: ["closeTime"],
})

export const operatingDaySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  isEnabled: z.boolean(),
  slots: z.array(operatingHourSlotSchema).default([]),
}).superRefine((data, ctx) => {
  if (!data.isEnabled || data.slots.length <= 1) return

  // WHY: Sort slots để kiểm tra theo thứ tự thời gian
  const sortedSlots = [...data.slots].sort((a, b) =>
    timeToMinutes(a.openTime) - timeToMinutes(b.openTime)
  )

  for (let i = 0; i < sortedSlots.length - 1; i++) {
    const current = sortedSlots[i]
    const next = sortedSlots[i + 1]

    const currentCloseMin = timeToMinutes(current.closeTime)
    const nextOpenMin = timeToMinutes(next.openTime)
    const gapMinutes = nextOpenMin - currentCloseMin

    // WHY: Kiểm tra overlap (ca sau bắt đầu trước khi ca trước kết thúc)
    if (gapMinutes < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Ca ${i + 1} và ${i + 2} bị trùng giờ`,
        path: ["slots"],
      })
      return
    }

    // WHY: Domain rule - Recovery time 10-15 phút để vệ sinh/chuẩn bị
    if (gapMinutes < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Các ca phải cách nhau tối thiểu 10 phút (recovery time)",
        path: ["slots"],
      })
      return
    }
  }
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
  // WHY: Nếu không đóng cửa, phải có cả openTime và closeTime
  if (!data.isClosed) {
    if (!data.openTime || !data.closeTime) return false
    // WHY: Validate giờ mở < giờ đóng
    return timeToMinutes(data.openTime) < timeToMinutes(data.closeTime)
  }
  return true
}, {
  message: "Giờ mở cửa phải trước giờ đóng cửa",
  path: ["closeTime"],
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
