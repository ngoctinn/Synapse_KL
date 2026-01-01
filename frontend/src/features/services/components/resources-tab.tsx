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
import { Bed, CalendarClock, MoreHorizontal, Plus, Trash2, Wrench } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteResourceAction, deleteResourceGroupAction, getResourcesAction } from "../actions";
import type { Resource, ResourceGroup, ResourceGroupWithCount } from "../types";
import { MaintenanceSheet } from "./maintenance-sheet";
import { ResourceFormSheet } from "./resource-form-sheet";
import { ResourceGroupFormSheet } from "./resource-group-form-sheet";

interface ResourcesTabProps {
  groups: ResourceGroupWithCount[];
}

export function ResourcesTab({ groups }: ResourcesTabProps) {
  const [isGroupSheetOpen, setIsGroupSheetOpen] = useState(false);
  const [isResourceSheetOpen, setIsResourceSheetOpen] = useState(false);
  const [isMaintenanceSheetOpen, setIsMaintenanceSheetOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ResourceGroup | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string>("");
  const [activeGroupName, setActiveGroupName] = useState<string>("");

  const [resourcesByGroup, setResourcesByGroup] = useState<Record<string, Resource[]>>({});
  const [search, setSearch] = useState("");
  const [, startDeleteTransition] = useTransition();

  const handleAddGroup = () => {
    setSelectedGroup(null);
    setIsGroupSheetOpen(true);
  };

  const handleAddResource = (group: ResourceGroup) => {
    setActiveGroupId(group.id);
    setActiveGroupName(group.name);
    setSelectedResource(null);
    setIsResourceSheetOpen(true);
  };

  const handleMaintenance = (resource: Resource) => {
    setSelectedResource(resource);
    setIsMaintenanceSheetOpen(true);
  };

  const handleDeleteGroup = (id: string) => {
    startDeleteTransition(async () => {
      try {
        await deleteResourceGroupAction(id);
        toast.success("Xóa nhóm tài nguyên thành công");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Không thể xóa nhóm tài nguyên");
      }
    });
  };

  const handleDeleteResource = (id: string) => {
    startDeleteTransition(async () => {
      try {
        await deleteResourceAction(id);
        toast.success("Xóa tài nguyên thành công");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Không thể xóa tài nguyên");
      }
    });
  };

  const toggleGroup = async (groupId: string) => {
    if (resourcesByGroup[groupId]) {
      const newResources = { ...resourcesByGroup };
      delete newResources[groupId];
      setResourcesByGroup(newResources);
      return;
    }

    try {
      const resources = await getResourcesAction(groupId);
      setResourcesByGroup(prev => ({ ...prev, [groupId]: resources }));
    } catch {
      toast.error("Không thể tải danh sách tài nguyên");
    }
  };

  const filteredGroups = useMemo(() => {
    if (!search) return groups;
    const searchLower = search.toLowerCase();
    return groups.filter(g => g.name.toLowerCase().includes(searchLower));
  }, [groups, search]);

  return (
    <div className="space-y-4">
      <TabToolbar
        searchPlaceholder="Tìm kiếm tài nguyên..."
        onSearch={setSearch}
        actionLabel="Thêm nhóm"
        onActionClick={handleAddGroup}
      />

      {filteredGroups.length === 0 ? (
        <div className="text-center py-16 border rounded-lg border-dashed bg-muted/5">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Bed className="w-6 h-6 text-muted-foreground" />
          </div>
          <h4 className="text-sm font-medium mb-1">Chưa có nhóm tài nguyên</h4>
          <p className="text-xs text-muted-foreground mb-6 max-w-[250px] mx-auto">
            Bắt đầu bằng cách tạo nhóm để quản lý giường, phòng hoặc thiết bị máy móc của bạn.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button size="sm" onClick={handleAddGroup}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Tạo nhóm mới
            </Button>
            <Button size="sm" variant="outline" onClick={() => {
              setSelectedGroup(null);
              setIsGroupSheetOpen(true);
              // Giả lập điền sẵn tên cho template (logic này có thể mở rộng thêm)
            }}>
              Dùng mẫu: Phòng Massage
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredGroups.map((group) => (
            <div key={group.id} className="border rounded-lg overflow-hidden">
              <div className="p-4 flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded-md border text-muted-foreground">
                    {group.type === "BED" ? <Bed className="h-5 w-5" /> : <Wrench className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className="font-medium">{group.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {group.type} • {group.resource_count} tài nguyên
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleGroup(group.id)}
                  >
                    {resourcesByGroup[group.id] ? "Thu gọn" : "Chi tiết"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground"
                    onClick={() => handleAddResource(group)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xóa nhóm tài nguyên?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Hành động này sẽ xóa nhóm &quot;{group.name}&quot;. Bạn không thể xóa nếu nhóm còn tài nguyên.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteGroup(group.id)} className="bg-destructive">Xóa</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {resourcesByGroup[group.id] && (
                <div className="p-2 border-t bg-background animation-in slide-in-from-top-2 duration-200">
                  <ResourcesDataTable
                    data={resourcesByGroup[group.id]}
                    search={search}
                    onMaintenance={handleMaintenance}
                    onDelete={handleDeleteResource}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ResourceGroupFormSheet
        open={isGroupSheetOpen}
        onOpenChange={setIsGroupSheetOpen}
        group={selectedGroup}
      />

      <ResourceFormSheet
        open={isResourceSheetOpen}
        onOpenChange={setIsResourceSheetOpen}
        groupId={activeGroupId}
        groupName={activeGroupName}
        resource={selectedResource}
      />

      <MaintenanceSheet
        open={isMaintenanceSheetOpen}
        onOpenChange={setIsMaintenanceSheetOpen}
        resource={selectedResource}
      />
    </div>
  );
}

// Inner Component for isolated state per table
function ResourcesDataTable({
  data,
  search,
  onMaintenance,
  onDelete
}: {
  data: Resource[];
  search: string;
  onMaintenance: (r: Resource) => void;
  onDelete: (id: string) => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Resource; dir: "asc" | "desc" } | null>(null);

  const processedData = useMemo(() => {
    let result = [...data];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(res =>
        res.name.toLowerCase().includes(searchLower) ||
        (res.code && res.code.toLowerCase().includes(searchLower))
      );
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.dir === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return 0; // fallback
      });
    }
    return result;
  }, [data, sortConfig, search]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  const columns: Column<Resource>[] = [
    { key: "no", label: "No", width: "50px" },
    { key: "selection", label: "", width: "40px" },
    { key: "name", label: "Tên tài nguyên", sortable: true, render: (v) => <span className="font-medium">{v as string}</span> },
    { key: "code", label: "Mã", sortable: true, render: (v) => <code className="text-xs bg-muted px-1 rounded">{v ? v as string : "-"}</code> },
    {
      key: "status",
      label: "Trạng thái",
      sortable: true,
      render: (v) => (
        <Badge variant={v === "ACTIVE" ? "default" : "secondary"}>
          {v as string}
        </Badge>
      )
    },
    {
      key: "actions",
      label: "Thao tác",
      width: "80px",
      render: (_, res) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onMaintenance(res)}>
              <CalendarClock className="mr-2 h-4 w-4 text-warning" />
              Lên lịch bảo trì
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <div
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-destructive hover:text-destructive-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa tài nguyên
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Xóa tài nguyên &quot;{res.name}&quot;? Hành động này không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(res.id)}
                    className="bg-destructive"
                  >
                    Xóa
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={paginatedData}
      onSort={(key, dir) => setSortConfig({ key, dir })}
      pagination={{
        currentPage,
        pageSize,
        totalItems: processedData.length,
        onPageChange: setCurrentPage,
        pageSizeOptions: [5, 10, 20],
        onPageSizeChange: (size) => { setPageSize(size); setCurrentPage(1); }
      }}
    />
  );
}
