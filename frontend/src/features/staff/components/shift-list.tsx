"use client";

import { ShiftFormSheet } from "@/features/staff/components/shift-form-sheet";
import type { Shift } from "@/features/staff/types";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Clock, Plus, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ShiftListProps {
  shifts: Shift[];
  variant?: "default" | "flat";
}

export function ShiftList({ shifts, variant = "default" }: ShiftListProps) {
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | undefined>();

  const handleAdd = () => {
    setSelectedShift(undefined);
    setIsSheetOpen(true);
  };

  const handleEdit = (shift: Shift) => {
    setSelectedShift(shift);
    setIsSheetOpen(true);
  };

  const handleSuccess = () => {
    router.refresh();
    setIsSheetOpen(false); // Close sheet on success if desired, or keep open? Usually close.
    // The sheet itself might interact with state, but router.refresh() updates the Server Component props.
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center px-2">
        <Button onClick={handleAdd} size="sm" className="shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          <span>Thêm ca mới</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shifts.length === 0 ? (
          <div className={cn(
            "col-span-full border border-dashed bg-muted/20 rounded-2xl p-12 text-center",
            variant === "flat" && "border-none"
          )}>
            <div className="flex flex-col items-center gap-2">
              <Clock className="w-12 h-12 text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium">Chưa có ca làm việc nào được định nghĩa.</p>
              <Button variant="outline" onClick={handleAdd} className="mt-4 rounded-xl">
                Tạo ca đầu tiên
              </Button>
            </div>
          </div>
        ) : (
          shifts.map((shift) => (
            <div
              key={shift.id}
              className={cn(
                "group relative overflow-hidden transition-all rounded-2xl p-5",
                variant === "flat" ? "border-none shadow-none bg-card/10" : "border border-border/50 shadow-sm hover:shadow-md bg-card"
              )}
            >
              <div
                className="absolute top-0 left-0 w-full h-1.5 opacity-80"
                style={{ backgroundColor: shift.color_code || "#6366F1" }}
              />
              <div className="flex justify-between items-start mb-4">
                <Badge variant="outline" className="rounded-lg px-2 py-0 border-primary/20 bg-primary/5 text-primary">
                  {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleEdit(shift)}
                >
                  <Settings2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
              <div className="space-y-1 mb-4">
                <h4 className="text-lg font-bold truncate text-foreground">{shift.name}</h4>
                <p className="font-medium text-[10px] uppercase tracking-wider text-muted-foreground opacity-70">
                   Khung giờ cố định
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium pt-3 border-t border-border/50">
                <Clock className="w-4 h-4 opacity-50" />
                <span>Thời lượng: {calculateDuration(shift.start_time, shift.end_time)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <ShiftFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        shift={selectedShift}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

function calculateDuration(start: string, end: string) {
  const [sH, sM] = start.split(":").map(Number);
  const [eH, eM] = end.split(":").map(Number);
  let diff = (eH * 60 + eM) - (sH * 60 + sM);
  if (diff < 0) diff += 24 * 60; // Handle overnight shifts if needed

  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  return `${hours}h ${mins > 0 ? `${mins}m` : ""}`;
}

