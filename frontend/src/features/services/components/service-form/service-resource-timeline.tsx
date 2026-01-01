"use client";

import { useFormContext } from "react-hook-form";
import { type ServiceCreateForm } from "../../schemas";

export function ServiceResourceTimeline() {
  const form = useFormContext<ServiceCreateForm>();
  const duration = form.watch("duration") || 60;
  const buffer = form.watch("buffer_time") || 0;
  const requirements = form.watch("resource_requirements") || [];

  const total = duration + buffer;

  return (
    <div className="border rounded-md p-4 bg-muted/20 space-y-4">
      <div className="flex justify-between items-center text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
        <span className="bg-muted px-1.5 py-0.5 rounded">0p</span>
        <span className="text-primary/80 font-semibold">Tổng thời gian: {total} phút</span>
      </div>

      <div className="relative h-12 bg-background/50 rounded-lg border border-muted-foreground/10 overflow-hidden flex items-center shadow-inner">
        {/* Main Service Area (Duration) */}
        <div
          className="absolute inset-y-0 left-0 bg-primary/10 border-r border-primary/30 z-0"
          style={{
            width: `${(duration / total) * 100}%`
          }}
        />

        {/* Buffer Area */}
        <div
          className="absolute inset-y-0 right-0 bg-orange-500/[0.08] h-full flex items-center justify-center z-0"
          style={{
            width: `${(buffer / total) * 100}%`
          }}
        >
          <div className="w-full h-full opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #f97316 0, #f97316 1px, transparent 0, transparent 4px)', backgroundSize: '6px 6px' }} />
        </div>

        {requirements.map((req, index) => {
          if (!req?.group_id) return null;

          const start = req.start_delay || 0;
          const usage = req.usage_duration || (duration - start);

          const left = (start / total) * 100;
          const width = (usage / total) * 100;

          return (
            <div
              key={index}
              className="absolute h-2 bg-primary/70 rounded-full border border-primary/40 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.1)] z-10"
              style={{
                left: `${Math.max(0, Math.min(100, left))}%`,
                width: `${Math.max(1, Math.min(100 - left, width))}%`,
                top: `${Math.max(4, 4 + index * 10)}px`
              }}
              title={`Tài nguyên ${index + 1}`}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-6 text-[10px] font-medium text-muted-foreground pt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-primary/70 border border-primary/40 rounded-sm shadow-sm" /> Tài nguyên
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-primary/15 border border-primary/30 rounded-sm" /> Trong liệu trình
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-orange-500/10 border border-orange-500/20 rounded-sm overflow-hidden relative">
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #f97316 0, #f97316 1px, transparent 0, transparent 3px)', backgroundSize: '4px 4px' }} />
          </div> Thời gian nghỉ
        </div>
      </div>
    </div>
  );
}
