"use client";

import { DataTable, type Column } from "@/shared/components/smart-data-table";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Edit2, MoreHorizontal, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteSkillAction } from "../actions";
import type { Skill } from "../types";
import { SkillFormSheet } from "./skill-form-sheet";

interface SkillsTabProps {
  skills: Skill[];
}

export function SkillsTab({ skills }: SkillsTabProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  // SmartDataTable State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Skill; dir: "asc" | "desc" } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");

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

  // --- Data Processing ---
  const processedData = useMemo(() => {
    let result = [...skills];

    // Search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        (item.description && item.description.toLowerCase().includes(searchLower)) ||
        (item.code && item.code.toLowerCase().includes(searchLower))
      );
    }

    // Filter
    if (Object.keys(filters).length > 0) {
      result = result.filter((item) => {
        return Object.entries(filters).every(([key, value]) => {
          if (!value || value === "all") return true;
          // Add specific filters here if needed
          return true;
        });
      });
    }

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.dir === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (aValue < bValue) return sortConfig.dir === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.dir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [skills, filters, sortConfig]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  // --- Columns ---
  const columns: Column<Skill>[] = [
    {
      key: "no",
      label: "No",
      width: "50px",
    },
    {
      key: "selection",
      label: "",
      width: "40px",
    },
    {
      key: "name",
      label: "Tên Kỹ Năng",
      sortable: true,
      render: (value) => <div className="font-medium">{value as string}</div>,
    },
    {
      key: "code",
      label: "Mã",
      sortable: true,
      render: (value) => (
        <code className="text-xs bg-muted px-2 py-0.5 rounded border">
          {value ? (value as string) : "-"}
        </code>
      ),
    },
    {
      key: "description",
      label: "Mô tả",
      render: (value) => (
        <div className="text-muted-foreground line-clamp-1 max-w-xs" title={value as string}>
          {value ? (value as string) : "-"}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      width: "80px",
      render: (_, row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleEdit(row)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <div
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-destructive hover:text-destructive-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa kỹ năng
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hành động này không thể hoàn tác. Kỹ năng "{row.name}" sẽ bị xóa vĩnh viễn khỏi hệ thống.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(row.id)}
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
        searchPlaceholder="Tìm kiếm kỹ năng..."
        onSearch={setSearch}
        actionLabel="Thêm kỹ năng"
        onActionClick={handleAdd}
      />

      <DataTable
        columns={columns}
        data={paginatedData}
        onSort={(key, dir) => setSortConfig({ key, dir })}
        pagination={{
          currentPage,
          pageSize,
          totalItems: processedData.length,
          onPageChange: setCurrentPage,
          pageSizeOptions: [5, 10, 20, 50],
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          }
        }}
      />

      <SkillFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        skill={selectedSkill}
      />
    </div>
  );
}

