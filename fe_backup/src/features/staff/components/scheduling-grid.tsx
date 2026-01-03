"use client";

import { ScheduleFormSheet } from "@/features/staff/components/schedule-form-sheet";
import {
  type GridCellCoords,
  useDragToSelect,
} from "@/features/staff/hooks/use-drag-select";
import { useGridKeyboard } from "@/features/staff/hooks/use-grid-keyboard";
import type {
  Shift,
  StaffProfile,
  StaffScheduleWithDetails,
} from "@/features/staff/types";
import { CalendarToolbar } from "@/shared/components/calendar-toolbar";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  MousePointerClick,
  Plus,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const MOBILE_DAYS_TO_SHOW = 3;
const DESKTOP_DAYS_TO_SHOW = 7;
const TOTAL_WEEK_DAYS = 7;

interface SchedulingGridProps {
  staff: StaffProfile[];
  shifts: Shift[];
  schedules: StaffScheduleWithDetails[];
  currentDate: Date;
}

export function SchedulingGrid({
  staff,
  shifts,
  schedules,
  currentDate,
}: SchedulingGridProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedCells, setSelectedCells] = useState<GridCellCoords[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  const start = startOfWeek(currentDate, { weekStartsOn: 1 });

  const daysToShow = isMobile ? MOBILE_DAYS_TO_SHOW : DESKTOP_DAYS_TO_SHOW;
  const allWeekDays = useMemo(
    () => [...Array(TOTAL_WEEK_DAYS)].map((_, i) => addDays(start, i)),
    [start]
  );

  const [mobileStartIndex, setMobileStartIndex] = useState(0);
  const weekDays = useMemo(() => {
    if (!isMobile) return allWeekDays;
    return allWeekDays.slice(mobileStartIndex, mobileStartIndex + daysToShow);
  }, [isMobile, allWeekDays, mobileStartIndex, daysToShow]);

  const scheduleMap = useMemo(() => {
    const map = new Map<string, StaffScheduleWithDetails[]>();
    schedules.forEach((s) => {
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
    selection,
  } = useDragToSelect();

  // Keyboard navigation
  const gridRef = useRef<HTMLTableElement>(null);
  const formatDateForKeyboard = useCallback(
    (date: Date) => format(date, "yyyy-MM-dd"),
    []
  );

  const {
    handleKeyDown,
    isCellFocused,
    focusCell,
    setKeyboardSelection,
    clearSelection: clearKeyboardSelection,
    focusedCell,
  } = useGridKeyboard({
    totalRows: staff.length,
    totalCols: TOTAL_WEEK_DAYS,
    staff,
    weekDays,
    formatDate: formatDateForKeyboard,
    onSelectionChange: setSelectedCells,
    enabled: !isSheetOpen,
  });

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
          if (s) {
            cells.push({
              staffId: s.user_id,
              dateStr: format(weekDays[c], "yyyy-MM-dd"),
              rowIndex: r,
              colIndex: c,
            });
          }
        }
      }

      if (cells.length > 0) {
        setSelectedCells(cells);
        setKeyboardSelection(cells);
      }

      // CRITICAL: Clear the drag selection to prevent this effect from running again immediately
      // and causing an infinite loop. We transferred state to `selectedCells`.
      clearSelection();
    }
  }, [
    selection.isSelecting,
    selection.start,
    selection.end,
    staff,
    weekDays,
    clearSelection,
    setKeyboardSelection,
  ]);

  // Optimize selection lookup for rendering
  const selectedKeys = useMemo(() => {
    const set = new Set<string>();
    selectedCells.forEach((c) => set.add(`${c.rowIndex}_${c.colIndex}`));
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
    const conflicts: {
      staffName: string;
      date: string;
      existingShift: string;
    }[] = [];
    selectedCells.forEach((cell) => {
      const key = `${cell.staffId}_${cell.dateStr}`;
      const existing = scheduleMap.get(key);
      if (existing && existing.length > 0) {
        const staffMember = staff.find((s) => s.user_id === cell.staffId);
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


  // Sync DOM focus when focusedCell changes
  useEffect(() => {
    if (focusedCell && gridRef.current) {
      const cell = gridRef.current.querySelector(
        `[data-row="${focusedCell.rowIndex}"][data-col="${focusedCell.colIndex}"]`
      ) as HTMLElement;
      if (cell) {
        cell.focus();
      }
    }
  }, [focusedCell]);

  const handleSheetSuccess = () => {
    router.refresh(); // Refresh Server Data
    clearSelection();
    clearKeyboardSelection();
    setSelectedCells([]);
  };

  const handleNavigate = useCallback(
    (newDate: Date) => {
      const dateStr = format(newDate, "yyyy-MM-dd");
      const params = new URLSearchParams(window.location.search);
      params.set("date", dateStr);
      router.push(`?${params.toString()}`);
    },
    [router]
  );

  // Empty state when no staff
  if (staff.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/5 overflow-hidden">
        <div className="flex flex-col items-center justify-center py-16 px-4 gap-4">
          <div className="rounded-full bg-muted/50 p-4">
            <Users className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-foreground">
              Chưa có nhân viên nào đang hoạt động
            </p>
            <p className="text-xs text-muted-foreground">
              Thêm nhân viên và kích hoạt trạng thái để bắt đầu lập lịch.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full max-w-full space-y-4",
        selection.isSelecting && "cursor-crosshair"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <CalendarToolbar
          currentDate={currentDate}
          view="week"
          onViewChange={() => {}}
          onNavigate={handleNavigate}
          showViewSwitcher={false}
        />

        <div className="flex items-center gap-2">
          {isMobile && (
            <Button
              variant={isSelectMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsSelectMode(!isSelectMode)}
              className="h-9 px-3 gap-2"
            >
              <MousePointerClick className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isSelectMode ? "Thoát chọn" : "Chọn ô"}
              </span>
            </Button>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <span className="text-xs font-bold">?</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="w-64 p-3 selection:bg-primary/10">
                <div className="space-y-2">
                  <p className="font-bold text-xs uppercase text-primary tracking-wider">Phím tắt & Thao tác</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                    <span className="text-muted-foreground italic">Di chuyển:</span>
                    <span className="font-medium">Phím mũi tên</span>

                    <span className="text-muted-foreground italic">Chọn dải ô:</span>
                    <span className="font-medium">Shift + Mũi tên</span>

                    <span className="text-muted-foreground italic">Chọn tất cả:</span>
                    <span className="font-medium">Ctrl + A</span>

                    <span className="text-muted-foreground italic">Mở phân ca:</span>
                    <span className="font-medium">Enter / Space</span>

                    <span className="text-muted-foreground italic">Hủy chọn:</span>
                    <span className="font-medium">Esc / Click ngoài</span>

                    <span className="text-muted-foreground italic">Chọn nhanh:</span>
                    <span className="font-medium">Kéo chuột (Drag)</span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Mobile Day Navigation */}
      {isMobile && (
        <div className="flex items-center justify-between gap-2 px-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileStartIndex((prev) => Math.max(0, prev - 1))}
            disabled={mobileStartIndex === 0}
            className="h-8 px-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            Đang xem {daysToShow}/{TOTAL_WEEK_DAYS} ngày - vuốt để xem thêm
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setMobileStartIndex((prev) =>
                Math.min(TOTAL_WEEK_DAYS - daysToShow, prev + 1)
              )
            }
            disabled={mobileStartIndex >= TOTAL_WEEK_DAYS - daysToShow}
            className="h-8 px-2"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div
        className="w-full rounded-xl overflow-hidden border"
        onPointerUp={handlePointerUp}
      >
        {" "}
        {/* Catch pointer up bubble */}
        <div className="w-full overflow-x-auto relative scrollbar-hide">
          <table ref={gridRef} className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="p-4 text-left border-r border-border min-w-[200px] sticky left-0 z-20 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                    Nhân viên
                  </span>
                </th>
                {weekDays.map((day) => {
                  const isToday = isSameDay(day, new Date());
                  return (
                    <th
                      key={day.toISOString()}
                      className={cn(
                        "p-3 text-center border-r border-border/50 min-w-[140px] last:border-r-0",
                        isToday && "bg-primary/5"
                      )}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs uppercase font-semibold tracking-tight text-muted-foreground">
                          {format(day, "EEEE", { locale: vi })}
                        </span>
                        <span
                          className={cn(
                            "text-lg font-black tracking-tight",
                            isToday ? "text-primary" : "text-foreground"
                          )}
                        >
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
                <tr
                  key={s.user_id}
                  className="group hover:bg-muted/5 transition-colors"
                >
                  <td className="p-3 border-b border-r border-border sticky left-0 z-20 bg-card group-hover:bg-muted/5 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                        <span className="text-xs font-semibold text-primary">
                          {s.full_name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-foreground leading-tight">
                          {s.full_name}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium uppercase mt-0.5">
                          {s.title}
                        </span>
                      </div>
                    </div>
                  </td>
                  {weekDays.map((day, colIndex) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const key = `${s.user_id}_${dateStr}`;
                    const cellSchedules = scheduleMap.get(key) || [];
                    const isSelected =
                      isDragSelected(colIndex, rowIndex) ||
                      selectedKeys.has(`${rowIndex}_${colIndex}`);
                    const isToday = isSameDay(day, new Date());
                    const hasCellConflict = isSelected && cellSchedules.length > 0;

                    const cellCoords = {
                      staffId: s.user_id,
                      dateStr,
                      colIndex,
                      rowIndex,
                    };

                    return (
                      <td
                        key={key}
                        tabIndex={0}
                        role="gridcell"
                        data-row={rowIndex}
                        data-col={colIndex}
                        aria-selected={isSelected}
                        className={cn(
                          "p-1.5 border-b border-r border-border/50 last:border-r-0 cursor-pointer relative select-none transition-all outline-none",
                          // Allow touch scroll except when in select mode
                          !isSelectMode && "touch-auto",
                          isSelectMode && "touch-none",
                          isToday && "bg-primary/5",
                          isSelected && !hasCellConflict &&
                            "bg-primary/15 ring-inset ring-1 ring-primary/40 shadow-[inset_0_0_10px_rgba(var(--primary-rgb),0.05)]",
                          isSelected && hasCellConflict &&
                            "bg-destructive/15 ring-inset ring-1 ring-destructive/40",
                          isCellFocused(rowIndex, colIndex) &&
                            "ring-2 ring-primary ring-offset-0 z-10 scale-[1.02] shadow-lg",
                          // Visual hint when select mode is active on mobile
                          isSelectMode &&
                            !isSelected &&
                            "after:absolute after:inset-0 after:border-2 after:border-dashed after:border-primary/20 after:rounded-sm after:pointer-events-none"
                        )}
                        onPointerDown={(e) => {
                          // On mobile in select mode, use tap-to-toggle instead of drag
                          if (isMobile && isSelectMode) {
                            e.preventDefault();
                            // Toggle cell in selection
                            const cellKey = `${rowIndex}_${colIndex}`;
                            if (selectedKeys.has(cellKey)) {
                              setSelectedCells((prev) =>
                                prev.filter(
                                  (c) =>
                                    !(
                                      c.rowIndex === rowIndex &&
                                      c.colIndex === colIndex
                                    )
                                )
                              );
                            } else {
                              setSelectedCells((prev) => [...prev, cellCoords]);
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
                          {cellSchedules.length > 0 ? (
                            cellSchedules.map((sch) => (
                              <ScheduleBadge
                                key={sch.id}
                                schedule={sch}
                                shifts={shifts}
                              />
                            ))
                          ) : (
                            <div
                              className={cn(
                                "h-full w-full rounded-md flex items-center justify-center opacity-0 transition-all duration-200",
                                "group-hover/cell:opacity-100 group-hover:bg-muted/10",
                                isSelected && "opacity-100",
                                isSelectMode && "opacity-50"
                              )}
                            >
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
                      <span className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider cursor-help flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {conflictDetails.length} trùng lặp
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="text-xs space-y-1">
                        <p className="font-semibold">Các ô đã có lịch:</p>
                        <ul className="list-disc pl-4">
                          {conflictDetails.slice(0, 5).map((c, i) => (
                            <li key={i}>
                              {c.staffName} - {c.date}: {c.existingShift}
                            </li>
                          ))}
                          {conflictDetails.length > 5 && (
                            <li>...và {conflictDetails.length - 5} ô khác</li>
                          )}
                        </ul>
                        <p className="text-muted-foreground mt-2">
                          Tiếp tục sẽ tạo thêm ca trùng.
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </span>
            </div>

            <div className="h-6 w-px bg-border" />

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearSelection();
                  setSelectedCells([]);
                }}
                className="h-8 rounded-full px-3 text-muted-foreground hover:text-foreground"
              >
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={() => setIsSheetOpen(true)}
                className="h-8 rounded-full px-4 shadow-sm"
              >
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
            if (!v) {
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

function ScheduleBadge({
  schedule: sch,
  shifts,
}: {
  schedule: StaffScheduleWithDetails;
  shifts: Shift[];
}) {
  const shiftDetails = shifts.find((s) => s.id === sch.shift_id);
  const startTime = shiftDetails?.start_time?.slice(0, 5) ?? "";
  const endTime = shiftDetails?.end_time?.slice(0, 5) ?? "";
  const color = sch.shift_color || "#94a3b8";
  const isDraft = sch.status === "DRAFT";

  return (
    <div
      className={cn(
        "w-full px-2 py-1.5 rounded-md text-xs font-semibold border shadow-sm flex flex-col gap-0.5 relative overflow-hidden group/badge",
        "[--shift-color:var(--shift-color-value)]",
        isDraft &&
          "border-dashed opacity-90 hover:opacity-100 bg-[image:repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(0,0,0,0.03)_5px,rgba(0,0,0,0.03)_10px)]"
      )}
      style={
        {
          "--shift-color-value": color,
          backgroundColor: `color-mix(in srgb, var(--shift-color) 15%, transparent)`,
          borderColor: `color-mix(in srgb, var(--shift-color) 40%, transparent)`,
          color: `color-mix(in srgb, var(--shift-color) 100%, black 40%)`,
        } as React.CSSProperties
      }
    >
      {isDraft && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-amber-400 rounded-bl-md z-10" />
      )}

      <div className="flex items-center gap-1.5 truncate">
        <Clock className="w-3 h-3 shrink-0 opacity-60" />
        <span className="truncate">{sch.shift_name}</span>
      </div>

      {(startTime || endTime) && (
        <div className="text-xs opacity-70 font-medium pl-4 leading-none">
          {startTime} - {endTime}
        </div>
      )}
    </div>
  );
}
