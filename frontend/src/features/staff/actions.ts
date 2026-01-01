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

export async function updateStaffWithSkillsAction(
  id: string,
  profileData: StaffProfileUpdateInput,
  skillsData: StaffSkillsUpdate
) {
  try {
    // Run sequentially to ensure profile exists/is valid before skills, though usually parallel is fine for updates.
    // Sequential better for error reporting order.

    // 1. Update Profile
    const profileRes = await fetch(`${API_BASE_URL}${STAFF_PATH}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData),
    });

    if (!profileRes.ok) {
       const err = await profileRes.json() as APIErrorResponse;
       return { success: false, message: err.detail || "Lỗi cập nhật thông tin chung" };
    }

    // 2. Update Skills
    const skillsRes = await fetch(`${API_BASE_URL}${STAFF_PATH}/${id}/skills`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(skillsData),
    });

    if (!skillsRes.ok) {
       // Profile updated but skills failed.
       const err = await skillsRes.json() as APIErrorResponse;
       return { success: true, message: `Thông tin đã lưu, nhưng lỗi kỹ năng: ${err.detail}` };
    }

    revalidatePath("/dashboard/manager/staff");
    return { success: true, message: "Cập nhật nhân viên thành công" };

  } catch (error: any) {
    console.error("Update Staff Error:", error);
    return { success: false, message: "Lỗi hệ thống khi cập nhật" };
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

export async function bulkCreateSchedulesAction(items: StaffScheduleBatchCreateInput[]) {
  try {
    // Parallelize requests on the server side (low latency to backend)
    const results = await Promise.all(
      items.map(item =>
        fetch(`${API_BASE_URL}${SCHEDULING_PATH}/schedules/batch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }).then(async res => {
          if (!res.ok) {
            const err = (await res.json()) as APIErrorResponse;
            throw new Error(err.detail || `Lỗi với nhân viên ${item.staff_id}`);
          }
          return res;
        })
      )
    );

    revalidatePath("/dashboard/manager/staff");
    return { success: true, message: `Đã phân ca cho ${results.length} nhân viên` };
  } catch (error: any) {
    console.error("Bulk Create Schedules Error:", error);
    return { success: false, message: error.message || "Lỗi khi xử lý hàng loạt" };
  }
}
