export const STAFF_ENDPOINTS = {
  STAFF: "/api/v1/staff",
  STAFF_BY_ID: (id: string) => `/api/v1/staff/${id}`,
  STAFF_SKILLS: (id: string) => `/api/v1/staff/${id}/skills`,
  STAFF_INVITE: "/api/v1/staff/invite",

  SHIFTS: "/api/v1/scheduling/shifts",
  SHIFT_BY_ID: (id: string) => `/api/v1/scheduling/shifts/${id}`,
  SCHEDULES: "/api/v1/scheduling/schedules",
  SCHEDULE_BY_ID: (id: string) => `/api/v1/scheduling/schedules/${id}`,
  SCHEDULES_BATCH: "/api/v1/scheduling/schedules/batch",
} as const;

export const STAFF_CACHE_TAGS = {
  STAFF: "staff",
  SHIFTS: "shifts",
  SCHEDULES: "schedules",
} as const;

export const STAFF_CACHE_REVALIDATE = {
  STAFF: 60,
  SHIFTS: 600,
  SCHEDULES: 0,
} as const;
