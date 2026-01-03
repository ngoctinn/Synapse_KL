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
  CategoryCreateInput,
  CategoryUpdateInput,
  MaintenanceCreateInput,
  Resource,
  ResourceCreateInput,
  ResourceGroup,
  ResourceGroupCreateInput,
  ResourceMaintenance,
  Service,
  ServiceCategory,
  ServiceCreateInput,
  ServiceUpdateInput,
  ServiceWithDetails,
  Skill,
  SkillCreateInput,
  SkillUpdateInput,
} from "./types";

// ========== Skills Actions ==========
export async function getSkillsAction(): Promise<Skill[]> {
  const result = await apiClient.fetch<Skill[]>(API_ENDPOINTS.SKILLS, {
    cache: "no-store",
  });
  if (!result.success) throw new Error(result.error?.message || "Không thể tải danh sách kỹ năng");
  return result.data!;
}

export async function createSkillAction(data: SkillCreateInput): Promise<ActionResponse<Skill>> {
  const result = await apiClient.fetch<Skill>(API_ENDPOINTS.SKILLS, {
    method: "POST",
    body: JSON.stringify(data),
  });
  
  if (!result.success) {
    return createErrorResponse(result.error?.message || "Không thể tạo kỹ năng", result.error);
  }
  
  revalidatePath("/dashboard/manager/services", "page");
  return createSuccessResponse("Tạo kỹ năng thành công", result.data);
}

