"use server";

import {
  apiClient,
  API_ENDPOINTS,
  createSuccessResponse,
  createErrorResponse,
  type ActionResponse,
} from "@/shared/api";
import { revalidatePath } from "next/cache";
import type {
    Shift,
    ShiftCreateInput,
    ShiftUpdateInput,
    StaffInviteInput,
    StaffProfileCreateInput,
    StaffProfileUpdateInput,
    StaffProfileWithSkills,
    StaffScheduleBatchCreateInput,
    StaffScheduleWithDetails,
    StaffSkillsUpdate,
} from "./types";

// ========== Staff Actions ==========

export async function inviteStaffAction(data: StaffInviteInput): Promise<ActionResponse> {
  const result = await apiClient.fetch(API_ENDPOINTS.STAFF_INVITE, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!result.success) {
    return createErrorResponse(result.error?.message || "Không thể gửi lời mời", result.error);
  }

  revalidatePath("/dashboard/manager/staff");
  return createSuccessResponse(`Đã gửi lời mời đến ${data.email}`);
}

export async function getStaffAction(): Promise<StaffProfileWithSkills[]> {
  const result = await apiClient.fetch<StaffProfileWithSkills[]>(API_ENDPOINTS.STAFF, {
    next: { revalidate: 60, tags: ["staff"] },
  });
  if (!result.success) throw new Error(result.error?.message || "Không thể tải danh sách nhân viên");
  return result.data!;
}

export async function createStaffProfileAction(data: StaffProfileCreateInput): Promise<ActionResponse<StaffProfileWithSkills>> {
  const result = await apiClient.fetch<StaffProfileWithSkills>(API_ENDPOINTS.STAFF, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!result.success) {
    return createErrorResponse(result.error?.message || "Không thể tạo hồ sơ nhân viên", result.error);
  }

  revalidatePath("/dashboard/manager/staff");
  return createSuccessResponse("Tạo hồ sơ nhân viên thành công", result.data);
}

export async function updateStaffProfileAction(id: string, data: StaffProfileUpdateInput): Promise<ActionResponse> {
  const result = await apiClient.fetch(`${API_ENDPOINTS.STAFF}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!result.success) {
    return createErrorResponse(result.error?.message || "Không thể cập nhật hồ sơ", result.error);
  }

  revalidatePath("/dashboard/manager/staff");
  return createSuccessResponse("Cập nhật hồ sơ thành công");
}

export async function updateStaffSkillsAction(id: string, data: StaffSkillsUpdate): Promise<ActionResponse> {
  const result = await apiClient.fetch(`${API_ENDPOINTS.STAFF}/${id}/skills`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!result.success) {
    return createErrorResponse(result.error?.message || "Không thể cập nhật kỹ năng", result.error);
  }

  revalidatePath("/dashboard/manager/staff");
  return createSuccessResponse("Cập nhật kỹ năng thành công");
}

export async function updateStaffWithSkillsAction(
  id: string,
  profileData: StaffProfileUpdateInput,
  skillsData: StaffSkillsUpdate
): Promise<ActionResponse> {
  // Chạy tuần tự vì nếu profile update fail thì skills không nên update
  // Profile phải tồn tại/hợp lệ trước khi update skills
  
  const profileResult = await apiClient.fetch(`${API_ENDPOINTS.STAFF}/${id}`, {
    method: "PUT",
    body: JSON.stringify(profileData),
  });

  if (!profileResult.success) {
    return createErrorResponse(
      profileResult.error?.message || "Lỗi cập nhật thông tin chung",
      profileResult.error
    );
  }

  const skillsResult = await apiClient.fetch(`${API_ENDPOINTS.STAFF}/${id}/skills`, {
    method: "PUT",
    body: JSON.stringify(skillsData),
  });

  if (!skillsResult.success) {
    // Profile đã update nhưng skills fail - vẫn return success với warning
    return createSuccessResponse(
      `Thông tin đã lưu, nhưng lỗi kỹ năng: ${skillsResult.error?.message || "Unknown"}`
    );
  }

  revalidatePath("/dashboard/manager/staff");
  return createSuccessResponse("Cập nhật nhân viên thành công");
}

// ========== Scheduling Actions ==========

export async function getShiftsAction(): Promise<Shift[]> {
  const result = await apiClient.fetch<Shift[]>(API_ENDPOINTS.SHIFTS, {
    next: { revalidate: 600, tags: ["shifts"] },
  });
  if (!result.success) throw new Error(result.error?.message || "Không thể tải danh sách ca làm việc");
  return result.data!;
}

export async function createShiftAction(data: ShiftCreateInput): Promise<ActionResponse<Shift>> {
  const result = await apiClient.fetch<Shift>(API_ENDPOINTS.SHIFTS, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!result.success) {
    return createErrorResponse(result.error?.message || "Không thể tạo ca làm việc", result.error);
  }

  revalidatePath("/dashboard/manager/staff");
  return createSuccessResponse("Tạo ca làm việc thành công", result.data);
}

export async function updateShiftAction(id: string, data: ShiftUpdateInput): Promise<ActionResponse> {
  const result = await apiClient.fetch(`${API_ENDPOINTS.SHIFTS}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!result.success) {
    return createErrorResponse(result.error?.message || "Không thể cập nhật ca làm việc", result.error);
  }

  revalidatePath("/dashboard/manager/staff");
  return createSuccessResponse("Cập nhật ca làm việc thành công");
}

