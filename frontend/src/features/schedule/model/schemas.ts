import { z } from "zod"

/**
 * WHY: Định nghĩa schema cho Ca làm việc từ backend.
 */
export const shiftSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Tên ca không được để trống"),
  start_time: z.string(), // ISO time string or HH:mm:ss
  end_time: z.string(),
  color_code: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type Shift = z.infer<typeof shiftSchema>

/**
 * WHY: Trạng thái lịch làm việc.
 */
export enum ScheduleStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  CANCELLED = "CANCELLED",
}

export type ScheduleStatusType = ScheduleStatus


/**
 * WHY: Schema cho lịch làm việc của nhân viên.
 */
export const staffScheduleSchema = z.object({
  id: z.string().uuid(),
  staff_id: z.string().uuid(),
  shift_id: z.string().uuid(),
  work_date: z.string(), // ISO date string YYYY-MM-DD
  status: z.nativeEnum(ScheduleStatus),
  shift: shiftSchema.optional(),
  staff: z.any().optional(), // Sẽ định nghĩa chi tiết sau nếu cần
})

export type StaffSchedule = z.infer<typeof staffScheduleSchema>

/**
 * WHY: Schema để tạo lịch mới.
 */
export const createStaffScheduleSchema = z.object({
  staff_id: z.string().uuid("Cần chọn nhân viên"),
  shift_id: z.string().uuid("Cần chọn ca làm việc"),
  work_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ"),
  status: z.nativeEnum(ScheduleStatus),
})

export type CreateStaffSchedule = z.infer<typeof createStaffScheduleSchema>

/**
 * WHY: Schema cho tạo lịch hàng loạt.
 */
export const batchCreateScheduleSchema = z.object({
  staff_id: z.string().uuid("Cần chọn nhân viên"),
  shift_id: z.string().uuid("Cần chọn ca làm việc"),
  work_dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  status: z.nativeEnum(ScheduleStatus),
})

export type BatchCreateSchedule = z.infer<typeof batchCreateScheduleSchema>
