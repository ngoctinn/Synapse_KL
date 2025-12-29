import { DayOfWeek, OperationalSettings } from "./types";

const STORAGE_KEY = "synapse_operational_settings";

const defaultSettings: OperationalSettings = {
  regular_operating_hours: ([1, 2, 3, 4, 5, 6, 0] as DayOfWeek[]).map((day) => ({
    day_of_week: day,
    open_time: "08:00",
    close_time: "20:00",
    is_closed: false,
  })),
  exception_dates: [],
};

export const settingsApi = {
  getSettings: async (): Promise<OperationalSettings> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    if (typeof window === "undefined") return defaultSettings;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultSettings;
  },
  
  saveSettings: async (settings: OperationalSettings): Promise<void> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    if (typeof window === "undefined") return;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  },
};