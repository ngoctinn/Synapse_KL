"use server";

import {
  apiClient,
  createErrorResponse,
  createSuccessResponse,
  type ActionResponse,
} from "@/shared/api";
import { revalidateTag } from "next/cache";

import {
  SERVICES_CACHE_TAGS,
  SERVICES_ENDPOINTS,
} from "./api/endpoints";
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

const UNCATEGORIZED = "uncategorized";

export async function createSkillAction(
  data: SkillCreateInput
): Promise<ActionResponse<Skill>> {
  const result = await apiClient.fetch<Skill>(SERVICES_ENDPOINTS.SKILLS, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!result.success) {
    return createErrorResponse(
      result.error?.message || "Không thể tạo kỹ năng",
      result.error
    );
  }

  revalidateTag(SERVICES_CACHE_TAGS.SKILLS, "max");
  return createSuccessResponse("Tạo kỹ năng thành công", result.data);
}

export async function updateSkillAction(
  id: string,
  data: SkillUpdateInput
): Promise<ActionResponse> {
  const result = await apiClient.fetch(SERVICES_ENDPOINTS.SKILL_BY_ID(id), {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!result.success) {
    return createErrorResponse(
      result.error?.message || "Không thể cập nhật kỹ năng",
      result.error
    );
  }

  revalidateTag(SERVICES_CACHE_TAGS.SKILLS, "max");
  return createSuccessResponse("Cập nhật kỹ năng thành công");
}

export async function deleteSkillAction(id: string): Promise<void> {
  const result = await apiClient.fetch(SERVICES_ENDPOINTS.SKILL_BY_ID(id), {
    method: "DELETE",
  });
  if (!result.success) {
    throw new Error(result.error?.message || "Không thể xóa kỹ năng");
  }
  revalidateTag(SERVICES_CACHE_TAGS.SKILLS, "max");
}

export async function createCategoryAction(
  data: CategoryCreateInput
): Promise<ActionResponse<ServiceCategory>> {
  const result = await apiClient.fetch<ServiceCategory>(
    SERVICES_ENDPOINTS.CATEGORIES,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  if (!result.success) {
    return createErrorResponse(
      result.error?.message || "Không thể tạo danh mục",
      result.error
    );
  }

  revalidateTag(SERVICES_CACHE_TAGS.CATEGORIES, "max");
  return createSuccessResponse("Tạo danh mục thành công", result.data);
}

export async function updateCategoryAction(
  id: string,
  data: CategoryUpdateInput
): Promise<ActionResponse> {
  const result = await apiClient.fetch(SERVICES_ENDPOINTS.CATEGORY_BY_ID(id), {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!result.success) {
    return createErrorResponse(
      result.error?.message || "Không thể cập nhật danh mục",
      result.error
    );
  }

  revalidateTag(SERVICES_CACHE_TAGS.CATEGORIES, "max");
  return createSuccessResponse("Cập nhật danh mục thành công");
}

export async function reorderCategoriesAction(
  ids: string[]
): Promise<ServiceCategory[]> {
  const result = await apiClient.fetch<ServiceCategory[]>(
    SERVICES_ENDPOINTS.CATEGORIES_REORDER,
    {
      method: "PUT",
      body: JSON.stringify({ ids }),
    }
  );
  if (!result.success) {
    throw new Error(result.error?.message || "Không thể sắp xếp lại danh mục");
  }
  revalidateTag(SERVICES_CACHE_TAGS.CATEGORIES, "max");
  return result.data!;
}

export async function deleteCategoryAction(id: string): Promise<void> {
  const result = await apiClient.fetch(SERVICES_ENDPOINTS.CATEGORY_BY_ID(id), {
    method: "DELETE",
  });
  if (!result.success) {
    throw new Error(result.error?.message || "Không thể xóa danh mục");
  }
  revalidateTag(SERVICES_CACHE_TAGS.CATEGORIES, "max");
}

export async function createResourceGroupAction(
  data: ResourceGroupCreateInput
): Promise<ActionResponse<ResourceGroup>> {
  const result = await apiClient.fetch<ResourceGroup>(
    SERVICES_ENDPOINTS.RESOURCE_GROUPS,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  if (!result.success) {
    return createErrorResponse(
      result.error?.message || "Không thể tạo nhóm tài nguyên",
      result.error
    );
  }

  revalidateTag(SERVICES_CACHE_TAGS.RESOURCE_GROUPS, "max");
  return createSuccessResponse("Tạo nhóm tài nguyên thành công", result.data);
}

export async function deleteResourceGroupAction(id: string): Promise<void> {
  const result = await apiClient.fetch(
    SERVICES_ENDPOINTS.RESOURCE_GROUP_BY_ID(id),
    {
      method: "DELETE",
    }
  );
  if (!result.success) {
    throw new Error(result.error?.message || "Không thể xóa nhóm tài nguyên");
  }
  revalidateTag(SERVICES_CACHE_TAGS.RESOURCE_GROUPS, "max");
}

export async function createResourceAction(
  data: ResourceCreateInput
): Promise<ActionResponse<Resource>> {
  const result = await apiClient.fetch<Resource>(SERVICES_ENDPOINTS.RESOURCES, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!result.success) {
    return createErrorResponse(
      result.error?.message || "Không thể tạo tài nguyên",
      result.error
    );
  }

  revalidateTag(SERVICES_CACHE_TAGS.RESOURCES, "max");
  return createSuccessResponse("Tạo tài nguyên thành công", result.data);
}

export async function deleteResourceAction(id: string): Promise<void> {
  const result = await apiClient.fetch(SERVICES_ENDPOINTS.RESOURCE_BY_ID(id), {
    method: "DELETE",
  });
  if (!result.success) {
    throw new Error(result.error?.message || "Không thể xóa tài nguyên");
  }
  revalidateTag(SERVICES_CACHE_TAGS.RESOURCES, "max");
}

export async function createMaintenanceAction(
  resourceId: string,
  data: MaintenanceCreateInput
): Promise<ResourceMaintenance> {
  const result = await apiClient.fetch<ResourceMaintenance>(
    SERVICES_ENDPOINTS.RESOURCE_MAINTENANCE(resourceId),
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  if (!result.success) {
    throw new Error(result.error?.message || "Không thể tạo bảo trì");
  }
  revalidateTag(SERVICES_CACHE_TAGS.RESOURCES, "max");
  return result.data!;
}

export async function createServiceAction(
  data: ServiceCreateInput
): Promise<ActionResponse<Service>> {
  const payload = {
    ...data,
    category_id:
      data.category_id && data.category_id !== UNCATEGORIZED
        ? data.category_id
        : undefined,
    image_url: data.image_url || undefined,
    description: data.description || undefined,
  };

  const result = await apiClient.fetch<Service>(SERVICES_ENDPOINTS.SERVICES, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!result.success) {
    return createErrorResponse(
      result.error?.message || "Không thể tạo dịch vụ",
      result.error
    );
  }

  revalidateTag(SERVICES_CACHE_TAGS.SERVICES, "max");
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

  const result = await apiClient.fetch<Service>(
    SERVICES_ENDPOINTS.SERVICE_BY_ID(id),
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );

  if (!result.success) {
    return createErrorResponse(
      result.error?.message || "Không thể cập nhật dịch vụ",
      result.error
    );
  }

  revalidateTag(SERVICES_CACHE_TAGS.SERVICES, "max");
  return createSuccessResponse("Cập nhật dịch vụ thành công", result.data);
}

export async function toggleServiceStatusAction(id: string): Promise<Service> {
  const result = await apiClient.fetch<Service>(
    SERVICES_ENDPOINTS.SERVICE_TOGGLE_STATUS(id),
    {
      method: "PATCH",
    }
  );
  if (!result.success) {
    throw new Error(result.error?.message || "Không thể thay đổi trạng thái");
  }
  revalidateTag(SERVICES_CACHE_TAGS.SERVICES, "max");
  return result.data!;
}

export async function deleteServiceAction(id: string): Promise<void> {
  const result = await apiClient.fetch(SERVICES_ENDPOINTS.SERVICE_BY_ID(id), {
    method: "DELETE",
  });
  if (!result.success) {
    throw new Error(result.error?.message || "Không thể xóa dịch vụ");
  }
  revalidateTag(SERVICES_CACHE_TAGS.SERVICES, "max");
}

export async function getResourcesAction(groupId?: string): Promise<Resource[]> {
  const endpoint = groupId
    ? `${SERVICES_ENDPOINTS.RESOURCES}?group_id=${groupId}`
    : SERVICES_ENDPOINTS.RESOURCES;

  const result = await apiClient.fetch<Resource[]>(endpoint, {
    cache: "no-store",
  });

  if (!result.success) {
    throw new Error(result.error?.message || "Không thể tải danh sách tài nguyên");
  }

  return result.data!;
}

export async function getSkillsAction(): Promise<Skill[]> {
  const result = await apiClient.fetch<Skill[]>(SERVICES_ENDPOINTS.SKILLS, {
    cache: "no-store",
  });

  if (!result.success) {
    throw new Error(result.error?.message || "Không thể tải danh sách kỹ năng");
  }

  return result.data!;
}

export async function getServiceByIdAction(id: string): Promise<ServiceWithDetails> {
  const result = await apiClient.fetch<ServiceWithDetails>(
    SERVICES_ENDPOINTS.SERVICE_BY_ID(id),
    {
      cache: "no-store",
    }
  );

  if (!result.success) {
    throw new Error(result.error?.message || "Không thể tải thông tin dịch vụ");
  }

  return result.data!;
}
