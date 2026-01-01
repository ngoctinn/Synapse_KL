export type { Skill } from "@/features/services/types";

export type ScheduleStatus = "DRAFT" | "PUBLISHED" | "CANCELLED";

export interface StaffProfile {
  user_id: string;
  full_name: string;
  title: string;
  bio: string | null;
  color_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StaffProfileWithSkills extends StaffProfile {
  skill_ids: string[];
}

export interface Shift {
  id: string;
  name: string;
  start_time: string; // HH:mm:ss from backend
  end_time: string;   // HH:mm:ss from backend
  color_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffSchedule {
  id: string;
  staff_id: string;
  shift_id: string;
  work_date: string; // YYYY-MM-DD
  status: ScheduleStatus;
  created_at: string;
}

export interface StaffScheduleWithDetails extends StaffSchedule {
  shift_name?: string;
  shift_color?: string;
  staff_name?: string;
}

export interface StaffProfileCreateInput {
  user_id: string;
  full_name: string;
  title?: string;
  bio?: string | null;
  color_code?: string;
}

export interface StaffProfileUpdateInput {
  full_name?: string;
  title?: string;
  bio?: string | null;
  color_code?: string;
  is_active?: boolean;
}

export interface ShiftCreateInput {
  name: string;
  start_time: string; // HH:mm
  end_time: string;   // HH:mm
  color_code?: string | null;
}

export interface ShiftUpdateInput {
  name?: string;
  start_time?: string;
  end_time?: string;
  color_code?: string | null;
}

export interface StaffScheduleCreateInput {
  staff_id: string;
  shift_id: string;
  work_date: string;
  status: ScheduleStatus;
}

export interface StaffScheduleBatchCreateInput {
  staff_id: string;
  shift_id: string;
  work_dates: string[];
  status: ScheduleStatus;
}

export interface StaffSkillsUpdate {
  skill_ids: string[];
}
