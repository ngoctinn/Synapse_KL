"use client";

import { StaffFormSheet } from "@/features/staff/components/staff-form-sheet";
import type { StaffProfileWithSkills } from "@/features/staff/types";
import type { Column } from "@/shared/components/smart-data-table";
import { DataTable } from "@/shared/components/smart-data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/shared/ui/dropdown-menu";
import { Edit, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface StaffTableProps {
  data: StaffProfileWithSkills[];
}

export function StaffTable({ data }: StaffTableProps) {
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffProfileWithSkills | undefined>(undefined);

  // Map data to ensure consistency if needed, though simpler is better
  const tableData = data.map(s => ({
    ...s,
    id: s.user_id // DataTable often requires an 'id' field
  }));

  const handleEdit = (staff: StaffProfileWithSkills) => {
    setSelectedStaff(staff);
    setIsSheetOpen(true);
  };

  const handleCreate = () => {
    setSelectedStaff(undefined);
    setIsSheetOpen(true);
  };

  const columns: Column<StaffProfileWithSkills & { id: string }>[] = [
    {
      key: "full_name",
      label: "Họ tên",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs border bg-muted"
            style={{
              backgroundColor: row.color_code ? `${row.color_code}20` : undefined,
              color: row.color_code,
              borderColor: row.color_code ? `${row.color_code}40` : undefined
            }}
          >
            {row.full_name.charAt(0)}
          </div>
          <div className="flex flex-col">
             <span className="font-medium text-foreground text-sm">{row.full_name}</span>
             <span className="text-[10px] text-muted-foreground uppercase">{row.user_id.slice(0, 8)}</span>
          </div>
        </div>
      )
    },
    {
      key: "title",
      label: "Chức danh",
      render: (val) => <span className="text-sm font-medium">{val as string}</span>
    },
    {
      key: "is_active",
      label: "Trạng thái",
      render: (_, row) => (
        <Badge variant={row.is_active ? "success" : "secondary"} className="h-5 px-2 text-[10px]">
          {row.is_active ? "Đang làm việc" : "Nghỉ việc"}
        </Badge>
      )
    },
    {
      key: "skill_ids",
      label: "Kỹ năng",
      render: (_, row) => (
        <div className="flex flex-wrap gap-1">
          {row.skill_ids.length > 0 ? (
            <Badge variant="outline" className="text-[10px] h-5 bg-background font-normal">
              {row.skill_ids.length} kỹ năng
            </Badge>
          ) : (
            <span className="text-[10px] text-muted-foreground italic">--</span>
          )}
        </div>
      )
    },
    {
      key: "actions",
      label: "",
      width: "50px",
      render: (_, row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem onClick={() => handleEdit(row)} className="gap-2 cursor-pointer">
              <Edit className="h-4 w-4 text-muted-foreground" />
              <span>Chỉnh sửa</span>
            </DropdownMenuItem>
             <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive cursor-pointer">
              <Trash2 className="h-4 w-4" />
              <span>Xóa</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
         <Button onClick={handleCreate} className="gap-2 h-9 text-sm shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Thêm nhân sự</span>
        </Button>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={tableData}
        />
      </div>

      <StaffFormSheet
        open={isSheetOpen}
        onOpenChange={(v) => {
            setIsSheetOpen(v);
            if(!v) setSelectedStaff(undefined);
        }}
        staff={selectedStaff}
        onSuccess={() => {
            router.refresh();
            setIsSheetOpen(false);
        }}
      />
    </div>
  );
}
