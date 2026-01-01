"use client";

import { getStaffAction } from "@/features/staff/actions";
import { StaffFormSheet } from "@/features/staff/components/staff-form-sheet";
import type { StaffProfileWithSkills } from "@/features/staff/types";
import type { Column } from "@/shared/components/smart-data-table";
import { DataTable } from "@/shared/components/smart-data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

export function StaffTable() {
  const [data, setData] = useState<StaffProfileWithSkills[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const staff = await getStaffAction();
      const mappedData = staff.map(s => ({ ...s, id: s.user_id }));
      setData(mappedData as any);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns: Column<StaffProfileWithSkills & { id: string }>[] = [
    {
      key: "full_name",
      label: "Họ tên",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: row.color_code }}
          />
          <span className="font-medium text-foreground">{row.full_name}</span>
        </div>
      )
    },
    {
      key: "title",
      label: "Chức danh",
    },
    {
      key: "is_active" as any, // is_active is boolean, render needs it
      label: "Trạng thái",
      render: (_, row) => (
        <Badge variant={row.is_active ? "success" : "secondary"}>
          {row.is_active ? "Đang làm việc" : "Nghỉ việc"}
        </Badge>
      )
    },
    {
      key: "skills" as any,
      label: "Kỹ năng",
      render: (_, row) => (
        <div className="flex flex-wrap gap-1">
          {row.skill_ids.length > 0 ? (
            <Badge variant="outline" className="text-[10px]">
              {row.skill_ids.length} kỹ năng
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground italic">Chưa gán</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
         <Button onClick={() => setIsSheetOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          <span>Thêm nhân sự</span>
        </Button>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        <DataTable
          columns={columns as any}
          data={data as any}
        />
      </div>

      <StaffFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSuccess={fetchData}
      />
    </div>
  );
}
