"use client";
import { cn } from "@/shared/lib/utils";

import { StaffFormSheet } from "@/features/staff/components/staff-form-sheet";
import type { StaffProfileWithSkills } from "@/features/staff/types";
import { DataTable, DataTableColumnHeader } from "@/shared/components/data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/shared/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface StaffTableProps {
  data: StaffProfileWithSkills[];
  variant?: "default" | "flat";
}

export function StaffTable({ data, variant = "default" }: StaffTableProps) {
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

  const columns: ColumnDef<StaffProfileWithSkills & { id: string }>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "full_name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Họ tên" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs border bg-muted"
            style={{
              backgroundColor: row.original.color_code ? `${row.original.color_code}20` : undefined,
              color: row.original.color_code,
              borderColor: row.original.color_code ? `${row.original.color_code}40` : undefined
            }}
          >
            {row.original.full_name.charAt(0)}
          </div>
          <div className="flex flex-col">
             <span className="font-medium text-foreground text-sm">{row.original.full_name}</span>
             <span className="text-[10px] text-muted-foreground uppercase">{row.original.user_id.slice(0, 8)}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Chức danh" />,
      cell: ({ row }) => <span className="text-sm font-medium">{row.getValue("title")}</span>
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
      meta: {
        filterOptions: [
          { label: "Đang làm việc", value: "true" },
          { label: "Nghỉ việc", value: "false" }
        ]
      },
      cell: ({ row }) => {
        const isActive = row.original.is_active;
        return (
          <Badge variant={isActive ? "success" : "secondary"} className="h-5 px-2 text-[10px]">
             {isActive ? "Đang làm việc" : "Nghỉ việc"}
          </Badge>
        )
      }
    },
    {
      accessorKey: "skill_ids",
      header: "Kỹ năng",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.skill_ids.length > 0 ? (
            <Badge variant="outline" className="text-[10px] h-5 bg-background font-normal">
              {row.original.skill_ids.length} kỹ năng
            </Badge>
          ) : (
            <span className="text-[10px] text-muted-foreground italic">--</span>
          )}
        </div>
      )
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem onClick={() => handleEdit(row.original)} className="gap-2 cursor-pointer">
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

      {data.length === 0 ? (
        <div className={cn(
          "rounded-xl border border-dashed bg-muted/5 overflow-hidden",
          variant === "flat" && "border-none"
        )}>
          <div className="flex flex-col items-center justify-center py-16 px-4 gap-4">
            <div className="rounded-full bg-muted/50 p-4">
              <Plus className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-foreground">Chưa có nhân viên nào</p>
              <p className="text-xs text-muted-foreground">Thêm nhân viên đầu tiên để bắt đầu quản lý đội ngũ.</p>
            </div>
            <Button onClick={handleCreate} variant="outline" className="mt-2 h-9">
              Thêm nhân viên đầu tiên
            </Button>
          </div>
        </div>
      ) : (
          <DataTable
            columns={columns}
            data={tableData}
            variant={variant}
          />
      )}

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
