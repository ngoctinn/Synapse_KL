import type { ExceptionDate, OperatingHour, OperationalSettings } from "./types";

export function normalizeOperationalSettings(
  data: OperationalSettings
): OperationalSettings {
  if (data.regular_operating_hours) {
    data.regular_operating_hours = data.regular_operating_hours.map(
      (h: OperatingHour) => ({
        ...h,
        open_time: h.open_time?.slice(0, 5) || "08:00",
        close_time: h.close_time?.slice(0, 5) || "20:00",
      })
    );
  }

  if (data.exception_dates) {
    data.exception_dates = data.exception_dates.map((d: ExceptionDate) => {
      if (!d.id) {
        d.id = crypto.randomUUID();
      }
      return {
        ...d,
        id: d.id,
        open_time: d.open_time?.slice(0, 5) || undefined,
        close_time: d.close_time?.slice(0, 5) || undefined,
      };
    });
  }

  return data;
}
