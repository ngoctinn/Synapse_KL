"use server"

import { fetchApi } from "@/shared/lib/api-client"
import { revalidatePath } from "next/cache"
import {
    BatchCreateSchedule,
    CreateStaffSchedule,
    ScheduleStatusType,
    Shift,
    StaffSchedule
} from "../model/schemas"

/**
 * WHY: Lấy danh sách các ca làm việc.
 */
export async function getShifts() {
  return await fetchApi<Shift[]>("/scheduling/shifts")
}

/**
 * WHY: Tạo mới một ca làm việc.
 */
export async function createShift(data: Omit<Shift, "id" | "created_at" | "updated_at">) {
  const res = await fetchApi<Shift>("/scheduling/shifts", {
    method: "POST",
    body: JSON.stringify(data),
  })
  if (res.success) revalidatePath("/admin/schedule")
  return res
}

/**
 * WHY: Cập nhật ca làm việc.
 */
export async function updateShift(id: string, data: Partial<Shift>) {
  const res = await fetchApi<Shift>(`/scheduling/shifts/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  if (res.success) revalidatePath("/admin/schedule")
  return res
}

/**
 * WHY: Xóa ca làm việc.
 */
export async function deleteShift(id: string) {
  const res = await fetchApi<void>(`/scheduling/shifts/${id}`, {
    method: "DELETE",
  })
  if (res.success) revalidatePath("/admin/schedule")
  return res
}

/**
 * WHY: Lấy lịch làm việc trong một khoảng thời gian.
 */
export async function getStaffSchedules(startDate: string, endDate: string, staffId?: string) {
  let url = `/scheduling/schedules?start_date=${startDate}&end_date=${endDate}`
  if (staffId) url += `&staff_id=${staffId}`

  return await fetchApi<StaffSchedule[]>(url)
}

/**
 * WHY: Tạo một phân công lịch làm việc.
 */
export async function createStaffSchedule(data: CreateStaffSchedule) {
  const res = await fetchApi<StaffSchedule>("/scheduling/schedules", {
    method: "POST",
    body: JSON.stringify(data),
  })
  if (res.success) revalidatePath("/admin/schedule")
  return res
}

/**
 * WHY: Tạo lịch làm việc hàng loạt.
 */
export async function batchCreateStaffSchedules(data: BatchCreateSchedule) {
  const res = await fetchApi<StaffSchedule[]>("/scheduling/schedules/batch", {
    method: "POST",
    body: JSON.stringify(data),
  })
  if (res.success) revalidatePath("/admin/schedule")
  return res
}

/**
 * WHY: Cập nhật trạng thái của một lịch làm việc.
 */
export async function updateStaffScheduleStatus(id: string, status: ScheduleStatusType) {
  const res = await fetchApi<StaffSchedule>(`/scheduling/schedules/${id}/status?new_status=${status}`, {
    method: "PATCH",
  })
  if (res.success) revalidatePath("/admin/schedule")
  return res
}

/**
 * WHY: Xóa một lịch làm việc.
 */
export async function deleteStaffSchedule(id: string) {
  const res = await fetchApi<void>(`/scheduling/schedules/${id}`, {
    method: "DELETE",
  })
  if (res.success) revalidatePath("/admin/schedule")
  return res
}
