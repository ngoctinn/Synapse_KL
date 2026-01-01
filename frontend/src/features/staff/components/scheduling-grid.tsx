"use client";

import { getSchedulesAction, getShiftsAction, getStaffAction } from "@/features/staff/actions";
import { ScheduleFormSheet } from "@/features/staff/components/schedule-form-sheet";
import { type GridCellCoords, useDragToSelect } from "@/features/staff/hooks/use-drag-select";
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
  const [selectedCells, setSelectedCells] = useState<GridCellCoords[]>([]);

  const start = startOfWeek(currentDate, { weekStartsOn: 1 });
  const end = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = [...Array(7)].map((_, i) => addDays(start, i));

  const {
    handlePointerDown,
    handlePointerEnter,
    handlePointerUp,
    clearSelection,
    isCellSelected,
    selection
  } = useDragToSelect();

  // Handle Drag End - Process Selection but DO NOT Open Sheet
  useEffect(() => {
    if (!selection.isSelecting && selection.start && selection.end) {
        // Collect selected cells
        const minCol = Math.min(selection.start.colIndex, selection.end.colIndex);
        const maxCol = Math.max(selection.start.colIndex, selection.end.colIndex);
        const minRow = Math.min(selection.start.rowIndex, selection.end.rowIndex);
        const maxRow = Math.max(selection.start.rowIndex, selection.end.rowIndex);

        const cells: GridCellCoords[] = [];
        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                 const s = staff[r];
                 if(s) {
                    cells.push({
                        staffId: s.user_id,
                        dateStr: format(weekDays[c], "yyyy-MM-dd"),
                        rowIndex: r,
                        colIndex: c
                    });
                 }
            }
        }

        if (cells.length > 0) {
            setSelectedCells(cells);
            // DO NOT open sheet automatically
            // setIsSheetOpen(true);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection.isSelecting]);

  // Conflict Detection
  const hasConflict = selectedCells.some(cell =>
    schedules.some(s => s.staff_id === cell.staffId && isSameDay(new Date(s.work_date), new Date(cell.dateStr)))
  );

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

  const handleSheetSuccess = () => {
      fetchData();
      clearSelection();
  }

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentDate(direction === "prev" ? subDays(currentDate, 7) : addDays(currentDate, 7));
  };

  return (
    <div className="space-y-4">
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

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden"
           onPointerUp={handlePointerUp}>
        <div className="overflow-x-auto relative scrollbar-hide">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/30">
                <th className="p-4 text-left border-b border-r border-muted/50 min-w-[200px] sticky left-0 z-20 bg-background shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
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
                    <td className="p-4 border-b border-r border-muted/50 sticky left-0 z-20 bg-background"><Skeleton className="h-6 w-3/4" /></td>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="p-4 border-b border-muted/50"><Skeleton className="h-10 w-full rounded-xl" /></td>
                    ))}
                  </tr>
                ))
              ) : staff.map((s, rowIndex) => (
                <tr key={s.user_id} className="group hover:bg-muted/5 transition-colors">
                  <td className="p-4 border-b border-r border-muted/50 sticky left-0 z-20 bg-card group-hover:bg-muted/5 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
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
                  {weekDays.map((day, colIndex) => {
                    const daySchedules = schedules.filter(sch =>
                      sch.staff_id === s.user_id && isSameDay(new Date(sch.work_date), day)
                    );

                    const isSelected = isCellSelected(colIndex, rowIndex);

                    // Cell Logic
                    const cellCoords = {
                        staffId: s.user_id,
                        dateStr: format(day, "yyyy-MM-dd"),
                        colIndex,
                        rowIndex
                    };

                    return (
                      <td
                        key={day.toString()}
                        className={cn(
                          "p-2 border-b border-muted/50 group/cell cursor-pointer relative select-none touch-none",
                          isSameDay(day, new Date()) && "bg-primary/5 mr-[1px]",
                          isSelected && "bg-primary/20",
                          isSelected && isSameDay(day, new Date()) && "bg-primary/25"
                        )}
                        onPointerDown={(e) => handlePointerDown(cellCoords, e)}
                        onPointerEnter={() => handlePointerEnter(cellCoords)}
                      >
                        <div className="min-h-[60px] flex flex-col gap-1 w-full items-center justify-center">
                          {daySchedules.length > 0 ? (
                            daySchedules.map(sch => {
                              const shiftDetails = shifts.find(s => s.id === sch.shift_id);
                              const startTime = shiftDetails?.start_time?.slice(0, 5) ?? "";
                              const endTime = shiftDetails?.end_time?.slice(0, 5) ?? "";

                              return (
                                <div
                                  key={sch.id}
                                  className={cn(
                                      "w-full p-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold border flex flex-col gap-0.5 shadow-sm overflow-hidden relative transition-all",
                                      // Visual Hierarchy: Draft vs Published
                                      sch.status === 'DRAFT'
                                        ? "border-dashed border-2 opacity-90 hover:opacity-100"
                                        : "border-solid shadow-md",
                                      // Visual Pattern for drafts
                                      sch.status === 'DRAFT' && "bg-[image:repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(0,0,0,0.03)_5px,rgba(0,0,0,0.03)_10px)]"
                                  )}
                                  style={{
                                    backgroundColor: sch.shift_color ? `${sch.shift_color}${sch.status === 'DRAFT' ? '10' : '20'}` : "#F3F4F6",
                                    borderColor: sch.shift_color || "#E5E7EB",
                                    color: sch.shift_color ? `color-mix(in srgb, ${sch.shift_color} 100%, black 20%)` : "#374151"
                                  }}
                                >
                                  {/* Draft Indicator Badge */}
                                  {sch.status === 'DRAFT' && (
                                    <div className="absolute top-0 right-0 w-2 h-2 bg-orange-400 rounded-bl-md" title="Bản nháp" />
                                  )}

                                  <div className="flex items-center gap-1 truncate mb-0.5">
                                    <Clock className="w-3 h-3 shrink-0 opacity-70" />
                                    <span className="truncate">{sch.shift_name}</span>
                                  </div>

                                  {/* Compact Time Display */}
                                  {(startTime || endTime) && (
                                     <div className="text-[9px] opacity-80 font-medium pl-4 leading-none">
                                       {startTime} - {endTime}
                                     </div>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <div className={cn(
                                "opacity-20 group-hover/cell:opacity-100 transition-opacity flex flex-col items-center gap-1",
                                isSelected && "opacity-100"
                            )}>
                              <Plus className="w-5 h-5 text-muted-foreground" />
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

      {/* Floating Action Bar for Selection Confirmation */}
      {selectedCells.length > 0 && !isSheetOpen && !selection.isSelecting && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-background border shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-200">
             <div className="flex flex-col">
                <span className="text-sm font-bold flex items-center gap-2">
                    {selectedCells.length} ô đang chọn
                    {hasConflict && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Trùng lịch!</span>}
                </span>
                {hasConflict && <span className="text-[10px] text-muted-foreground opacity-80">Các ô trùng sẽ bị ghi đè hoặc bỏ qua</span>}
             </div>

             <div className="h-8 w-px bg-border" />

             <div className="flex items-center gap-2">
                 <Button variant="ghost" size="sm" onClick={() => { clearSelection(); setSelectedCells([]); }} className="hover:bg-muted/50 rounded-full h-8">
                    Hủy
                 </Button>
                 <Button size="sm" onClick={() => setIsSheetOpen(true)} className="rounded-full shadow-md h-8 px-4">
                    Phân ca
                    <ChevronRight className="w-3 h-3 ml-1" />
                 </Button>
             </div>
        </div>
      )}

      {isSheetOpen && selectedCells.length > 0 && (
        <ScheduleFormSheet
          open={isSheetOpen}
          onOpenChange={(v) => {
              setIsSheetOpen(v);
              if(!v) clearSelection();
          }}
          selectedCells={selectedCells}
          staffList={staff}
          shifts={shifts}
          onSuccess={handleSheetSuccess}
        />
      )}
    </div>
  );
}
