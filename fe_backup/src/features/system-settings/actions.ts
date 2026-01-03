"use server";

import { revalidateTag } from "next/cache";

import { SETTINGS_CACHE_TAGS } from "./api/endpoints";
import type { OperationalSettings } from "./types";
import { normalizeOperationalSettings } from "./utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_ENDPOINT = `${API_BASE}/api/v1/settings/operational/`;

export async function updateOperationalSettingsAction(
  settings: OperationalSettings
): Promise<
  | { success: true; data: OperationalSettings }
  | { success: false; error: string }
> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ detail: "Unknown error" }));

      if (Array.isArray(errorData.detail)) {
        throw new Error(JSON.stringify(errorData.detail));
      }
      throw new Error(errorData.detail || "Không thể cập nhật cấu hình");
    }

    const data = await response.json();
    revalidateTag(SETTINGS_CACHE_TAGS.OPERATIONAL, "max");

    return { success: true, data: normalizeOperationalSettings(data) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getOperationalSettingsAction(): Promise<OperationalSettings> {
  const response = await fetch(API_ENDPOINT, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Không thể tải cấu hình vận hành");
  }

  const data = await response.json();
  return normalizeOperationalSettings(data);
}
