"use server"

import { revalidatePath } from "next/cache";
import { DayOfWeek, OperationalSettings } from "./types";

/**
 * MOCK DATABASE TRÊN SERVER
 * Đây là nơi lưu trữ dữ liệu tạm thời để kiểm thử luồng Server Actions.
 * Sau này sẽ được thay thế bằng các lệnh gọi tới FastAPI Service.
 */
let mockOperationalSettings: OperationalSettings = {
  regular_operating_hours: ([1, 2, 3, 4, 5, 6, 0] as DayOfWeek[]).map((day) => ({
    day_of_week: day,
    open_time: "08:00",
    close_time: "20:00",
    is_closed: false,
  })),
  exception_dates: [],
};

/**
 * Lấy cấu hình vận hành từ Server
 */
export async function getOperationalSettingsAction() {
  // Mô phỏng độ trễ mạng
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockOperationalSettings;
}

/**
 * Lưu cấu hình vận hành lên Server
 */
export async function updateOperationalSettingsAction(settings: OperationalSettings) {
  // Mô phỏng độ trễ xử lý
  await new Promise((resolve) => setTimeout(resolve, 500));

  mockOperationalSettings = {
    ...settings,
    // Đảm bảo dữ liệu được chuẩn hóa trước khi lưu
    exception_dates: settings.exception_dates.sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  };

  revalidatePath("/dashboard/manager/settings"); // Refresh cache tại trang cấu hình
  return { success: true, data: mockOperationalSettings };
}
