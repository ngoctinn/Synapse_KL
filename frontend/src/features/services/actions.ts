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

// ========== Skills Actions ==========
export async function getSkillsAction(): Promise<Skill[]> {
  const res = await fetch(`${API_BASE_URL}${SKILLS_PATH}`, {
    next: { revalidate: 60, tags: ["skills"] },
  });
  if (!res.ok) throw new Error("Không thể tải danh sách kỹ năng");
  return res.json();
}

export async function createSkillAction(data: SkillCreateInput) {
  try {
    const res = await fetch(`${API_BASE_URL}${SKILLS_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      return { success: false, message: err.detail || "Không thể tạo kỹ năng" };
    }
    revalidatePath("/dashboard/manager/services");
    return { success: true, message: "Tạo kỹ năng thành công" };
  } catch (e) {
    return { success: false, message: "Lỗi kết nối máy chủ" };
  }
}

export async function updateSkillAction(id: string, data: SkillUpdateInput) {
  try {
    const res = await fetch(`${API_BASE_URL}${SKILLS_PATH}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      return { success: false, message: err.detail || "Không thể cập nhật kỹ năng" };
    }
    revalidatePath("/dashboard/manager/services");
    return { success: true, message: "Cập nhật kỹ năng thành công" };
  } catch (e) {
    return { success: false, message: "Lỗi kết nối máy chủ" };
  }
}

export async function deleteSkillAction(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${SKILLS_PATH}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Không thể xóa kỹ năng");
  }
  revalidatePath("/dashboard/manager/services");
}

// ========== Categories Actions ==========
export async function getCategoriesAction(): Promise<ServiceCategory[]> {
  const res = await fetch(`${API_BASE_URL}${CATEGORIES_PATH}`, {
    next: { revalidate: 60, tags: ["categories"] },
  });
  if (!res.ok) throw new Error("Không thể tải danh sách danh mục");
  return res.json();
}

export async function createCategoryAction(data: CategoryCreateInput) {
  try {
    const res = await fetch(`${API_BASE_URL}${CATEGORIES_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      return { success: false, message: err.detail || "Không thể tạo danh mục" };
    }
    revalidatePath("/dashboard/manager/services");
    return { success: true, message: "Tạo danh mục thành công" };
  } catch (e) {
    return { success: false, message: "Lỗi kết nối máy chủ" };
  }
}

export async function updateCategoryAction(id: string, data: CategoryUpdateInput) {
  try {
    const res = await fetch(`${API_BASE_URL}${CATEGORIES_PATH}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      return { success: false, message: err.detail || "Không thể cập nhật danh mục" };
    }
    revalidatePath("/dashboard/manager/services");
    return { success: true, message: "Cập nhật danh mục thành công" };
  } catch (e) {
    return { success: false, message: "Lỗi kết nối máy chủ" };
  }
}

export async function reorderCategoriesAction(ids: string[]): Promise<ServiceCategory[]> {
  const res = await fetch(`${API_BASE_URL}${CATEGORIES_PATH}/reorder`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Không thể sắp xếp danh mục");
  }
  revalidatePath("/dashboard/manager/services");
  return res.json();
}

export async function deleteCategoryAction(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${CATEGORIES_PATH}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Không thể xóa danh mục");
  }
  revalidatePath("/dashboard/manager/services");
}

// ========== Resource Groups Actions ==========
export async function getResourceGroupsAction(): Promise<ResourceGroup[]> {
  const res = await fetch(`${API_BASE_URL}${RESOURCES_PATH}/groups`, {
    next: { revalidate: 60, tags: ["resource-groups"] },
  });
  if (!res.ok) throw new Error("Không thể tải danh sách nhóm tài nguyên");
  return res.json();
}

