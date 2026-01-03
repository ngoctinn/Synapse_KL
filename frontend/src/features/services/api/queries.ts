import "server-only";

import type {
    Resource,
    ResourceGroup,
    Service,
    ServiceCategory,
    ServiceWithDetails,
    Skill,
} from "../types";
import {
    SERVICES_CACHE_REVALIDATE,
    SERVICES_CACHE_TAGS,
    SERVICES_ENDPOINTS,
} from "./endpoints";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getSkills(): Promise<Skill[]> {
  const res = await fetch(`${API_BASE}${SERVICES_ENDPOINTS.SKILLS}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách kỹ năng");
  }

  return res.json();
}

export async function getCategories(): Promise<ServiceCategory[]> {
  const res = await fetch(`${API_BASE}${SERVICES_ENDPOINTS.CATEGORIES}`, {
    next: {
      tags: [SERVICES_CACHE_TAGS.CATEGORIES],
      revalidate: SERVICES_CACHE_REVALIDATE.CATEGORIES,
    },
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách danh mục");
  }

  return res.json();
}

export async function getResourceGroups(): Promise<ResourceGroup[]> {
  const res = await fetch(`${API_BASE}${SERVICES_ENDPOINTS.RESOURCE_GROUPS}`, {
    next: {
      tags: [SERVICES_CACHE_TAGS.RESOURCE_GROUPS],
      revalidate: SERVICES_CACHE_REVALIDATE.RESOURCE_GROUPS,
    },
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách nhóm tài nguyên");
  }

  return res.json();
}

export async function getResources(groupId?: string): Promise<Resource[]> {
  const endpoint = groupId
    ? `${SERVICES_ENDPOINTS.RESOURCES}?group_id=${groupId}`
    : SERVICES_ENDPOINTS.RESOURCES;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    next: {
      tags: [SERVICES_CACHE_TAGS.RESOURCES],
      revalidate: SERVICES_CACHE_REVALIDATE.RESOURCES,
    },
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách tài nguyên");
  }

  return res.json();
}

export async function getServices(
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

  const res = await fetch(
    `${API_BASE}${SERVICES_ENDPOINTS.SERVICES}?${params.toString()}`,
    {
      next: {
        tags: [SERVICES_CACHE_TAGS.SERVICES],
        revalidate: SERVICES_CACHE_REVALIDATE.SERVICES,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Không thể tải danh sách dịch vụ");
  }

  const result = await res.json();

  if (
    typeof result === "object" &&
    "data" in result &&
    typeof result.total === "number"
  ) {
    return result;
  }

  const arrayData = Array.isArray(result) ? result : [];
  return {
    data: arrayData,
    total: arrayData.length,
    page: 1,
    limit: 1000,
  };
}

export async function getServiceById(id: string): Promise<ServiceWithDetails> {
  const res = await fetch(
    `${API_BASE}${SERVICES_ENDPOINTS.SERVICE_BY_ID(id)}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Không thể tải thông tin dịch vụ");
  }

  return res.json();
}
