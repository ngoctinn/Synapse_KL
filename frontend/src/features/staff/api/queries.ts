import "server-only";

import type {
  Shift,
  StaffProfileWithSkills,
  StaffScheduleWithDetails,
} from "../types";
import {
  STAFF_CACHE_REVALIDATE,
  STAFF_CACHE_TAGS,
  STAFF_ENDPOINTS,
} from "./endpoints";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getStaff(): Promise<StaffProfileWithSkills[]> {
  const res = await fetch(`${API_BASE}${STAFF_ENDPOINTS.STAFF}`, {
    next: {
      tags: [STAFF_CACHE_TAGS.STAFF],
      revalidate: STAFF_CACHE_REVALIDATE.STAFF,
    },
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách nhân viên");
  }

  return res.json();
}

export async function getShifts(): Promise<Shift[]> {
  const res = await fetch(`${API_BASE}${STAFF_ENDPOINTS.SHIFTS}`, {
    next: {
      tags: [STAFF_CACHE_TAGS.SHIFTS],
      revalidate: STAFF_CACHE_REVALIDATE.SHIFTS,
    },
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách ca làm việc");
  }

  return res.json();
}

export async function getSchedules(
  startDate: string,
  endDate: string,
  staffId?: string
): Promise<StaffScheduleWithDetails[]> {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
  });

  if (staffId) {
    params.append("staff_id", staffId);
  }

  const res = await fetch(`${API_BASE}${STAFF_ENDPOINTS.SCHEDULES}?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Không thể tải lịch làm việc");
  }

  return res.json();
}