export async function updateSkillAction(id: string, data: SkillUpdateInput): Promise<ActionResponse> {
  const result = await apiClient.fetch(`${API_ENDPOINTS.SKILLS}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  
  if (!result.success) {
    return createErrorResponse(result.error?.message || "Không thể cập nhật kỹ năng", result.error);
  }
  
  revalidatePath("/dashboard/manager/services", "page");
  return createSuccessResponse("Cập nhật kỹ năng thành công");
}

export async function deleteSkillAction(id: string): Promise<void> {
  const result = await apiClient.fetch(`${API_ENDPOINTS.SKILLS}/${id}`, { method: "DELETE" });
  if (!result.success) throw new Error(result.error?.message || "Không thể xóa kỹ năng");
  revalidatePath("/dashboard/manager/services", "page");
}

// ========== Categories Actions ==========
export async function getCategoriesAction(): Promise<ServiceCategory[]> {
  const result = await apiClient.fetch<ServiceCategory[]>(API_ENDPOINTS.CATEGORIES, {
    cache: "no-store",
  });
  if (!result.success) throw new Error(result.error?.message || "Không thể tải danh sách danh mục");
  return result.data!;
}

export async function createCategoryAction(data: CategoryCreateInput): Promise<ActionResponse<ServiceCategory>> {
  const result = await apiClient.fetch<ServiceCategory>(API_ENDPOINTS.CATEGORIES, {
    method: "POST",
    body: JSON.stringify(data),
  });
  
  if (!result.success) {
    return createErrorResponse(result.error?.message || "Không thể tạo danh mục", result.error);
  }
  
  revalidatePath("/dashboard/manager/services", "page");
  return createSuccessResponse("Tạo danh mục thành công", result.data);
}

export async function updateCategoryAction(
  id: string,
  data: CategoryUpdateInput
): Promise<ActionResponse> {
  const result = await apiClient.fetch(`${API_ENDPOINTS.CATEGORIES}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  
  if (!result.success) {
    return createErrorResponse(result.error?.message || "Không thể cập nhật danh mục", result.error);
  }
  
  revalidatePath("/dashboard/manager/services", "page");
  return createSuccessResponse("Cập nhật danh mục thành công");
}

export async function reorderCategoriesAction(
  ids: string[]
): Promise<ServiceCategory[]> {
  const result = await apiClient.fetch<ServiceCategory[]>(`${API_ENDPOINTS.CATEGORIES}/reorder`, {
    method: "PUT",
    body: JSON.stringify({ ids }),
  });
  if (!result.success) throw new Error(result.error?.message || "Không thể sắp xếp lại danh mục");
  revalidatePath("/dashboard/manager/services", "page");
  return result.data!;
}

export async function deleteCategoryAction(id: string): Promise<void> {
  const result = await apiClient.fetch(`${API_ENDPOINTS.CATEGORIES}/${id}`, { method: "DELETE" });
  if (!result.success) throw new Error(result.error?.message || "Không thể xóa danh mục");
  revalidatePath("/dashboard/manager/services", "page");
}

// ========== Resource Groups Actions ==========
export async function getResourceGroupsAction(): Promise<ResourceGroup[]> {
  const result = await apiClient.fetch<ResourceGroup[]>(API_ENDPOINTS.RESOURCE_GROUPS, {
    cache: "no-store",
  });
  if (!result.success) throw new Error(result.error?.message || "Không thể tải danh sách nhóm tài nguyên");
  return result.data!;
}

export async function createResourceGroupAction(
  data: ResourceGroupCreateInput
): Promise<ActionResponse<ResourceGroup>> {
  const result = await apiClient.fetch<ResourceGroup>(API_ENDPOINTS.RESOURCE_GROUPS, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!result.success) {
    return createErrorResponse(result.error?.message || "Không thể tạo nhóm tài nguyên", result.error);
  }

  revalidatePath("/dashboard/manager/services", "page");
  return createSuccessResponse("Tạo nhóm tài nguyên thành công", result.data);
}

export async function deleteResourceGroupAction(id: string): Promise<void> {
  const result = await apiClient.fetch(`${API_ENDPOINTS.RESOURCE_GROUPS}/${id}`, {
    method: "DELETE",
  });
  if (!result.success) throw new Error(result.error?.message || "Không thể xóa nhóm tài nguyên");
  revalidatePath("/dashboard/manager/services", "page");
}

// ========== Resources Actions ==========
export async function getResourcesAction(
  groupId?: string
): Promise<Resource[]> {
  const endpoint = groupId
    ? `${API_ENDPOINTS.RESOURCES}?group_id=${groupId}`
    : API_ENDPOINTS.RESOURCES;
  const result = await apiClient.fetch<Resource[]>(endpoint, { cache: "no-store" });
  if (!result.success) throw new Error(result.error?.message || "Không thể tải danh sách tài nguyên");
  return result.data!;
}

export async function createResourceAction(data: ResourceCreateInput): Promise<ActionResponse<Resource>> {
  const result = await apiClient.fetch<Resource>(API_ENDPOINTS.RESOURCES, {
    method: "POST",
    body: JSON.stringify(data),
  });
  
  if (!result.success) {
    return createErrorResponse(result.error?.message || "Không thể tạo tài nguyên", result.error);
  }
  
  revalidatePath("/dashboard/manager/services", "page");
  return createSuccessResponse("Tạo tài nguyên thành công", result.data);
}

export async function deleteResourceAction(id: string): Promise<void> {
  const result = await apiClient.fetch(`${API_ENDPOINTS.RESOURCES}/${id}`, { method: "DELETE" });
  if (!result.success) throw new Error(result.error?.message || "Không thể xóa tài nguyên");
  revalidatePath("/dashboard/manager/services", "page");
}

export async function createMaintenanceAction(
  resourceId: string,
  data: MaintenanceCreateInput
): Promise<ResourceMaintenance> {
  const result = await apiClient.fetch<ResourceMaintenance>(
    `${API_ENDPOINTS.RESOURCES}/${resourceId}/maintenance`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  if (!result.success) throw new Error(result.error?.message || "Không thể tạo bảo trì");
  revalidatePath("/dashboard/manager/services", "page");
  return result.data!;
}

// ========== Services Actions ==========
export async function getServicesAction(
  categoryId?: string,
  isActive?: boolean,
  page: number = 1,
  limit: number = 1000
): Promise<{ data: Service[]; total: number; page: number; limit: number }> {
  const params = new URLSearchParams();
  if (categoryId) params.append("category_id", categoryId);
  if (isActive !== undefined) params.append("is_active", String(isActive));
  params.append("page", String(page));
  params.append("limit", String(limit));

  const endpoint = `${API_ENDPOINTS.SERVICES}?${params.toString()}`;
  const result = await apiClient.fetch<{ data: Service[]; total: number; page: number; limit: number } | Service[]>(endpoint, { cache: "no-store" });
  
  if (!result.success) throw new Error(result.error?.message || "Không thể tải danh sách dịch vụ");

  // Backend trả về ServiceListResponse format: { data, total, page, limit }
  if (typeof result.data === "object" && "data" in result.data && typeof result.data.total === "number") {
    return result.data;
  }

  // Fallback nếu backend trả array trực tiếp (backward compatibility)
  const arrayData = Array.isArray(result.data) ? result.data : [];
  return {
    data: arrayData,
    total: arrayData.length,
    page: 1,
    limit: 1000,
  };
}

export async function getServiceByIdAction(
  id: string
): Promise<ServiceWithDetails> {
  const result = await apiClient.fetch<ServiceWithDetails>(`${API_ENDPOINTS.SERVICES}/${id}`, {
    cache: "no-store",
  });
  if (!result.success) throw new Error(result.error?.message || "Không thể tải thông tin dịch vụ");
  return result.data!;
}

const UNCATEGORIZED = "uncategorized";

export async function createServiceAction(data: ServiceCreateInput): Promise<ActionResponse<Service>> {
  // Loại bỏ magic string "uncategorized" - chỉ gửi category_id thực tế
  const payload = {
    ...data,
    category_id:
      data.category_id && data.category_id !== UNCATEGORIZED
        ? data.category_id
        : undefined,
    image_url: data.image_url || undefined,
    description: data.description || undefined,
  };

  const result = await apiClient.fetch<Service>(API_ENDPOINTS.SERVICES, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  
  if (!result.success) {
    return createErrorResponse(result.error?.message || "Không thể tạo dịch vụ", result.error);
  }
  
  revalidatePath("/dashboard/manager/services", "page");
  return createSuccessResponse("Tạo dịch vụ thành công", result.data);
}

export async function updateServiceAction(
  id: string,
  data: ServiceUpdateInput
): Promise<ActionResponse<Service>> {
  const payload = {
    ...data,
    category_id:
      data.category_id && data.category_id !== UNCATEGORIZED
        ? data.category_id
        : null,
    image_url: data.image_url || null,
    description: data.description || null,
  };

  const result = await apiClient.fetch<Service>(`${API_ENDPOINTS.SERVICES}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  
  if (!result.success) {
    return createErrorResponse(result.error?.message || "Không thể cập nhật dịch vụ", result.error);
  }
  
  revalidatePath("/dashboard/manager/services", "page");
  return createSuccessResponse("Cập nhật dịch vụ thành công", result.data);
}

export async function toggleServiceStatusAction(id: string): Promise<Service> {
  const result = await apiClient.fetch<Service>(`${API_ENDPOINTS.SERVICES}/${id}/toggle-status`, {
    method: "PATCH",
  });
  if (!result.success) throw new Error(result.error?.message || "Không thể thay đổi trạng thái");
  revalidatePath("/dashboard/manager/services", "page");
  return result.data!;
}

export async function deleteServiceAction(id: string): Promise<void> {
  const result = await apiClient.fetch(`${API_ENDPOINTS.SERVICES}/${id}`, { method: "DELETE" });
  if (!result.success) throw new Error(result.error?.message || "Không thể xóa dịch vụ");
  revalidatePath("/dashboard/manager/services", "page");
}
