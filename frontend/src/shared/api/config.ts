export const API_ENDPOINTS = {
  SKILLS: "/api/v1/skills",
  CATEGORIES: "/api/v1/categories",
  RESOURCES: "/api/v1/resources",
  RESOURCE_GROUPS: "/api/v1/resources/groups",
  SERVICES: "/api/v1/services",
  STAFF: "/api/v1/staff",
  STAFF_INVITE: "/api/v1/staff/invite",
  STAFF_SKILLS: "/api/v1/staff/:id/skills",
  SHIFTS: "/api/v1/scheduling/shifts",
  SCHEDULES: "/api/v1/scheduling/schedules",
  SETTINGS: "/api/v1/settings/operational",
} as const;

// Cache theo tần suất thay đổi: skills (real-time), staff (1 phút), settings (1 giờ)
// Giúp giảm load backend trong khi vẫn đảm bảo data freshness phù hợp từng entity
export const CACHE_STRATEGIES = {
  SKILLS: { revalidate: 0, tags: ["skills"] } as const,
  STAFF: { revalidate: 60, tags: ["staff"] } as const,
  SETTINGS: { revalidate: 3600, tags: ["settings"] } as const,
} as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  CONFLICT: "CONFLICT",
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
  UNKNOWN: "UNKNOWN",
} as const;
