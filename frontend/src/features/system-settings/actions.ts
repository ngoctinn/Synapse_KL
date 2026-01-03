"use server"

import { API_BASE_URL } from "@/shared/api";
import { revalidatePath } from "next/cache";
import type { ExceptionDate, OperatingHour, OperationalSettings } from "./types";

const API_ENDPOINT = `${API_BASE_URL}/api/v1/settings/operational/`;

/**
 * Lấy cấu hình vận hành từ FastAPI Backend
 */
export async function getOperationalSettingsAction() {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 3600, // Cache trong 1 giờ. Sẽ được làm mới khi gọi revalidatePath
        tags: ["operational-settings"]
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch settings: ${response.statusText}`);
    }

    const data = await response.json();

    // Chuẩn hóa định dạng thời gian từ HH:mm:ss sang HH:mm để khớp với UI dropdown
    if (data.regular_operating_hours) {
      data.regular_operating_hours = data.regular_operating_hours.map((h: OperatingHour) => ({
        ...h,
        open_time: h.open_time?.slice(0, 5) || "08:00",
        close_time: h.close_time?.slice(0, 5) || "20:00",
      }));
    }

    if (data.exception_dates) {
      data.exception_dates = data.exception_dates.map((d: ExceptionDate) => {
        // Backend phải trả về ID - nếu thiếu là bug nghiêm trọng
        // Array index KHÔNG BAO GIỜ được dùng làm ID vì thay đổi khi xóa item
        if (!d.id) {
          console.warn(`Exception date missing ID: ${d.date}`);
          d.id = crypto.randomUUID();
        }
        return {
          ...d,
          id: d.id,
          open_time: d.open_time?.slice(0, 5) || undefined,
          close_time: d.close_time?.slice(0, 5) || undefined,
        };
      });
    }

    return data;
  } catch (error) {
    console.error("Error in getOperationalSettingsAction:", error);
    throw error;
  }
}

/**
 * Lưu cấu hình vận hành lên FastAPI Backend
 */
export async function updateOperationalSettingsAction(settings: OperationalSettings) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // Note: Auth token should be added here once frontend auth is ready
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
      console.error("Backend Error Details:", JSON.stringify(errorData, null, 2));
      // Nếu lỗi là mảng validation (Pydantic), in ra chi tiết
      if (Array.isArray(errorData.detail)) {
         throw new Error(JSON.stringify(errorData.detail));
      }
      throw new Error(errorData.detail || "Failed to update settings");
    }

    const data = await response.json();

    // Chuẩn hóa định dạng để khớp với Frontend (tương tự như hàm get)
    if (data.regular_operating_hours) {
      data.regular_operating_hours = data.regular_operating_hours.map((h: OperatingHour) => ({
        ...h,
        open_time: h.open_time?.slice(0, 5) || "08:00",
        close_time: h.close_time?.slice(0, 5) || "20:00",
      }));
    }

    if (data.exception_dates) {
      data.exception_dates = data.exception_dates.map((d: ExceptionDate) => ({
        ...d,
        id: d.id || crypto.randomUUID(),
        open_time: d.open_time?.slice(0, 5) || undefined,
        close_time: d.close_time?.slice(0, 5) || undefined,
      }));
    }

    // Refresh cache tại các trang liên quan sau khi cập nhật thành công
    revalidatePath("/dashboard/manager/settings");

    return { success: true, data };
  } catch (error) {
    console.error("Error in updateOperationalSettingsAction:", error);
    return { success: false, error: (error as Error).message };
  }
}
