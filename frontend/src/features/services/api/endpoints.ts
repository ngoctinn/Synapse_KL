export const SERVICES_ENDPOINTS = {
  SKILLS: "/api/v1/skills",
  SKILL_BY_ID: (id: string) => `/api/v1/skills/${id}`,

  CATEGORIES: "/api/v1/categories",
  CATEGORY_BY_ID: (id: string) => `/api/v1/categories/${id}`,
  CATEGORIES_REORDER: "/api/v1/categories/reorder",

  RESOURCE_GROUPS: "/api/v1/resources/groups",
  RESOURCE_GROUP_BY_ID: (id: string) => `/api/v1/resources/groups/${id}`,

  RESOURCES: "/api/v1/resources",
  RESOURCE_BY_ID: (id: string) => `/api/v1/resources/${id}`,
  RESOURCE_MAINTENANCE: (id: string) => `/api/v1/resources/${id}/maintenance`,

  SERVICES: "/api/v1/services",
  SERVICE_BY_ID: (id: string) => `/api/v1/services/${id}`,
  SERVICE_TOGGLE_STATUS: (id: string) => `/api/v1/services/${id}/toggle-status`,
} as const;

export const SERVICES_CACHE_TAGS = {
  SKILLS: "skills",
  CATEGORIES: "categories",
  RESOURCE_GROUPS: "resource-groups",
  RESOURCES: "resources",
  SERVICES: "services",
} as const;

export const SERVICES_CACHE_REVALIDATE = {
  SKILLS: 0,
  CATEGORIES: 300,
  RESOURCE_GROUPS: 300,
  RESOURCES: 60,
  SERVICES: 60,
} as const;
