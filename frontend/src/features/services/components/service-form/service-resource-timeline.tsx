"use client";

import { cn } from "@/shared/lib/utils";
import { useFormContext } from "react-hook-form";
import { type ServiceCreateForm } from "../../schemas";
import type { ResourceGroup, ResourceGroupWithCount } from "../../types";

interface ServiceResourceTimelineProps {
  resourceGroups: ResourceGroupWithCount[] | ResourceGroup[];
}

export function ServiceResourceTimeline({ resourceGroups }: ServiceResourceTimelineProps) {
  const form = useFormContext<ServiceCreateForm>();
  const duration = form.watch("duration") || 60;
  const buffer = form.watch("buffer_time") || 0;
  const requirements = form.watch("resource_requirements") || [];

  const total = duration + buffer;

  // Calculate grid intervals (every 15 mins)
  const intervals = [];
  for (let i = 0; i <= total; i += 15) {
    intervals.push(i);
  }
  // Ensure the last marker is included if it's not a multiple of 15
  if (total % 15 !== 0) {
    intervals.push(total);
  }

  const getGroupName = (groupId: string) => {
    return resourceGroups.find(g => g.id === groupId)?.name || "Chưa chọn nhóm";
  };

  return (
    <div className="border rounded-xl p-5 bg-card/50 backdrop-blur-sm shadow-sm space-y-6 overflow-hidden">
      {/* Time Header */}
      <div className="relative h-6 mb-2 border-b border-dashed border-border/50">
        {intervals.map((time) => (
          <div
            key={time}
            className="absolute top-0 flex flex-col items-center -translate-x-1/2"
            style={{ left: `${(time / total) * 100}%` }}
          >
            <span className="text-[9px] font-bold text-muted-foreground/80 tabular-nums">
              {time}m
            </span>
            <div className="h-1 w-px bg-border/60 mt-0.5" />
          </div>
        ))}
      </div>

      {/* Gantt Area */}
      <div className="relative space-y-3 min-h-[40px]">
        {/* Background Grid */}
        <div className="absolute inset-0 flex pointer-events-none z-0">
          {intervals.map((time) => (
            <div
              key={`grid-${time}`}
              className="h-full border-r border-muted/20 last:border-0"
              style={{ width: `${(15 / total) * 100}%` }}
            />
          ))}
        </div>

        {/* Global Service Scope (Light Background) */}
        <div
          className="absolute inset-y-0 left-0 bg-primary/[0.03] border-r border-primary/10 rounded-l-md pointer-events-none"
          style={{ width: `${(duration / total) * 100}%` }}
        />

        {/* Buffer Scope (Hatched Background) */}
        <div
          className="absolute inset-y-0 right-0 bg-orange-500/[0.04] rounded-r-md overflow-hidden pointer-events-none"
          style={{ width: `${(buffer / total) * 100}%` }}
        >
          <div className="w-full h-full opacity-10 bg-[image:repeating-linear-gradient(45deg,var(--color-orange-500)_0,var(--color-orange-500)_1px,transparent_0,transparent_4px)] [background-size:6px_6px]" />
        </div>

        {/* Requirements Rows */}
        {requirements.length > 0 ? (
          requirements.map((req, index) => {
            const start = req.start_delay || 0;
            const usage = req.usage_duration || (duration - start);

            const left = (start / total) * 100;
            const width = (usage / total) * 100;
            const groupName = getGroupName(req.group_id);

            return (
              <div key={index} className="relative h-8 flex items-center group/row">
                {/* Row Label (Visible on hover or if space permits) */}
                <div className="absolute -left-1 opacity-0 group-hover/row:opacity-100 transition-opacity bg-background/90 px-2 py-0.5 rounded border text-[10px] font-medium z-30 pointer-events-none whitespace-nowrap shadow-sm">
                  {groupName} ({usage}p)
                </div>

                {/* Resource Bar */}
                <div
                  className={cn(
                    "absolute h-5 rounded-md border transition-all duration-300 z-20",
                    "bg-primary/80 border-primary/30 shadow-[0_1px_3px_rgba(0,0,0,0.2)]",
                    "hover:scale-[1.02] hover:bg-primary",
                    "flex items-center px-2 cursor-help"
                  )}
                  style={{
                    left: `${Math.max(0, Math.min(100, left))}%`,
                    width: `${Math.max(1, Math.min(100 - left, width))}%`,
                  }}
                  title={`${groupName}: Bắt đầu sau ${start}p, Dùng trong ${usage}p`}
                >
                  <span className="text-[9px] font-bold text-primary-foreground leading-none truncate select-none">
                    {groupName}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-8 flex items-center justify-center border border-dashed rounded-lg bg-muted/5">
             <span className="text-[11px] text-muted-foreground italic">Chưa cấu hình tài nguyên</span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-[10px] font-semibold text-muted-foreground/70 pt-2 border-t border-border/40">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-muted/50 transition-colors">
          <div className="w-3 h-3 bg-primary/80 border border-primary/30 rounded-full shadow-sm" /> Tài nguyên sử dụng
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-muted/50 transition-colors">
          <div className="w-3 h-3 bg-primary/10 border border-primary/20 rounded-sm" /> Thời gian liệu trình
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-muted/50 transition-colors">
          <div className="w-3 h-3 bg-orange-500/10 border border-orange-500/20 rounded-sm overflow-hidden relative">
              <div className="absolute inset-0 opacity-20 bg-[image:repeating-linear-gradient(45deg,var(--color-orange-500)_0,var(--color-orange-500)_1px,transparent_0,transparent_3px)] [background-size:4px_4px]" />
          </div> Nghỉ/Chuẩn bị
        </div>
      </div>
    </div>
  );
}
