"use server";

import { API_BASE_URL } from "@/shared/api";
import { revalidatePath } from "next/cache";
import type {
  Shift,
  ShiftCreateInput,
  StaffProfileCreateInput,
  StaffProfileUpdateInput,
  StaffProfileWithSkills,
  StaffScheduleBatchCreateInput,
  StaffScheduleWithDetails,
  StaffSkillsUpdate,
} from "./types";

const STAFF_PATH = "/api/v1/staff";
const SCHEDULING_PATH = "/api/v1/scheduling";

interface APIErrorResponse {
  detail?: string;
}

// ========== Staff Actions ==========

export async function getStaffAction(): Promise<StaffProfileWithSkills[]> {
  const res = await fetch(`${API_BASE_URL}${STAFF_PATH}`, {
    next: { revalidate: 60, tags: ["staff"] },
  });
  if (!res.ok) throw new Error("Không thể tải danh sách nhân viên");
  return res.json();
}

export async function createStaffProfileAction(data: StaffProfileCreateInput) {
  try {
    const res = await fetch(`${API_BASE_URL}${STAFF_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = (await res.json()) as APIErrorResponse;
      return { success: false, message: err.detail || "Không thể tạo hồ sơ nhân viên" };
    }
    revalidatePath("/dashboard/manager/staff");
    return { success: true, message: "Tạo hồ sơ nhân viên thành công" };
  } catch (e) {
    return { success: false, message: "Lỗi kết nối máy chủ" };
  }
}

export async function updateStaffProfileAction(id: string, data: StaffProfileUpdateInput) {
  try {
    const res = await fetch(`${API_BASE_URL}${STAFF_PATH}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = (await res.json()) as APIErrorResponse;
      return { success: false, message: err.detail || "Không thể cập nhật hồ sơ" };
    }
    revalidatePath("/dashboard/manager/staff");
    return { success: true, message: "Cập nhật hồ sơ thành công" };
  } catch (e) {
    return { success: false, message: "Lỗi kết nối máy chủ" };
  }
}

export async function updateStaffSkillsAction(id: string, data: StaffSkillsUpdate) {
  try {
    const res = await fetch(`${API_BASE_URL}${STAFF_PATH}/${id}/skills`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = (await res.json()) as APIErrorResponse;
      return { success: false, message: err.detail || "Không thể cập nhật kỹ năng" };
    }
    revalidatePath("/dashboard/manager/staff");
    return { success: true, message: "Cập nhật kỹ năng thành công" };
  } catch (error) {
    return { success: false, message: "Lỗi kết nối máy chủ" };
  }
}

// ========== Scheduling Actions ==========

export async function getShiftsAction(): Promise<Shift[]> {
  const res = await fetch(`${API_BASE_URL}${SCHEDULING_PATH}/shifts`, {
    next: { revalidate: 600, tags: ["shifts"] },
  });
  if (!res.ok) throw new Error("Không thể tải danh sách ca làm việc");
  return res.json();
}

export async function createShiftAction(data: ShiftCreateInput) {
  try {
    const res = await fetch(`${API_BASE_URL}${SCHEDULING_PATH}/shifts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = (await res.json()) as APIErrorResponse;
      return { success: false, message: err.detail || "Thao tác thất bại" };
    }
    revalidatePath("/dashboard/manager/staff");
    return { success: true, message: "Tạo ca làm việc thành công" };
  } catch (e) {
    return { success: false, message: "Lỗi kết nối máy chủ" };
  }
}

export async function getSchedulesAction(startDate: string, endDate: string, staffId?: string): Promise<StaffScheduleWithDetails[]> {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
  });
  if (staffId) params.append("staff_id", staffId);

  const res = await fetch(`${API_BASE_URL}${SCHEDULING_PATH}/schedules?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Không thể tải lịch làm việc");
  return res.json();
}

export async function batchCreateSchedulesAction(data: StaffScheduleBatchCreateInput) {
  try {
    const res = await fetch(`${API_BASE_URL}${SCHEDULING_PATH}/schedules/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = (await res.json()) as APIErrorResponse;
      return { success: false, message: err.detail || "Không thể phân ca làm việc" };
    }
    revalidatePath("/dashboard/manager/staff");
    return { success: true, message: "Phân ca làm việc thành công" };
  } catch (error) {
    console.error("Batch Create Schedules Error:", error);
    return { success: false, message: "Lỗi kết nối máy chủ" };
  }
}
