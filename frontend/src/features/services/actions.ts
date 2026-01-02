"use server";

import { API_BASE_URL } from "@/shared/api";
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

const SERVICES_PATH = "/api/v1/services";
const SKILLS_PATH = "/api/v1/skills";
const CATEGORIES_PATH = "/api/v1/categories";
const RESOURCES_PATH = "/api/v1/resources";

// --- Helper Wrapper ---
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; message?: string; data?: T }> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        message: err.detail || `Lỗi ${res.status}: ${res.statusText}`,
      };
    }

    // Handle 204 No Content
    if (res.status === 204) {
      return { success: true };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error(`Fetch Error [${endpoint}]:`, error);
    return { success: false, message: "Lỗi kết nối máy chủ" };
  }
}

// ========== Skills Actions ==========
export async function getSkillsAction(): Promise<Skill[]> {
  const res = await fetch(`${API_BASE_URL}${SKILLS_PATH}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Không thể tải danh sách kỹ năng");
  return res.json();
}

export async function createSkillAction(data: SkillCreateInput) {
  const res = await fetchAPI<Skill>(SKILLS_PATH, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (res.success) revalidatePath("/dashboard/manager/services", "page");
  return {
    ...res,
    message: res.success ? "Tạo kỹ năng thành công" : res.message,
  };
}

export async function updateSkillAction(id: string, data: SkillUpdateInput) {
  const res = await fetchAPI(`${SKILLS_PATH}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (res.success) revalidatePath("/dashboard/manager/services", "page");
  return {
    ...res,
    message: res.success ? "Cập nhật kỹ năng thành công" : res.message,
  };
}

export async function deleteSkillAction(id: string): Promise<void> {
  const res = await fetchAPI(`${SKILLS_PATH}/${id}`, { method: "DELETE" });
  if (!res.success) throw new Error(res.message);
  revalidatePath("/dashboard/manager/services", "page");
}

// ========== Categories Actions ==========
export async function getCategoriesAction(): Promise<ServiceCategory[]> {
  const res = await fetch(`${API_BASE_URL}${CATEGORIES_PATH}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Không thể tải danh sách danh mục");
  return res.json();
}

export async function createCategoryAction(data: CategoryCreateInput) {
  const res = await fetchAPI<ServiceCategory>(CATEGORIES_PATH, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (res.success) revalidatePath("/dashboard/manager/services", "page");
  return {
    ...res,
    message: res.success ? "Tạo danh mục thành công" : res.message,
  };
}

export async function updateCategoryAction(
  id: string,
  data: CategoryUpdateInput
) {
  const res = await fetchAPI(`${CATEGORIES_PATH}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (res.success) revalidatePath("/dashboard/manager/services", "page");
  return {
    ...res,
    message: res.success ? "Cập nhật danh mục thành công" : res.message,
  };
}

export async function reorderCategoriesAction(
  ids: string[]
): Promise<ServiceCategory[]> {
  const res = await fetchAPI<ServiceCategory[]>(`${CATEGORIES_PATH}/reorder`, {
    method: "PUT",
    body: JSON.stringify({ ids }),
  });
  if (!res.success) throw new Error(res.message);
  revalidatePath("/dashboard/manager/services", "page");
  return res.data!;
}

export async function deleteCategoryAction(id: string): Promise<void> {
  const res = await fetchAPI(`${CATEGORIES_PATH}/${id}`, { method: "DELETE" });
  if (!res.success) throw new Error(res.message);
  revalidatePath("/dashboard/manager/services", "page");
}

// ========== Resource Groups Actions ==========
export async function getResourceGroupsAction(): Promise<ResourceGroup[]> {
  const res = await fetch(`${API_BASE_URL}${RESOURCES_PATH}/groups`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Không thể tải danh sách nhóm tài nguyên");
  return res.json();
}

export async function createResourceGroupAction(
  data: ResourceGroupCreateInput
) {
  const res = await fetchAPI(`${RESOURCES_PATH}/groups`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (res.success) revalidatePath("/dashboard/manager/services", "page");
  return {
    ...res,
    message: res.success ? "Tạo nhóm tài nguyên thành công" : res.message,
  };
}

export async function deleteResourceGroupAction(id: string): Promise<void> {
  const res = await fetchAPI(`${RESOURCES_PATH}/groups/${id}`, {
    method: "DELETE",
  });
  if (!res.success) throw new Error(res.message);
  revalidatePath("/dashboard/manager/services", "page");
}

// ========== Resources Actions ==========
export async function getResourcesAction(
  groupId?: string
): Promise<Resource[]> {
  const url = groupId
    ? `${API_BASE_URL}${RESOURCES_PATH}?group_id=${groupId}`
    : `${API_BASE_URL}${RESOURCES_PATH}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Không thể tải danh sách tài nguyên");
  return res.json();
}

export async function createResourceAction(data: ResourceCreateInput) {
  const res = await fetchAPI(RESOURCES_PATH, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (res.success) revalidatePath("/dashboard/manager/services", "page");
  return {
    ...res,
    message: res.success ? "Tạo tài nguyên thành công" : res.message,
  };
}

export async function deleteResourceAction(id: string): Promise<void> {
  const res = await fetchAPI(`${RESOURCES_PATH}/${id}`, { method: "DELETE" });
  if (!res.success) throw new Error(res.message);
  revalidatePath("/dashboard/manager/services", "page");
}

export async function createMaintenanceAction(
  resourceId: string,
  data: MaintenanceCreateInput
): Promise<ResourceMaintenance> {
  const res = await fetchAPI<ResourceMaintenance>(
    `${RESOURCES_PATH}/${resourceId}/maintenance`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  if (!res.success) throw new Error(res.message);
  revalidatePath("/dashboard/manager/services", "page");
  return res.data!;
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

  const url = `${API_BASE_URL}${SERVICES_PATH}?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Không thể tải danh sách dịch vụ");
  const responseData = await res.json();

  // Backend trả về ServiceListResponse format: { data, total, page, limit }
  if (responseData.data && typeof responseData.total === "number") {
    return responseData;
  }

  // Fallback nếu backend trả array trực tiếp (backward compatibility)
  return {
    data: Array.isArray(responseData) ? responseData : [],
    total: Array.isArray(responseData) ? responseData.length : 0,
    page: 1,
    limit: 1000,
  };
}

export async function getServiceByIdAction(
  id: string
): Promise<ServiceWithDetails> {
  const res = await fetch(`${API_BASE_URL}${SERVICES_PATH}/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Không thể tải thông tin dịch vụ");
  return res.json();
}

export async function createServiceAction(data: ServiceCreateInput) {
  const payload = {
    ...data,
    category_id:
      data.category_id && data.category_id !== "uncategorized"
        ? data.category_id
        : undefined,
    image_url: data.image_url || undefined,
    description: data.description || undefined,
  };

  const res = await fetchAPI(SERVICES_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (res.success) revalidatePath("/dashboard/manager/services", "page");
  return {
    ...res,
    message: res.success ? "Tạo dịch vụ thành công" : res.message,
  };
}

export async function updateServiceAction(
  id: string,
  data: ServiceUpdateInput
) {
  const payload = {
    ...data,
    category_id:
      data.category_id && data.category_id !== "uncategorized"
        ? data.category_id
        : null,
    image_url: data.image_url || null,
    description: data.description || null,
  };

  const res = await fetchAPI(`${SERVICES_PATH}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (res.success) revalidatePath("/dashboard/manager/services", "page");
  return {
    ...res,
    message: res.success ? "Cập nhật dịch vụ thành công" : res.message,
  };
}

export async function toggleServiceStatusAction(id: string): Promise<Service> {
  const res = await fetchAPI<Service>(`${SERVICES_PATH}/${id}/toggle-status`, {
    method: "PATCH",
  });
  if (!res.success) throw new Error(res.message);
  revalidatePath("/dashboard/manager/services", "page");
  return res.data!;
}

export async function deleteServiceAction(id: string): Promise<void> {
  const res = await fetchAPI(`${SERVICES_PATH}/${id}`, { method: "DELETE" });
  if (!res.success) throw new Error(res.message);
  revalidatePath("/dashboard/manager/services", "page");
}
