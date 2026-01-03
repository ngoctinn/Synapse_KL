import "server-only";

import type { OperationalSettings } from "../types";
import { normalizeOperationalSettings } from "../utils";
import { SETTINGS_CACHE_REVALIDATE, SETTINGS_CACHE_TAGS } from "./endpoints";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getOperationalSettings(): Promise<OperationalSettings> {
  const res = await fetch(`${API_BASE}/api/v1/settings/operational/`, {
    next: {
      tags: [SETTINGS_CACHE_TAGS.OPERATIONAL],
      revalidate: SETTINGS_CACHE_REVALIDATE.OPERATIONAL,
    },
  });

  if (!res.ok) {
    throw new Error("Không thể tải cấu hình vận hành");
  }

  const data = await res.json();
  return normalizeOperationalSettings(data);
}
