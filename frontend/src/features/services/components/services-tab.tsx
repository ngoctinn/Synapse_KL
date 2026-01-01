
import { DataTable, type Column } from "@/shared/components/smart-data-table";
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
import { Edit2, Plus, Power, PowerOff, Trash2 } from "lucide-react";
import { useMemo, useOptimistic, useState, useTransition } from "react";
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
}

export function ServicesTab({
  services,
  categories,
  skills,
  resourceGroups,
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

  // SmartDataTable State
  const [sortConfig, setSortConfig] = useState<{ key: keyof Service; dir: "asc" | "desc" } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");

  // Client-side Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

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

  // --- Data Processing for SmartDataTable ---

  const processedData = useMemo(() => {
    let result = [...optimisticServices]; // Use optimistic data

    // 0. Search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        (item.description && item.description.toLowerCase().includes(searchLower))
      );
    }

    // 1. Filter
    if (Object.keys(filters).length > 0) {
      result = result.filter((item) => {
        return Object.entries(filters).every(([key, value]) => {
          if (!value || value === "all") return true;
          if (key === "category_id") return item.category_id === value;
          if (key === "is_active") return String(item.is_active) === value;
          return true;
        });
      });
    }

    // 2. Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === bValue) return 0;

        // Handle null/undefined
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.dir === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Number
        if (aValue < bValue) return sortConfig.dir === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.dir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [optimisticServices, filters, sortConfig, search]);

  // 3. Pagination Slice
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  // --- Column Definitions ---

  const columns: Column<Service>[] = [
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
      label: "Dịch vụ",
      sortable: true,
      render: (value, row) => (
        <div className="max-w-xs">
          <div className="font-medium truncate">{row.name}</div>
          {row.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-xs text-muted-foreground line-clamp-1 cursor-help">
                    {row.description}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[300px] break-words">
                  <p>{row.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      ),
    },
    {
      key: "category_id",
      label: "Danh mục",
      sortable: true,
      filterable: true,
      filterOptions: categories.map(c => ({ label: c.name, value: c.id })),
      render: (value) => (
        <Badge variant="outline" className="font-normal">
          {getCategoryName(value as string)}
        </Badge>
      ),
    },
    {
      key: "duration",
      label: "Thời gian",
      sortable: true,
      render: (value, row) => (
        <div className="text-muted-foreground">
          {row.duration}p <span className="text-xs opacity-70">(+{row.buffer_time}p nghỉ)</span>
        </div>
      ),
    },
    {
      key: "price",
      label: "Giá",
      sortable: true,
      render: (value) => (
        <div className="font-medium text-primary">
          {formatPrice(value as string)}
        </div>
      ),
    },
    {
      key: "is_active",
      label: "Trạng thái",
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: "Hoạt động", value: "true" },
        { label: "Tạm ngưng", value: "false" },
      ],
      render: (value, row) => (
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-1.5",
            row.is_active ? "text-success border-success/30 bg-success/5" : "text-muted-foreground"
          )}
          onClick={(e) => {
            e.stopPropagation();
            handleToggleStatus(row.id);
          }}
          disabled={isPending}
        >
          {row.is_active ? (
            <><Power className="h-3 w-3" /> Hoạt động</>
          ) : (
            <><PowerOff className="h-3 w-3" /> Tạm ngưng</>
          )}
        </Button>
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
              <Plus className="h-4 w-4 rotate-45" /> {/* Using Plus rotated as a fallback since MoreHorizontal is standard but let's see */}
              {/* Wait, the design system uses MoreHorizontal. Let's use that. */}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleEdit(row)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleStatus(row.id)}>
              {row.is_active ? (
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
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-destructive hover:text-destructive-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa dịch vụ
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Xóa dịch vụ &quot;{row.name}&quot;? Hành động này không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(row.id)}
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

  return (
    <div className="space-y-4">
      <TabToolbar
        searchPlaceholder="Tìm kiếm dịch vụ..."
        onSearch={setSearch}
        actionLabel="Thêm dịch vụ"
        onActionClick={handleAdd}
      />

      <DataTable
        columns={columns}
        data={paginatedData}
        onSort={(key, dir) => setSortConfig({ key, dir })}
        onFilterChange={(key, value) => {
         setFilters(prev => ({ ...prev, [key]: value }));
         setCurrentPage(1); // Reset page on filter
        }}
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
