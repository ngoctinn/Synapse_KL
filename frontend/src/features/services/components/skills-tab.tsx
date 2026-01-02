"use client";

import { DataTable, DataTableColumnHeader } from "@/shared/components/data-table";
import { TabToolbar } from "@/shared/components/tab-toolbar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { Edit2, MoreHorizontal, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteSkillAction } from "../actions";
import type { Skill } from "../types";
import { SkillFormSheet } from "./skill-form-sheet";

interface SkillsTabProps {
  skills: Skill[];
  variant?: "default" | "flat";
}

export function SkillsTab({ skills, variant = "default" }: SkillsTabProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState("");

  const filteredSkills = skills.filter(skill =>
    !searchTerm || skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );



  const handleAdd = () => {
    setSelectedSkill(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (skill: Skill) => {
    setSelectedSkill(skill);
    setIsSheetOpen(true);
  };

  const handleDelete = (id: string) => {
    startDeleteTransition(async () => {
      try {
        await deleteSkillAction(id);
        toast.success("Xóa kỹ năng thành công");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Không thể xóa kỹ năng");
      }
    });
  };



  // --- Columns ---
  const columns: ColumnDef<Skill>[] = [
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
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tên Kỹ Năng" />,
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "code",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mã" />,
      cell: ({ row }) => {
        const value = row.getValue("code") as string;
        return (
          <code className="text-xs bg-muted px-2 py-0.5 rounded border">
             {value ? value : "-"}
          </code>
        )
      },
    },
    {
      accessorKey: "description",
      header: "Mô tả",
      cell: ({ row }) => {
        const value = row.getValue("description") as string;
        return (
          <div className="text-muted-foreground line-clamp-1 max-w-xs" title={value}>
            {value ? value : "-"}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <div
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none transition-colors hover:bg-destructive/10 text-destructive gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Xóa kỹ năng</span>
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hành động này không thể hoàn tác. Kỹ năng "{row.original.name}" sẽ bị xóa vĩnh viễn khỏi hệ thống.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(row.original.id)}
                    className="bg-destructive"
                  >
                    Xóa
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4">

      <TabToolbar
         title="Danh sách kỹ năng"
         description="Quản lý các kỹ năng tay nghề và chuyên môn."
         actionLabel="Thêm kỹ năng"
         onActionClick={handleAdd}
         onSearch={setSearchTerm}
         searchValue={searchTerm}
         searchPlaceholder="Tìm kiếm kỹ năng..."
      />

      <DataTable
        columns={columns}
        data={filteredSkills}
        variant={variant}
      />

      <SkillFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        skill={selectedSkill}
      />
    </div>
  );
}

