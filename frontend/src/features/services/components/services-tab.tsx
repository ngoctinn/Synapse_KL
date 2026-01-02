"use client";

import { DataTable, DataTableColumnHeader } from "@/shared/components/data-table";
import { TabToolbar } from "@/shared/components/tab-toolbar";
import { cn } from "@/shared/lib/utils";
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
import { Badge } from "@/shared/ui/badge";
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/shared/ui/tooltip";
import { ColumnDef } from "@tanstack/react-table";
import { Edit2, MoreHorizontal, Power, PowerOff, Trash2 } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import {
    createServiceAction,
    deleteServiceAction,
    getServiceByIdAction,
    toggleServiceStatusAction,
    updateServiceAction
} from "../actions";
import type { ServiceCreateForm } from "../schemas";
import type { ResourceGroup, Service, ServiceCategory, ServiceWithDetails, Skill } from "../types";
import { ServiceFormSheet } from "./service-form-sheet";

interface ServicesTabProps {
  services: Service[];
  categories: ServiceCategory[];
  skills: Skill[];
  resourceGroups: ResourceGroup[];
  variant?: "default" | "flat";
}

export function ServicesTab({
  services,
  categories,
  skills,
  resourceGroups,
  variant = "default",
}: ServicesTabProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceWithDetails | null>(null);
  const [isPending, startTransition] = useTransition();

  // Optimistic UI State
  const [optimisticServices, addOptimisticService] = useOptimistic(
    services,
    (state, action: { type: "ADD" | "UPDATE" | "DELETE" | "TOGGLE"; payload: Service | string }) => {
      switch (action.type) {
        case "ADD":
          return [action.payload as Service, ...state];
        case "UPDATE":
          return state.map((s) => (s.id === (action.payload as Service).id ? { ...s, ...(action.payload as Service) } : s));
        case "DELETE":
          return state.filter((s) => s.id !== action.payload);
        case "TOGGLE":
          return state.map((s) =>
            s.id === action.payload ? { ...s, is_active: !s.is_active } : s
          );
        default:
          return state;
      }
    }
  );



  const getCategoryName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name || "Chưa phân loại";

  const formatPrice = (price: string) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
      Number(price)
    );

  const handleAdd = () => {
    setSelectedService(null);
    setIsSheetOpen(true);
  };

  const handleEdit = async (service: Service) => {
    try {
      // Set partial data while loading full details
      setSelectedService({
        ...service,
        category: null,
        skills: [],
        resource_requirements: []
      });
      setIsSheetOpen(true);
      const data = await getServiceByIdAction(service.id);
      setSelectedService(data);
    } catch {
      toast.error("Không thể tải chi tiết dịch vụ");
    }
  };

  const handleServiceSubmit = async (data: ServiceCreateForm) => {
    if (selectedService) {
      // UPDATE
      const updatedService = {
        ...selectedService,
        ...data,
        price: Number(data.price),
        description: data.description ?? null,
        image_url: data.image_url ?? null,
      };

      startTransition(async () => {
        addOptimisticService({ type: "UPDATE", payload: updatedService });
        await updateServiceAction(selectedService.id, data);
      });
    } else {
      // CREATE
      const tempId = crypto.randomUUID();
      const tempService = {
        ...data,
        id: tempId,
        price: Number(data.price),
        is_active: data.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category_id: data.category_id || null,
        description: data.description ?? null,
        image_url: data.image_url ?? null,
      };

      startTransition(async () => {
        addOptimisticService({ type: "ADD", payload: tempService });
        await createServiceAction(data);
      });
    }
  };

  const handleToggleStatus = (id: string) => {
    startTransition(async () => {
      addOptimisticService({ type: "TOGGLE", payload: id });
      try {
        const result = await toggleServiceStatusAction(id);
        if (result) {
          toast.success("Đã thay đổi trạng thái dịch vụ");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Không thể thay đổi trạng thái");
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      addOptimisticService({ type: "DELETE", payload: id });
      try {
        await deleteServiceAction(id);
        toast.success("Xóa dịch vụ thành công");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Không thể xóa dịch vụ");
      }
    });
  };



  // --- Column Definitions ---
  const columns: ColumnDef<Service>[] = [
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
      header: ({ column }) => <DataTableColumnHeader column={column} title="Dịch vụ" />,
      cell: ({ row }) => (
        <div className="max-w-xs">
          <div className="font-medium truncate">{row.getValue("name")}</div>
          {row.original.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-xs text-muted-foreground line-clamp-1 cursor-help">
                    {row.original.description}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[300px] break-words">
                  <p>{row.original.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      ),
    },
    {
      accessorKey: "category_id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Danh mục" />,
      meta: {
        filterOptions: categories.map(c => ({ label: c.name, value: c.id })),
      },
      cell: ({ row }) => (
        <Badge variant="outline" className="font-normal">
          {getCategoryName(row.getValue("category_id"))}
        </Badge>
      ),
    },
    {
      accessorKey: "duration",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Thời gian" />,
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.getValue("duration")}p <span className="text-xs opacity-70">(+{row.original.buffer_time}p nghỉ)</span>
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Giá" />,
      cell: ({ row }) => (
        <div className="font-medium text-primary">
          {formatPrice(row.getValue("price"))}
        </div>
      ),
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
      meta: {
        filterOptions: [
          { label: "Hoạt động", value: "true" },
          { label: "Tạm ngưng", value: "false" },
        ],
      },
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-1.5",
            row.getValue("is_active") ? "text-success border-success/30 bg-success/5" : "text-muted-foreground"
          )}
          onClick={(e) => {
            e.stopPropagation();
            handleToggleStatus(row.original.id);
          }}
          disabled={isPending}
        >
          {row.getValue("is_active") ? (
            <><Power className="h-3 w-3" /> Hoạt động</>
          ) : (
            <><PowerOff className="h-3 w-3" /> Tạm ngưng</>
          )}
        </Button>
      ),
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
            <DropdownMenuItem onClick={() => handleToggleStatus(row.original.id)}>
              {row.original.is_active ? (
                <>
                  <PowerOff className="mr-2 h-4 w-4 text-warning" />
                  Tạm ngưng
                </>
              ) : (
                <>
                  <Power className="mr-2 h-4 w-4 text-success" />
                  Kích hoạt
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <div
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none transition-colors hover:bg-destructive/10 text-destructive gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Xóa dịch vụ</span>
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Xóa dịch vụ &quot;{row.original.name}&quot;? Hành động này không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(row.original.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Xóa vĩnh viễn
                            </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];


  const [searchTerm, setSearchTerm] = useState("");

  const filteredServices = optimisticServices.filter(visitedService => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      visitedService.name.toLowerCase().includes(searchLower) ||
      (visitedService.description && visitedService.description.toLowerCase().includes(searchLower)) ||
      (getCategoryName(visitedService.category_id).toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-4">
      <TabToolbar
        title="Danh sách dịch vụ"
        description="Quản lý danh sách dịch vụ spa và trị liệu."
        actionLabel="Thêm dịch vụ"
        onActionClick={handleAdd}
        onSearch={setSearchTerm}
        searchValue={searchTerm}
        searchPlaceholder="Tìm kiếm dịch vụ..."
      />

      <DataTable
        columns={columns}
        data={filteredServices}
        variant={variant}
      />


      <ServiceFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        categories={categories}
        skills={skills}
        resourceGroups={resourceGroups}
        service={selectedService}
        onSubmit={handleServiceSubmit}
      />
    </div>
  );
}
