"use server"

import { fetchApi } from "@/shared/lib/api-client"
import { revalidatePath } from "next/cache"

import type {
  ExceptionDateValues,
  OperatingDay,
  OperationalSettingsApi,
  OperationalSettingsFormValues,
} from "../model/schemas"

const ENDPOINT = "/api/v1/settings/operational/"

// === Transform Functions ===

// WHY: Chuyển đổi từ UI format (multi-slot per day) sang API format (flat array)
function transformToApi(formData: OperationalSettingsFormValues): OperationalSettingsApi {
  const regularHours = formData.days.flatMap((day: OperatingDay) => {
    if (!day.isEnabled || day.slots.length === 0) {
      return [{
        day_of_week: day.dayOfWeek,
        open_time: "00:00:00",
        close_time: "00:00:00",
        is_closed: true,
        label: null,
      }]
    }

    return day.slots.map((slot) => ({
      day_of_week: day.dayOfWeek,
      open_time: slot.openTime.length === 5 ? `${slot.openTime}:00` : slot.openTime,
      close_time: slot.closeTime.length === 5 ? `${slot.closeTime}:00` : slot.closeTime,
      is_closed: false,
      label: null,
    }))
  })

  const exceptionDates = formData.exceptionDates.map((ex: ExceptionDateValues) => ({
    date: ex.date.toISOString().split("T")[0],
    reason: ex.reason || null,
    is_closed: ex.isClosed,
    // WHY: Gửi 00:00:00 khi đóng cửa để tránh lỗi sort NoneType ở backend (nếu có)
    open_time: ex.openTime
      ? (ex.openTime.length === 5 ? `${ex.openTime}:00` : ex.openTime)
      : "00:00:00",
    close_time: ex.closeTime
      ? (ex.closeTime.length === 5 ? `${ex.closeTime}:00` : ex.closeTime)
      : "00:00:00",
  }))

  return { regular_operating_hours: regularHours, exception_dates: exceptionDates }
}

// WHY: Chuyển đổi từ API format (flat array) sang UI format (grouped by day)
function transformFromApi(apiData: OperationalSettingsApi): OperationalSettingsFormValues {
  const daysMap = new Map<number, OperatingDay>()

  // Initialize all 7 days
  for (let i = 0; i < 7; i++) {
    daysMap.set(i, { dayOfWeek: i, isEnabled: false, slots: [] })
  }

  // Group slots by day_of_week
  for (const hour of apiData.regular_operating_hours) {
    const day = daysMap.get(hour.day_of_week)!

    if (hour.is_closed) {
      day.isEnabled = false
    } else {
      day.isEnabled = true
      day.slots.push({
        openTime: hour.open_time.slice(0, 5), // HH:MM:SS -> HH:MM
        closeTime: hour.close_time.slice(0, 5),
      })
    }
  }

  const exceptionDates = apiData.exception_dates.map((ex) => ({
    date: new Date(ex.date),
    reason: ex.reason || undefined,
    isClosed: ex.is_closed,
    openTime: ex.open_time?.slice(0, 5),
    closeTime: ex.close_time?.slice(0, 5),
  }))

  return {
    days: Array.from(daysMap.values()).sort((a, b) => a.dayOfWeek - b.dayOfWeek),
    exceptionDates,
  }
}

// === Actions ===

export async function getOperationalSettings() {
  const result = await fetchApi<OperationalSettingsApi>(ENDPOINT)

  if (!result.success) {
    return { success: false as const, error: result.error }
  }

  return { success: true as const, data: transformFromApi(result.data) }
}

export async function updateOperationalSettings(formData: OperationalSettingsFormValues) {
  const apiPayload = transformToApi(formData)
  console.log("Sending payload:", JSON.stringify(apiPayload, null, 2))

  const result = await fetchApi<OperationalSettingsApi>(ENDPOINT, {
    method: "PUT",
    body: JSON.stringify(apiPayload),
  })

  if (!result.success) {
    return { success: false as const, error: result.error }
  }

  revalidatePath("/admin/settings")
  return { success: true as const, data: transformFromApi(result.data) }
}
