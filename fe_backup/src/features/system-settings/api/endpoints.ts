export const SETTINGS_ENDPOINTS = {
  OPERATIONAL: "/api/v1/settings/operational",
} as const;

export const SETTINGS_CACHE_TAGS = {
  OPERATIONAL: "operational-settings",
} as const;

export const SETTINGS_CACHE_REVALIDATE = {
  OPERATIONAL: 3600,
} as const;
