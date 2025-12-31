"use client";

import { DataTable, type Column } from "@/shared/components/smart-data-table";
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
import { Bed, CalendarClock, Plus, Trash2, Wrench } from "lucide-react";
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

  const [resourcesByGroup, setResourcesByGroup] = useState<Record<string, Resource[]>>({});
  const [, startDeleteTransition] = useTransition();

  const handleAddGroup = () => {
    setSelectedGroup(null);
    setIsGroupSheetOpen(true);
  };

  const handleAddResource = (groupId: string) => {
    setActiveGroupId(groupId);
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Tài nguyên</h3>
          <p className="text-sm text-muted-foreground">
            Quản lý giường, thiết bị, phòng của Spa
          </p>
        </div>
        <Button onClick={handleAddGroup} size="sm" variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm nhóm
        </Button>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-12 border rounded-lg border-dashed">
          <p className="text-muted-foreground">Chưa có nhóm tài nguyên nào.</p>
          <Button variant="link" onClick={handleAddGroup}>Tạo nhóm đầu tiên</Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {groups.map((group) => (
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
                    className="h-8 w-8 text-muted-foreground"
                    onClick={() => handleAddResource(group.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xóa nhóm tài nguyên?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Hành động này sẽ xóa nhóm "{group.name}". Bạn không thể xóa nếu nhóm còn tài nguyên.
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
  onMaintenance,
  onDelete
}: {
  data: Resource[];
  onMaintenance: (r: Resource) => void;
  onDelete: (id: string) => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Resource; dir: "asc" | "desc" } | null>(null);

  const processedData = useMemo(() => {
    let result = [...data];
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
  }, [data, sortConfig]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  const columns: Column<Resource>[] = [
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
      width: "100px",
      render: (_, res) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            title="Lên lịch bảo trì"
            onClick={(e) => { e.stopPropagation(); onMaintenance(res); }}
          >
            <CalendarClock className="h-3.5 w-3.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                <AlertDialogDescription>Xóa tài nguyên "{res.name}"? Hành động này không thể hoàn tác.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(res.id)} className="bg-destructive">Xóa</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
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
