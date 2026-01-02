"use client";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCallback, useEffect } from "react";

type CalendarView = "day" | "week" | "month";

interface CalendarToolbarProps {
  currentDate: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onNavigate: (date: Date) => void;
  onDateClick?: () => void;
  className?: string;
  showViewSwitcher?: boolean;
  availableViews?: CalendarView[];
}

const VIEW_LABELS: Record<CalendarView, string> = {
  day: "Ngày",
  week: "Tuần",
  month: "Tháng",
};

function getDateRangeLabel(date: Date, view: CalendarView): string {
  switch (view) {
    case "day":
      return format(date, "EEEE, dd/MM/yyyy", { locale: vi });
    case "week": {
      const start = startOfWeek(date, { weekStartsOn: 1 });
      const end = endOfWeek(date, { weekStartsOn: 1 });
      const sameMonth = start.getMonth() === end.getMonth();
      if (sameMonth) {
        return `${format(start, "dd")} - ${format(end, "dd/MM/yyyy")}`;
      }
      return `${format(start, "dd/MM")} - ${format(end, "dd/MM/yyyy")}`;
    }
    case "month":
      return format(date, "MMMM yyyy", { locale: vi });
    default:
      return format(date, "dd/MM/yyyy");
  }
}

function navigateDate(date: Date, view: CalendarView, direction: "prev" | "next"): Date {
  const isPrev = direction === "prev";
  switch (view) {
    case "day":
      return isPrev ? subDays(date, 1) : addDays(date, 1);
    case "week":
      return isPrev ? subWeeks(date, 1) : addWeeks(date, 1);
    case "month":
      return isPrev ? subMonths(date, 1) : addMonths(date, 1);
    default:
      return date;
  }
}

export function CalendarToolbar({
  currentDate,
  view,
  onViewChange,
  onNavigate,
  onDateClick,
  className,
  showViewSwitcher = true,
  availableViews = ["day", "week", "month"],
}: CalendarToolbarProps) {
  const dateLabel = getDateRangeLabel(currentDate, view);

  const handlePrev = useCallback(() => {
    onNavigate(navigateDate(currentDate, view, "prev"));
  }, [currentDate, view, onNavigate]);

  const handleNext = useCallback(() => {
    onNavigate(navigateDate(currentDate, view, "next"));
  }, [currentDate, view, onNavigate]);

  const handleToday = useCallback(() => {
    onNavigate(new Date());
  }, [onNavigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "d":
          if (availableViews.includes("day")) onViewChange("day");
          break;
        case "w":
          if (availableViews.includes("week")) onViewChange("week");
          break;
        case "m":
          if (availableViews.includes("month")) onViewChange("month");
          break;
        case "t":
          handleToday();
          break;
        case "arrowleft":
          if (!e.ctrlKey && !e.metaKey) handlePrev();
          break;
        case "arrowright":
          if (!e.ctrlKey && !e.metaKey) handleNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [availableViews, onViewChange, handleToday, handlePrev, handleNext]);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrev}
          className="h-9 w-9"
          aria-label="Khoảng thời gian trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <button
          type="button"
          onClick={onDateClick}
          disabled={!onDateClick}
          className={cn(
            "flex items-center gap-2 px-3 h-9 border rounded-md bg-muted/20 transition-colors",
            onDateClick && "hover:bg-muted/40 cursor-pointer"
          )}
        >
          <CalendarIcon className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium whitespace-nowrap capitalize">
            {dateLabel}
          </span>
        </button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          className="h-9 w-9"
          aria-label="Khoảng thời gian sau"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {showViewSwitcher && availableViews.length > 1 && (
          <Tabs value={view} onValueChange={(v: string) => onViewChange(v as CalendarView)}>
            <TabsList size="sm">
              {availableViews.map((v) => (
                <TabsTrigger key={v} value={v}>
                  {VIEW_LABELS[v]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          className="h-9 px-4 font-medium"
        >
          HÔM NAY
        </Button>
      </div>
    </div>
  );
}
