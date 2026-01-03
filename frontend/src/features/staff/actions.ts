"use server";

import {
  apiClient,
  createErrorResponse,
  createSuccessResponse,
  type ActionResponse,
} from "@/shared/api";
import { revalidateTag } from "next/cache";

import { STAFF_CACHE_TAGS, STAFF_ENDPOINTS } from "./api/endpoints";
import type {
  Shift,
  ShiftCreateInput,
  ShiftUpdateInput,
  StaffInviteInput,
  StaffProfileCreateInput,
  StaffProfileUpdateInput,
  StaffProfileWithSkills,
  StaffScheduleBatchCreateInput,
  StaffSkillsUpdate,
} from "./types";

export async function inviteStaffAction(
  data: StaffInviteInput
): Promise<ActionResponse> {
  const result = await apiClient.fetch(STAFF_ENDPOINTS.STAFF_INVITE, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!result.success) {
    return createErrorResponse(
      result.error?.message || "Không thể gửi lời mời",
      result.error
    );
  }

  revalidateTag(STAFF_CACHE_TAGS.STAFF, "max");
  return createSuccessResponse(`Đã gửi lời mời đến ${data.email}`);
}

export async function createStaffProfileAction(
  data: StaffProfileCreateInput
): Promise<ActionResponse<StaffProfileWithSkills>> {
  const result = await apiClient.fetch<StaffProfileWithSkills>(
    STAFF_ENDPOINTS.STAFF,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  if (!result.success) {
    return createErrorResponse(
      result.error?.message || "Không thể tạo hồ sơ nhân viên",
      result.error
    );
  }

  revalidateTag(STAFF_CACHE_TAGS.STAFF, "max");
  return createSuccessResponse("Tạo hồ sơ nhân viên thành công", result.data);
}

export async function updateStaffProfileAction(
  id: string,
  data: StaffProfileUpdateInput
): Promise<ActionResponse> {
  const result = await apiClient.fetch(STAFF_ENDPOINTS.STAFF_BY_ID(id), {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!result.success) {
    return createErrorResponse(
      result.error?.message || "Không thể cập nhật hồ sơ",
      result.error
    );
  }

  revalidateTag(STAFF_CACHE_TAGS.STAFF, "max");
  return createSuccessResponse("Cập nhật hồ sơ thành công");
}

export async function updateStaffSkillsAction(
  id: string,
  data: StaffSkillsUpdate
): Promise<ActionResponse> {
  const result = await apiClient.fetch(STAFF_ENDPOINTS.STAFF_SKILLS(id), {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!result.success) {
    return createErrorResponse(
      result.error?.message || "Không thể cập nhật kỹ năng",
      result.error
    );
  }

  revalidateTag(STAFF_CACHE_TAGS.STAFF, "max");
  return createSuccessResponse("Cập nhật kỹ năng thành công");
}

export async function updateStaffWithSkillsAction(
  id: string,
  profileData: StaffProfileUpdateInput,
  skillsData: StaffSkillsUpdate
): Promise<ActionResponse> {
  const profileResult = await apiClient.fetch(STAFF_ENDPOINTS.STAFF_BY_ID(id), {
    method: "PUT",
    body: JSON.stringify(profileData),
  });

  if (!profileResult.success) {
    return createErrorResponse(
      profileResult.error?.message || "Lỗi cập nhật thông tin chung",
      profileResult.error
    );
  }

  const skillsResult = await apiClient.fetch(STAFF_ENDPOINTS.STAFF_SKILLS(id), {
    method: "PUT",
    body: JSON.stringify(skillsData),
  });

  if (!skillsResult.success) {
    return createSuccessResponse(
      `Thông tin đã lưu, nhưng lỗi kỹ năng: ${skillsResult.error?.message || "Unknown"}`
    );
  }

  revalidateTag(STAFF_CACHE_TAGS.STAFF, "max");
  return createSuccessResponse("Cập nhật nhân viên thành công");
}

export async function createShiftAction(
  data: ShiftCreateInput
): Promise<ActionResponse<Shift>> {
  const result = await apiClient.fetch<Shift>(STAFF_ENDPOINTS.SHIFTS, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!result.success) {
    return createErrorResponse(
      result.error?.message || "Không thể tạo ca làm việc",
      result.error
    );
  }

  revalidateTag(STAFF_CACHE_TAGS.SHIFTS, "max");
  return createSuccessResponse("Tạo ca làm việc thành công", result.data);
}

export async function updateShiftAction(
  id: string,
  data: ShiftUpdateInput
): Promise<ActionResponse> {
  const result = await apiClient.fetch(STAFF_ENDPOINTS.SHIFT_BY_ID(id), {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!result.success) {
    return createErrorResponse(
      result.error?.message || "Không thể cập nhật ca làm việc",
      result.error
    );
  }

  revalidateTag(STAFF_CACHE_TAGS.SHIFTS, "max");
  return createSuccessResponse("Cập nhật ca làm việc thành công");
}

export async function batchCreateSchedulesAction(
  data: StaffScheduleBatchCreateInput
): Promise<ActionResponse> {
  const result = await apiClient.fetch(STAFF_ENDPOINTS.SCHEDULES_BATCH, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!result.success) {
    return createErrorResponse(
      result.error?.message || "Không thể phân ca làm việc",
      result.error
    );
  }

  revalidateTag(STAFF_CACHE_TAGS.SCHEDULES, "max");
  return createSuccessResponse("Phân ca làm việc thành công");
}

export async function bulkCreateSchedulesAction(
  items: StaffScheduleBatchCreateInput[]
) {
  const results = await Promise.allSettled(
    items.map((item) =>
      apiClient.fetch<{ id: string }[]>(STAFF_ENDPOINTS.SCHEDULES_BATCH, {
        method: "POST",
        body: JSON.stringify(item),
      })
    )
  );

  const successfulResults = results
    .filter(
      (r): r is PromiseFulfilledResult<{ success: true; data: { id: string }[] }> =>
        r.status === "fulfilled" && r.value.success
    )
    .map((r) => r.value.data!)
    .flat();

  const failedCount = results.filter(
    (r) => r.status === "rejected" || !("success" in r.value) || !r.value.success
  ).length;

  const createdIds = successfulResults.map((s) => s.id).filter(Boolean);

  revalidateTag(STAFF_CACHE_TAGS.SCHEDULES, "max");

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
  const result = await apiClient.fetch(STAFF_ENDPOINTS.SCHEDULE_BY_ID(id), {
    method: "DELETE",
  });

  if (!result.success) {
    return createErrorResponse(
      result.error?.message || "Không thể xóa lịch làm việc",
      result.error
    );
  }

  revalidateTag(STAFF_CACHE_TAGS.SCHEDULES, "max");
  return createSuccessResponse("Đã xóa lịch làm việc");
}

export async function deleteSchedulesBatchAction(
  ids: string[]
): Promise<ActionResponse> {
  const results = await Promise.allSettled(
    ids.map((id) =>
      apiClient.fetch(STAFF_ENDPOINTS.SCHEDULE_BY_ID(id), {
        method: "DELETE",
      })
    )
  );

  const successCount = results.filter(
    (r) => r.status === "fulfilled" && r.value.success
  ).length;
  const failedCount = results.length - successCount;

  revalidateTag(STAFF_CACHE_TAGS.SCHEDULES, "max");

  if (failedCount === 0) {
    return createSuccessResponse(`Đã xóa ${successCount} lịch làm việc`);
  }

  if (successCount === 0) {
    return createErrorResponse(
      `Không thể xóa bất kỳ lịch nào (${failedCount} thất bại)`
    );
  }

  return createSuccessResponse(
    `Đã xóa ${successCount}/${ids.length} lịch làm việc (${failedCount} thất bại)`
  );
}
