"use client";

import { ScheduleFormSheet } from "@/features/staff/components/schedule-form-sheet";
import { type GridCellCoords, useDragToSelect } from "@/features/staff/hooks/use-drag-select";
import { useGridKeyboard } from "@/features/staff/hooks/use-grid-keyboard";
import type { Shift, StaffProfile, StaffScheduleWithDetails } from "@/features/staff/types";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import {
  addDays,
  format,
  isSameDay,
  startOfWeek,
  subDays
} from "date-fns";
import { vi } from "date-fns/locale";
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MousePointerClick,
  Plus,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface SchedulingGridProps {
  staff: StaffProfile[];
  shifts: Shift[];
  schedules: StaffScheduleWithDetails[];
  currentDate: Date;
}

export function SchedulingGrid({ staff, shifts, schedules, currentDate }: SchedulingGridProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedCells, setSelectedCells] = useState<GridCellCoords[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false); // Touch-friendly selection mode

  const start = startOfWeek(currentDate, { weekStartsOn: 1 });

  // Mobile shows fewer days for better usability
  const daysToShow = isMobile ? 3 : 7;
  const allWeekDays = useMemo(() => [...Array(7)].map((_, i) => addDays(start, i)), [start]);

  // Calculate which days to show on mobile (centered around current day or start of selection)
  const [mobileStartIndex, setMobileStartIndex] = useState(0);
  const weekDays = useMemo(() => {
    if (!isMobile) return allWeekDays;
    return allWeekDays.slice(mobileStartIndex, mobileStartIndex + daysToShow);
  }, [isMobile, allWeekDays, mobileStartIndex, daysToShow]);

  // --- Optimization: O(1) Lookup Map ---
  const scheduleMap = useMemo(() => {
    const map = new Map<string, StaffScheduleWithDetails[]>();
    schedules.forEach(s => {
      // Create key: staffId_date(YYYY-MM-DD)
      const dateKey = format(new Date(s.work_date), "yyyy-MM-dd");
      const key = `${s.staff_id}_${dateKey}`;

      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    return map;
  }, [schedules]);

  const {
    handlePointerDown,
    handlePointerEnter,
    handlePointerUp,
    clearSelection,
    isCellSelected: isDragSelected,
    selection
  } = useDragToSelect();

  // Handle Selection Finalization Logic (Sync with hook state)
  // We use the hook's returned state (selection) to drive visual feedback,
  // but we need to compute the *actual* selected cells when drag ends.
  // The hook provides `onSelectionComplete` but let's stick to the previous effect pattern
  // if we want to batch computations, or refactor to be cleaner.
  // Current pattern: Hook tracks "box", we compute "cells" on drag end.
  // Handle Selection Finalization Logic
  // Use useEffect instead of useMemo to avoid infinite render loops when updating state.
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
        }

        // CRITICAL: Clear the drag selection to prevent this effect from running again immediately
        // and causing an infinite loop. We transferred state to `selectedCells`.
        clearSelection();
    }
  }, [selection.isSelecting, selection.start, selection.end, staff, weekDays, clearSelection]);

  // Optimize selection lookup for rendering
  const selectedKeys = useMemo(() => {
    const set = new Set<string>();
    selectedCells.forEach(c => set.add(`${c.rowIndex}_${c.colIndex}`));
    return set;
  }, [selectedCells]);

  // Real-time selection count during drag
  const dragSelectionCount = useMemo(() => {
    if (!selection.isSelecting || !selection.start || !selection.end) return 0;
    const minCol = Math.min(selection.start.colIndex, selection.end.colIndex);
    const maxCol = Math.max(selection.start.colIndex, selection.end.colIndex);
    const minRow = Math.min(selection.start.rowIndex, selection.end.rowIndex);
    const maxRow = Math.max(selection.start.rowIndex, selection.end.rowIndex);
    return (maxCol - minCol + 1) * (maxRow - minRow + 1);
  }, [selection]);

  // Conflict Detection with details
  const conflictDetails = useMemo(() => {
    const conflicts: { staffName: string; date: string; existingShift: string }[] = [];
    selectedCells.forEach(cell => {
      const key = `${cell.staffId}_${cell.dateStr}`;
      const existing = scheduleMap.get(key);
      if (existing && existing.length > 0) {
        const staffMember = staff.find(s => s.user_id === cell.staffId);
        conflicts.push({
          staffName: staffMember?.full_name || "Nhân viên",
          date: format(new Date(cell.dateStr), "dd/MM"),
          existingShift: existing[0].shift_name || "Ca làm",
        });
      }
    });
    return conflicts;
  }, [selectedCells, scheduleMap, staff]);

  const hasConflict = conflictDetails.length > 0;

  // Keyboard navigation
  const gridRef = useRef<HTMLTableElement>(null);
  const formatDateForKeyboard = useCallback((date: Date) => format(date, "yyyy-MM-dd"), []);

  const {
    handleKeyDown,
    isCellFocused,
    focusCell,
  } = useGridKeyboard({
    totalRows: staff.length,
    totalCols: 7,
    staff,
    weekDays,
    formatDate: formatDateForKeyboard,
    enabled: !isSheetOpen,
  });


  const handleSheetSuccess = () => {
      router.refresh(); // Refresh Server Data
      clearSelection();
      setSelectedCells([]);
  }

  const navigateWeek = (type: "prev" | "next" | "today") => {
    let newDate = new Date(currentDate);
    if (type === "prev") newDate = subDays(currentDate, 7);
    if (type === "next") newDate = addDays(currentDate, 7);
    if (type === "today") newDate = new Date();

    // Update URL - This triggers Server Page re-render with new data
    const dateStr = format(newDate, "yyyy-MM-dd");
    const params = new URLSearchParams(window.location.search);
    params.set("date", dateStr);
    router.push(`?${params.toString()}`);
  };

  // Empty state when no staff
  if (staff.length === 0) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="flex flex-col items-center justify-center py-16 px-4 gap-4">
          <div className="rounded-full bg-muted p-4">
            <Users className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-foreground">Chưa có nhân viên nào đang hoạt động</p>
            <p className="text-xs text-muted-foreground">Thêm nhân viên và kích hoạt trạng thái để bắt đầu lập lịch.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", selection.isSelecting && "cursor-crosshair")}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateWeek("prev")} className="h-9 w-9">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 px-3 h-9 border rounded-md bg-muted/20">
            <CalendarIcon className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium whitespace-nowrap capitalize">
              Tuần {format(start, "dd/MM/yyyy", { locale: vi })}
            </span>
          </div>
          <Button variant="outline" size="icon" onClick={() => navigateWeek("next")} className="h-9 w-9">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile: Select Mode Toggle */}
          {isMobile && (
            <Button
              variant={isSelectMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsSelectMode(!isSelectMode)}
              className="h-9 px-3 gap-2"
            >
              <MousePointerClick className="w-4 h-4" />
              <span className="hidden sm:inline">{isSelectMode ? "Thoát chọn" : "Chọn ô"}</span>
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigateWeek("today")}
            className="h-9 px-4 font-medium"
          >
            HÔM NAY
          </Button>
        </div>
      </div>

      {/* Mobile Day Navigation */}
      {isMobile && (
        <div className="flex items-center justify-between gap-2 px-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileStartIndex(prev => Math.max(0, prev - 1))}
            disabled={mobileStartIndex === 0}
            className="h-8 px-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            Đang xem {daysToShow}/{7} ngày - vuốt để xem thêm
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileStartIndex(prev => Math.min(7 - daysToShow, prev + 1))}
            disabled={mobileStartIndex >= 7 - daysToShow}
            className="h-8 px-2"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden"
           onPointerUp={handlePointerUp}> {/* Catch pointer up bubble */}
        <div className="overflow-x-auto relative scrollbar-hide">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="p-4 text-left border-r border-border min-w-[200px] sticky left-0 z-20 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Nhân viên</span>
                </th>
                {weekDays.map((day) => {
                  const isToday = isSameDay(day, new Date());
                  return (
                    <th key={day.toISOString()} className={cn(
                      "p-3 text-center border-r border-border/50 min-w-[140px] last:border-r-0",
                      isToday && "bg-primary/5"
                    )}>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[10px] uppercase font-bold tracking-tight text-muted-foreground">
                          {format(day, "EEEE", { locale: vi })}
                        </span>
                        <span className={cn(
                          "text-lg font-black tracking-tight",
                          isToday ? "text-primary" : "text-foreground"
                        )}>
                          {format(day, "dd/MM")}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {staff.map((s, rowIndex) => (
                <tr key={s.user_id} className="group hover:bg-muted/5 transition-colors">
                  <td className="p-3 border-b border-r border-border sticky left-0 z-20 bg-card group-hover:bg-muted/5 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                        <span className="text-[10px] font-bold text-primary">{s.full_name.charAt(0)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground leading-tight">{s.full_name}</span>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5">{s.title}</span>
                      </div>
                    </div>
                  </td>
                  {weekDays.map((day, colIndex) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const key = `${s.user_id}_${dateStr}`;
                    // O(1) Lookup
                    const daySchedules = scheduleMap.get(key) || [];
                    // Check selection: Either currently dragging OR finalized selection
                    const isSelected = isDragSelected(colIndex, rowIndex) || selectedKeys.has(`${rowIndex}_${colIndex}`);
                    const isToday = isSameDay(day, new Date());

                    const cellCoords = { staffId: s.user_id, dateStr, colIndex, rowIndex };

                    return (
                      <td
                        key={key}
                        tabIndex={0}
                        role="gridcell"
                        aria-selected={isSelected}
                        className={cn(
                          "p-1.5 border-b border-r border-border/50 last:border-r-0 cursor-pointer relative select-none transition-colors outline-none",
                          // Allow touch scroll except when in select mode
                          !isSelectMode && "touch-auto",
                          isSelectMode && "touch-none",
                          isToday && "bg-primary/5",
                          isSelected && "bg-primary/20 ring-inset ring-1 ring-primary/30",
                          isCellFocused(rowIndex, colIndex) && "ring-2 ring-primary ring-offset-1",
                          // Visual hint when select mode is active on mobile
                          isSelectMode && !isSelected && "after:absolute after:inset-0 after:border-2 after:border-dashed after:border-primary/20 after:rounded-sm after:pointer-events-none"
                        )}
                        onPointerDown={(e) => {
                          // On mobile in select mode, use tap-to-toggle instead of drag
                          if (isMobile && isSelectMode) {
                            e.preventDefault();
                            // Toggle cell in selection
                            const cellKey = `${rowIndex}_${colIndex}`;
                            if (selectedKeys.has(cellKey)) {
                              setSelectedCells(prev => prev.filter(c => !(c.rowIndex === rowIndex && c.colIndex === colIndex)));
                            } else {
                              setSelectedCells(prev => [...prev, cellCoords]);
                            }
                            return;
                          }
                          // Desktop: normal drag-to-select
                          handlePointerDown(cellCoords, e);
                        }}
                        onPointerEnter={() => handlePointerEnter(cellCoords)}
                        onFocus={() => focusCell(rowIndex, colIndex)}
                        onKeyDown={handleKeyDown}
                      >
                        <div className="min-h-[64px] h-full flex flex-col gap-1 w-full justify-center">
                          {daySchedules.length > 0 ? (
                            daySchedules.map(sch => (
                                <ScheduleBadge key={sch.id} schedule={sch} shifts={shifts} />
                            ))
                          ) : (
                            <div className={cn(
                                "h-full w-full rounded-md flex items-center justify-center opacity-0 transition-all duration-200",
                                "group-hover/cell:opacity-100 group-hover:bg-muted/10",
                                isSelected && "opacity-100",
                                isSelectMode && "opacity-50"
                            )}>
                              <Plus className="w-4 h-4 text-muted-foreground/50" />
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

      {/* Real-time Drag Counter */}
      {selection.isSelecting && dragSelectionCount > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground border shadow-xl rounded-full px-4 py-2 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-100">
          <span className="text-sm font-bold">{dragSelectionCount} ô</span>
        </div>
      )}

      {/* Floating Action Bar */}
      {selectedCells.length > 0 && !isSheetOpen && !selection.isSelecting && (
        <TooltipProvider>
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-popover border shadow-xl rounded-full px-6 py-2.5 flex items-center gap-4 animate-in slide-in-from-bottom-5 fade-in zoom-in-95 duration-200">
             <div className="flex flex-col">
                <span className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {selectedCells.length}
                    </span>
                    ô đang chọn
                    {hasConflict && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-bold uppercase tracking-wider cursor-help flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {conflictDetails.length} trùng lặp
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="text-xs space-y-1">
                            <p className="font-semibold">Các ô đã có lịch:</p>
                            <ul className="list-disc pl-4">
                              {conflictDetails.slice(0, 5).map((c, i) => (
                                <li key={i}>{c.staffName} - {c.date}: {c.existingShift}</li>
                              ))}
                              {conflictDetails.length > 5 && (
                                <li>...và {conflictDetails.length - 5} ô khác</li>
                              )}
                            </ul>
                            <p className="text-muted-foreground mt-2">Tiếp tục sẽ tạo thêm ca trùng.</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                </span>
             </div>

             <div className="h-6 w-px bg-border" />

             <div className="flex items-center gap-2">
                 <Button variant="ghost" size="sm" onClick={() => { clearSelection(); setSelectedCells([]); }} className="h-8 rounded-full px-3 text-muted-foreground hover:text-foreground">
                    Hủy
                 </Button>
                 <Button size="sm" onClick={() => setIsSheetOpen(true)} className="h-8 rounded-full px-4 shadow-sm">
                    Phân ca
                    <ChevronRight className="w-3 h-3 ml-1" />
                 </Button>
             </div>
        </div>
        </TooltipProvider>
      )}

      {isSheetOpen && selectedCells.length > 0 && (
        <ScheduleFormSheet
          open={isSheetOpen}
          onOpenChange={(v) => {
              setIsSheetOpen(v);
              if(!v) {
                clearSelection();
                setSelectedCells([]);
              }
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

// Sub-component for better maintainability and performance
function ScheduleBadge({ schedule: sch, shifts }: { schedule: StaffScheduleWithDetails, shifts: Shift[] }) {
    const shiftDetails = shifts.find(s => s.id === sch.shift_id);
    const startTime = shiftDetails?.start_time?.slice(0, 5) ?? "";
    const endTime = shiftDetails?.end_time?.slice(0, 5) ?? "";
    const color = sch.shift_color || "#94a3b8"; // Default slate-400

    // Check luminance to set text color? Simple contrast for now.
    // Instead of complex inline color-mix, we use CSS vars or simple logic
    const isDraft = sch.status === 'DRAFT';

    return (
        <div
        className={cn(
            "w-full px-2 py-1.5 rounded-md text-[10px] sm:text-[11px] font-bold border shadow-sm flex flex-col gap-0.5 relative overflow-hidden group/badge",
            isDraft && "border-dashed opacity-90 hover:opacity-100 bg-[image:repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(0,0,0,0.03)_5px,rgba(0,0,0,0.03)_10px)]"
        )}
        style={{
            backgroundColor: `${color}15`, // 15% opacity hex
            borderColor: `${color}40`, // 40% opacity border
            color: `color-mix(in srgb, ${color} 100%, black 40%)` // Darken text
        }}
        >
        {isDraft && (
            <div className="absolute top-0 right-0 w-2 h-2 bg-amber-400 rounded-bl-md z-10" />
        )}

        <div className="flex items-center gap-1.5 truncate">
            <Clock className="w-3 h-3 shrink-0 opacity-60" />
            <span className="truncate">{sch.shift_name}</span>
        </div>

        {(startTime || endTime) && (
            <div className="text-[9px] opacity-70 font-medium pl-4 leading-none">
            {startTime} - {endTime}
            </div>
        )}
        </div>
    );
}