export async function createResourceGroupAction(data: ResourceGroupCreateInput) {
  try {
    const res = await fetch(`${API_BASE_URL}${RESOURCES_PATH}/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      return { success: false, message: err.detail || "Không thể tạo nhóm tài nguyên" };
    }
    revalidatePath("/dashboard/manager/services");
    return { success: true, message: "Tạo nhóm tài nguyên thành công" };
  } catch (e) {
    return { success: false, message: "Lỗi kết nối máy chủ" };
  }
}

export async function deleteResourceGroupAction(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${RESOURCES_PATH}/groups/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Không thể xóa nhóm tài nguyên");
  }
  revalidatePath("/dashboard/manager/services");
}

// ========== Resources Actions ==========
export async function getResourcesAction(groupId?: string): Promise<Resource[]> {
  const url = groupId
    ? `${API_BASE_URL}${RESOURCES_PATH}?group_id=${groupId}`
    : `${API_BASE_URL}${RESOURCES_PATH}`;
  const res = await fetch(url, {
    next: { revalidate: 60, tags: ["resources"] },
  });
  if (!res.ok) throw new Error("Không thể tải danh sách tài nguyên");
  return res.json();
}

export async function createResourceAction(data: ResourceCreateInput) {
  try {
    const res = await fetch(`${API_BASE_URL}${RESOURCES_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      return { success: false, message: err.detail || "Không thể tạo tài nguyên" };
    }
    revalidatePath("/dashboard/manager/services");
    return { success: true, message: "Tạo tài nguyên thành công" };
  } catch (e) {
    return { success: false, message: "Lỗi kết nối máy chủ" };
  }
}

export async function deleteResourceAction(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${RESOURCES_PATH}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Không thể xóa tài nguyên");
  }
  revalidatePath("/dashboard/manager/services");
}

export async function createMaintenanceAction(
  resourceId: string,
  data: MaintenanceCreateInput
): Promise<ResourceMaintenance> {
  const res = await fetch(`${API_BASE_URL}${RESOURCES_PATH}/${resourceId}/maintenance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Không thể tạo lịch bảo trì");
  }
  revalidatePath("/dashboard/manager/services");
  return res.json();
}

// ========== Services Actions ==========
export async function getServicesAction(
  categoryId?: string,
  isActive?: boolean
): Promise<Service[]> {
  const params = new URLSearchParams();
  if (categoryId) params.append("category_id", categoryId);
  if (isActive !== undefined) params.append("is_active", String(isActive));

  const url = `${API_BASE_URL}${SERVICES_PATH}${params.toString() ? `?${params}` : ""}`;
  const res = await fetch(url, {
    next: { revalidate: 60, tags: ["services"] },
  });
  if (!res.ok) throw new Error("Không thể tải danh sách dịch vụ");
  return res.json();
}

export async function getServiceByIdAction(id: string): Promise<ServiceWithDetails> {
  const res = await fetch(`${API_BASE_URL}${SERVICES_PATH}/${id}`, {
    next: { revalidate: 60, tags: ["services"] },
  });
  if (!res.ok) throw new Error("Không thể tải thông tin dịch vụ");
  return res.json();
}

export async function createServiceAction(data: ServiceCreateInput) {
  try {
    const res = await fetch(`${API_BASE_URL}${SERVICES_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      return { success: false, message: err.detail || "Không thể tạo dịch vụ" };
    }
    revalidatePath("/dashboard/manager/services");
    return { success: true, message: "Tạo dịch vụ thành công" };
  } catch (e) {
    return { success: false, message: "Lỗi kết nối máy chủ" };
  }
}

export async function updateServiceAction(
  id: string,
  data: ServiceUpdateInput
) {
  try {
    const res = await fetch(`${API_BASE_URL}${SERVICES_PATH}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      return { success: false, message: err.detail || "Không thể cập nhật dịch vụ" };
    }
    revalidatePath("/dashboard/manager/services");
    return { success: true, message: "Cập nhật dịch vụ thành công" };
  } catch (e) {
    return { success: false, message: "Lỗi kết nối máy chủ" };
  }
}

export async function toggleServiceStatusAction(id: string): Promise<Service> {
  const res = await fetch(`${API_BASE_URL}${SERVICES_PATH}/${id}/toggle-status`, {
    method: "PATCH",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Không thể thay đổi trạng thái dịch vụ");
  }
  revalidatePath("/dashboard/manager/services");
  return res.json();
}

export async function deleteServiceAction(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${SERVICES_PATH}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Không thể xóa dịch vụ");
  }
  revalidatePath("/dashboard/manager/services");
}
