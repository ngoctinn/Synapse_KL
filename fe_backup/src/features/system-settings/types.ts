export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface OperatingHour {
  day_of_week: DayOfWeek;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface ExceptionDate {
  id: string;
  date: string; // ISO string
  reason: string;
  is_closed: boolean;
  open_time?: string;
  close_time?: string;
}

export interface OperationalSettings {
  regular_operating_hours: OperatingHour[];
  exception_dates: ExceptionDate[];
}

export const DAYS_OF_WEEK: { label: string; value: DayOfWeek }[] = [
  { label: "Thứ Hai", value: 1 },
  { label: "Thứ Ba", value: 2 },
  { label: "Thứ Tư", value: 3 },
  { label: "Thứ Năm", value: 4 },
  { label: "Thứ Sáu", value: 5 },
  { label: "Thứ Bảy", value: 6 },
  { label: "Chủ Nhật", value: 0 },
];
