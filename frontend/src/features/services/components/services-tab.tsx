"use client";

import {
  DataTable,
  DataTableColumnHeader,
} from "@/shared/components/data-table";
import { TabToolbar } from "@/shared/components/tab-toolbar";
import { cn } from "@/shared/lib/utils";
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
import {
  Edit2,
  Image as ImageIcon,
  MoreHorizontal,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createServiceAction,
  deleteServiceAction,
  getServiceByIdAction,
  toggleServiceStatusAction,
  updateServiceAction,
} from "../actions";
import type { ServiceCreateForm } from "../schemas";
import type {
  ResourceGroup,
  Service,
  ServiceCategory,
  ServiceWithDetails,
  Skill,
} from "../types";
import { DeleteDialog } from "./delete-dialog";
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
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedService, setSelectedService] =
    useState<ServiceWithDetails | null>(null);
  const [isPending, startTransition] = useTransition();

  // Quản lý trạng thái Optimistic để phản hồi UI tức thì mà không chờ Server Action hoàn tất
  // useOptimistic nhận passthrough value (services prop) - nó sẽ sync khi prop thay đổi
  const [optimisticServices, addOptimisticService] = useOptimistic<
    Service[],
    { type: "ADD" | "UPDATE" | "DELETE" | "TOGGLE"; payload: Service | string }
  >(services, (state, action) => {
    // Early return nếu state không phải array (edge case khi hydration)
    const currentState = Array.isArray(state) ? state : [];

    switch (action.type) {
      case "ADD":
        return [action.payload as Service, ...currentState];
      case "UPDATE":
        return currentState.map((s) =>
          s.id === (action.payload as Service).id
            ? { ...s, ...(action.payload as Service) }
            : s
        );
      case "DELETE":
        return currentState.filter((s) => s.id !== action.payload);
      case "TOGGLE":
        return currentState.map((s) =>
          s.id === action.payload ? { ...s, is_active: !s.is_active } : s
        );
      default:
        return currentState;
    }
  });

  const getCategoryName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name || "Chưa phân loại";

  const formatPrice = (price: string) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(price));

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
        resource_requirements: [],
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
        const res = await updateServiceAction(selectedService.id, data);
        if (res.success) {
          setIsSheetOpen(false); // Close modal on success
          router.refresh();
        } else {
          // router.refresh() sẽ fetch lại data mới, useOptimistic tự động sync
          router.refresh();
          toast.error(res.message || "Cập nhật dịch vụ thất bại");
        }
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
        const res = await createServiceAction(data);
        if (res.success) {
          toast.success(`Đã tạo dịch vụ "${data.name}" thành công`);
          setIsSheetOpen(false);
          router.refresh();
        } else {
          // router.refresh() sẽ fetch lại data mới, useOptimistic tự động sync
          router.refresh();
          toast.error(res.message || "Tạo dịch vụ thất bại");
        }
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
        } else {
          throw new Error("Thay đổi trạng thái thất bại");
        }
      } catch (error) {
        // router.refresh() sẽ fetch lại data mới, useOptimistic tự động sync
        router.refresh();
        toast.error(
          error instanceof Error
            ? error.message
            : "Không thể thay đổi trạng thái"
        );
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
        // router.refresh() sẽ fetch lại data mới, useOptimistic tự động sync
        router.refresh();
        toast.error(
          error instanceof Error ? error.message : "Không thể xóa dịch vụ"
        );
      }
    });
  };

  // Định nghĩa các cột cho DataTable, bao gồm logic hiển thị và filter đặc thù
  const columns: ColumnDef<Service>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
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
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Dịch vụ" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 relative shrink-0 overflow-hidden rounded-md border bg-muted">
            {row.original.image_url ? (
              <NextImage
                src={row.original.image_url}
                alt={row.original.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="max-w-xs min-w-0">
            <div className="font-medium truncate">{row.getValue("name")}</div>
            {row.original.description && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-xs text-muted-foreground line-clamp-1 cursor-help">
                      {row.original.description}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="max-w-[300px] break-words"
                  >
                    <p>{row.original.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "category_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Danh mục" />
      ),
      meta: {
        filterOptions: [
          { label: "Chưa phân loại", value: "uncategorized" },
          ...categories.map((c) => ({ label: c.name, value: c.id })),
        ],
      },
      cell: ({ row }) => {
        const categoryId = row.getValue("category_id") as string | null;
        const categoryName = getCategoryName(categoryId);
        const isUncategorized = !categoryId;

        return (
          <Badge
            variant="outline"
            className={cn(
              "font-normal",
              isUncategorized && "text-muted-foreground"
            )}
          >
            {categoryName}
          </Badge>
        );
      },
    },
    {
      accessorKey: "duration",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Thời gian" />
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.getValue("duration")}p{" "}
          <span className="text-xs opacity-70">
            (+{row.original.buffer_time}p nghỉ)
          </span>
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Giá" />
      ),
      cell: ({ row }) => (
        <div className="font-medium text-primary">
          {formatPrice(row.getValue("price"))}
        </div>
      ),
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Trạng thái" />
      ),
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
            row.getValue("is_active")
              ? "text-success border-success/30 bg-success/5"
              : "text-muted-foreground"
          )}
          onClick={(e) => {
            e.stopPropagation();
            handleToggleStatus(row.original.id);
          }}
          disabled={isPending}
        >
          {row.getValue("is_active") ? (
            <>
              <Power className="h-3 w-3" /> Hoạt động
            </>
          ) : (
            <>
              <PowerOff className="h-3 w-3" /> Tạm ngưng
            </>
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
            <DropdownMenuItem
              onClick={() => handleToggleStatus(row.original.id)}
            >
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
            <DeleteDialog
              title="Xác nhận xóa?"
              description={`Xóa dịch vụ "${row.original.name}"? Hành động này không thể hoàn tác.`}
              onConfirm={() => handleDelete(row.original.id)}
              trigger={
                <div
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none transition-colors hover:bg-destructive/10 text-destructive gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Xóa dịch vụ</span>
                </div>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <TabToolbar
        title="Danh sách dịch vụ"
        description="Quản lý danh sách dịch vụ spa và trị liệu."
        actionLabel="Thêm dịch vụ"
        onActionClick={handleAdd}
        searchPlaceholder="Tìm kiếm dịch vụ..."
      />

      <DataTable
        columns={columns}
        data={optimisticServices}
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