export async function getSchedulesAction(startDate: string, endDate: string, staffId?: string): Promise<StaffScheduleWithDetails[]> {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
  });
  if (staffId) params.append("staff_id", staffId);

  const endpoint = `${API_ENDPOINTS.SCHEDULES}?${params.toString()}`;
  const result = await apiClient.fetch<StaffScheduleWithDetails[]>(endpoint, {
    cache: "no-store",
  });
  
  if (!result.success) throw new Error(result.error?.message || "Không thể tải lịch làm việc");
  return result.data!;
}

export async function batchCreateSchedulesAction(data: StaffScheduleBatchCreateInput): Promise<ActionResponse> {
  const result = await apiClient.fetch(`${API_ENDPOINTS.SCHEDULES}/batch`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!result.success) {
    return createErrorResponse(result.error?.message || "Không thể phân ca làm việc", result.error);
  }

  revalidatePath("/dashboard/manager/staff");
  return createSuccessResponse("Phân ca làm việc thành công");
}

export async function bulkCreateSchedulesAction(items: StaffScheduleBatchCreateInput[]) {
  // Chạy parallel requests - server có low latency đến backend
  const results = await Promise.allSettled(
    items.map(item =>
      apiClient.fetch<{ id: string }[]>(`${API_ENDPOINTS.SCHEDULES}/batch`, {
        method: "POST",
        body: JSON.stringify(item),
      })
    )
  );

  const successfulResults = results
    .filter((r): r is PromiseFulfilledResult<{ success: true; data: { id: string }[] }> => 
      r.status === "fulfilled" && r.value.success
    )
    .map(r => r.value.data!)
    .flat();

  const failedCount = results.filter(r => r.status === "rejected" || !("success" in r.value) || !r.value.success).length;

  const createdIds = successfulResults.map(s => s.id).filter(Boolean);

  revalidatePath("/dashboard/manager/staff");

  if (failedCount === 0) {
    return {
      success: true,
      message: `Đã phân ca cho ${items.length} nhân viên`,
      createdIds,
    };
  }

  if (createdIds.length === 0) {
    return {
      success: false,
      message: `Không thể phân ca cho bất kỳ nhân viên nào (${failedCount} thất bại)`,
      createdIds: [],
    };
  }

  return {
    success: true,
    message: `Đã phân ca cho ${createdIds.length}/${items.length} nhân viên (${failedCount} thất bại)`,
    createdIds,
  };
}

export async function deleteScheduleAction(id: string): Promise<ActionResponse> {
  const result = await apiClient.fetch(`${API_ENDPOINTS.SCHEDULES}/${id}`, {
    method: "DELETE",
  });

  if (!result.success) {
    return createErrorResponse(result.error?.message || "Không thể xóa lịch làm việc", result.error);
  }

  revalidatePath("/dashboard/manager/staff");
  return createSuccessResponse("Đã xóa lịch làm việc");
}

export async function deleteSchedulesBatchAction(ids: string[]): Promise<ActionResponse> {
  // Dùng allSettled để tiếp tục xóa các items khác nếu 1 item fail
  const results = await Promise.allSettled(
    ids.map(id =>
      apiClient.fetch(`${API_ENDPOINTS.SCHEDULES}/${id}`, {
        method: "DELETE",
      })
    )
  );

  const successCount = results.filter(
    r => r.status === "fulfilled" && r.value.success
  ).length;
  const failedCount = results.length - successCount;

  revalidatePath("/dashboard/manager/staff");

  if (failedCount === 0) {
    return createSuccessResponse(`Đã xóa ${successCount} lịch làm việc`);
  }

  if (successCount === 0) {
    return createErrorResponse(`Không thể xóa bất kỳ lịch nào (${failedCount} thất bại)`);
  }

  return createSuccessResponse(
    `Đã xóa ${successCount}/${ids.length} lịch làm việc (${failedCount} thất bại)`
  );
}

