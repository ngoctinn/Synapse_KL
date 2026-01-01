"use client";

import { getSchedulesAction, getShiftsAction, getStaffAction } from "@/features/staff/actions";
import { ScheduleFormSheet } from "@/features/staff/components/schedule-form-sheet";
import type { Shift, StaffProfile, StaffScheduleWithDetails } from "@/features/staff/types";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  addDays,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
  subDays
} from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus
} from "lucide-react";
import { useEffect, useState } from "react";

export function SchedulingGrid() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [schedules, setSchedules] = useState<StaffScheduleWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ staff: StaffProfile; date: Date } | null>(null);

  const start = startOfWeek(currentDate, { weekStartsOn: 1 });
  const end = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = [...Array(7)].map((_, i) => addDays(start, i));

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [staffData, shiftsData, scheduleData] = await Promise.all([
        getStaffAction(),
        getShiftsAction(),
        getSchedulesAction(format(start, "yyyy-MM-dd"), format(end, "yyyy-MM-dd"))
      ]);
      setStaff(staffData.filter(s => s.is_active));
      setShifts(shiftsData);
      setSchedules(scheduleData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const handleCellClick = (staffMember: StaffProfile, date: Date) => {
    setSelectedCell({ staff: staffMember, date });
    setIsSheetOpen(true);
  };

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentDate(direction === "prev" ? subDays(currentDate, 7) : addDays(currentDate, 7));
  };

  return (
    <div className="space-y-4">
      {/* Cleanup: Remove redundant header and use standard navigation layout */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateWeek("prev")} className="h-10 w-10">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 px-3 h-10 border rounded-md bg-muted/20">
            <CalendarIcon className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium whitespace-nowrap">Tuần {format(start, "dd/MM/yyyy", { locale: vi })}</span>
          </div>
          <Button variant="outline" size="icon" onClick={() => navigateWeek("next")} className="h-10 w-10">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setCurrentDate(new Date())}
          className="h-10 px-4 font-medium"
        >
          HÔM NAY
        </Button>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/30">
                <th className="p-4 text-left border-b border-r border-muted/50 min-w-[200px]">
                  <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Nhân viên</span>
                </th>
                {weekDays.map((day) => (
                  <th key={day.toString()} className={cn(
                    "p-4 text-center border-b border-muted/50 min-w-[140px]",
                    isSameDay(day, new Date()) && "bg-primary/5"
                  )}>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[10px] uppercase font-bold tracking-tight text-muted-foreground">
                        {format(day, "EEEE", { locale: vi })}
                      </span>
                      <span className={cn(
                        "text-lg font-black tracking-tight",
                        isSameDay(day, new Date()) ? "text-primary" : "text-foreground"
                      )}>
                        {format(day, "dd/MM")}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="p-4 border-b border-r border-muted/50"><Skeleton className="h-6 w-3/4" /></td>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="p-4 border-b border-muted/50"><Skeleton className="h-10 w-full rounded-xl" /></td>
                    ))}
                  </tr>
                ))
              ) : staff.map((s) => (
                <tr key={s.user_id} className="group hover:bg-muted/5 transition-colors">
                  <td className="p-4 border-b border-r border-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-primary">{s.full_name.charAt(0)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground">{s.full_name}</span>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase">{s.title}</span>
                      </div>
                    </div>
                  </td>
                  {weekDays.map((day) => {
                    const daySchedules = schedules.filter(sch =>
                      sch.staff_id === s.user_id && isSameDay(new Date(sch.work_date), day)
                    );

                    return (
                      <td
                        key={day.toString()}
                        className={cn(
                          "p-2 border-b border-muted/50 group/cell cursor-pointer relative",
                          isSameDay(day, new Date()) && "bg-primary/5 mr-[1px]"
                        )}
                        onClick={() => handleCellClick(s, day)}
                      >
                        <div className="min-h-[60px] flex flex-col gap-1 w-full items-center justify-center">
                          {daySchedules.length > 0 ? (
                            daySchedules.map(sch => (
                              <div
                                key={sch.id}
                                className="w-full p-2 rounded-xl text-[11px] font-bold border flex flex-col gap-0.5 shadow-sm overflow-hidden relative"
                                style={{
                                  backgroundColor: sch.shift_color ? `${sch.shift_color}15` : "#F3F4F6",
                                  borderColor: sch.shift_color || "#E5E7EB",
                                  color: sch.shift_color || "#374151"
                                }}
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <Clock className="w-3 h-3 shrink-0" />
                                  <span>{sch.shift_name}</span>
                                </div>
                                <span className="opacity-70 font-medium">Bản nháp</span>
                              </div>
                            ))
                          ) : (
                            <div className="opacity-0 group-hover/cell:opacity-100 transition-opacity flex flex-col items-center gap-1">
                              <Plus className="w-5 h-5 text-muted-foreground/40" />
                              <span className="text-[9px] uppercase font-bold text-muted-foreground/40">Phân ca</span>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCell && (
        <ScheduleFormSheet
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          staff={selectedCell.staff}
          workDate={selectedCell.date}
          shifts={shifts}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
