"use client";

import { getShiftsAction } from "@/features/staff/actions";
import { ShiftFormSheet } from "@/features/staff/components/shift-form-sheet";
import type { Shift } from "@/features/staff/types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { Clock, Plus, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";

export function ShiftList() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | undefined>();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await getShiftsAction();
      setShifts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setSelectedShift(undefined);
    setIsSheetOpen(true);
  };

  const handleEdit = (shift: Shift) => {
    setSelectedShift(shift);
    setIsSheetOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">Danh mục ca làm việc</h3>
          <p className="text-sm text-muted-foreground font-medium">Cấu hình khung giờ hoạt động của Spa.</p>
        </div>
        <Button onClick={handleAdd} className="rounded-xl h-11 px-6 shadow-sm shadow-primary/10">
          <Plus className="w-4 h-4 mr-2" />
          <span>Thêm ca mới</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))
        ) : shifts.length === 0 ? (
          <Card className="col-span-full border-dashed bg-muted/20 rounded-2xl p-12 text-center">
            <div className="flex flex-col items-center gap-2">
              <Clock className="w-12 h-12 text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium">Chưa có ca làm việc nào được định nghĩa.</p>
              <Button variant="outline" onClick={handleAdd} className="mt-4 rounded-xl">
                Tạo ca đầu tiên
              </Button>
            </div>
          </Card>
        ) : (
          shifts.map((shift) => (
            <Card key={shift.id} className="group relative overflow-hidden border-none shadow-sm hover:shadow-md transition-all rounded-2xl bg-card">
              <div
                className="absolute top-0 left-0 w-full h-1.5 opacity-80"
                style={{ backgroundColor: shift.color_code || "#6366F1" }}
              />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
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
                <CardTitle className="text-lg font-bold mt-2 truncate">{shift.name}</CardTitle>
                <CardDescription className="font-medium text-xs uppercase tracking-wider opacity-60">
                   Khung giờ cố định
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                  <Clock className="w-4 h-4 opacity-50" />
                  <span>Thời lượng: {calculateDuration(shift.start_time, shift.end_time)}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ShiftFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        shift={selectedShift}
        onSuccess={fetchData}
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
