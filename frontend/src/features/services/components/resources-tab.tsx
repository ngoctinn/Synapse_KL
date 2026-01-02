"use client";

import { DataTable, DataTableColumnHeader } from "@/shared/components/data-table";
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
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Input } from "@/shared/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { Bed, CalendarClock, MoreHorizontal, Plus, Search, Trash2, Wrench } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteResourceAction, deleteResourceGroupAction, getResourcesAction } from "../actions";
import type { Resource, ResourceGroup, ResourceGroupWithCount } from "../types";
import { MaintenanceSheet } from "./maintenance-sheet";
import { ResourceFormSheet } from "./resource-form-sheet";
import { ResourceGroupFormSheet } from "./resource-group-form-sheet";

interface ResourcesTabProps {
  groups: ResourceGroupWithCount[];
  variant?: "default" | "flat";
}

export function ResourcesTab({ groups, variant = "default" }: ResourcesTabProps) {
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3>Quản lý tài nguyên</h3>
          <p className="caption">Danh sách các nhóm phòng, giường và thiết bị.</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground stroke-2" />
              <Input
                placeholder="Tìm kiếm nhóm..."
                className="pl-9"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={handleAddGroup}>
              <Plus className="w-5 h-5 mr-2 stroke-2" />
              Thêm nhóm
            </Button>
        </div>
      </div>

      {filteredGroups.length === 0 ? (
        <div className="text-center py-16 border rounded-lg border-dashed bg-muted/5">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Bed className="w-6 h-6 text-muted-foreground stroke-2" />
          </div>
          <h4 className="text-sm font-medium mb-1">Chưa có nhóm tài nguyên</h4>
          <p className="text-xs text-muted-foreground mb-6 max-w-[250px] mx-auto">
            Bắt đầu bằng cách tạo nhóm để quản lý giường, phòng hoặc thiết bị máy móc của bạn.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button size="sm" onClick={handleAddGroup}>
              <Plus className="w-4 h-4 mr-1 stroke-2" /> Tạo nhóm mới
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
            <Card key={group.id} className={cn(
              "overflow-hidden transition-all hover:bg-card/50",
              variant === "flat" ? "border-none shadow-none bg-card/10" : "border-border bg-card/30 shadow-sm"
            )}>
              <CardHeader className="p-5 pb-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-primary border border-primary/10 shadow-sm">
                      {group.type === "BED" ? <Bed className="h-6 w-6 stroke-2" /> : <Wrench className="h-6 w-6 stroke-2" />}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-foreground leading-none mb-1.5">{group.name}</h4>
                      <div className="flex items-center gap-2">
                         <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider py-0 px-1.5 rounded-md border-neutral-20/50 bg-neutral-5/10">
                          {group.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-medium">
                          {group.resource_count} tài nguyên
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                     <Button
                      variant="secondary"
                      size="sm"
                      className={cn(
                        "h-9 px-4 text-xs font-bold rounded-lg transition-all",
                        resourcesByGroup[group.id] ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted/50 hover:bg-muted"
                      )}
                      onClick={() => toggleGroup(group.id)}
                    >
                      {resourcesByGroup[group.id] ? "Thu gọn" : "Xem chi tiết"}
                    </Button>

                    <div className="h-8 w-[1px] bg-border/60 mx-1 hidden sm:block" />

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5"
                      onClick={() => handleAddResource(group)}
                    >
                      <Plus className="h-5 w-5 stroke-2" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5">
                          <Trash2 className="h-5 w-5 stroke-2" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
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
              </CardHeader>

              <CardContent className={cn("p-0 px-5 transition-all duration-300", resourcesByGroup[group.id] ? "mt-5 pb-5 border-t border-border/50" : "h-0 overflow-hidden")}>
                {resourcesByGroup[group.id] && (
                  <div className="pt-5 animation-in slide-in-from-top-2 duration-300">
                    <ResourcesDataTable
                      data={resourcesByGroup[group.id]}
                      search={search}
                      onMaintenance={handleMaintenance}
                      onDelete={handleDeleteResource}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
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
  const processedData = useMemo(() => {
    let result = [...data];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(res =>
        res.name.toLowerCase().includes(searchLower) ||
        (res.code && res.code.toLowerCase().includes(searchLower))
      );
    }
    return result;
  }, [data, search]);

  const columns: ColumnDef<Resource>[] = [
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
    { accessorKey: "name", header: ({ column }) => <DataTableColumnHeader column={column} title="Tên tài nguyên" />, cell: (row) => <span className="font-medium">{row.getValue() as string}</span> },
    { accessorKey: "code", header: ({ column }) => <DataTableColumnHeader column={column} title="Mã" />, cell: (row) => <code className="text-xs bg-muted px-1 rounded">{row.getValue() ? row.getValue() as string : "-"}</code> },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
      cell: (row) => (
        <Badge variant={row.getValue() === "ACTIVE" ? "default" : "secondary"}>
          {row.getValue() as string}
        </Badge>
      )
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5 stroke-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onMaintenance(row.original)}>
              <CalendarClock className="mr-2 h-5 w-5 text-warning stroke-2" />
              Lên lịch bảo trì
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <div
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-destructive hover:text-destructive-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="mr-2 h-5 w-5 stroke-2" />
                  Xóa tài nguyên
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Xóa tài nguyên &quot;{row.original.name}&quot;? Hành động này không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(row.original.id)}
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
      data={processedData}
      variant="flat"
    />
  );
}
