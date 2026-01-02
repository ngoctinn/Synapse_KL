import {
  DataTable,
  DataTableColumnHeader,
} from "@/shared/components/data-table";
import { TabToolbar } from "@/shared/components/tab-toolbar";
import { cn } from "@/shared/lib/utils";
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
import { ColumnDef } from "@tanstack/react-table";
import {
  Bed,
  CalendarClock,
  MoreHorizontal,
  Plus,
  Trash2,
  Wrench,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  deleteResourceAction,
  deleteResourceGroupAction,
  getResourcesAction,
} from "../actions";
import type { Resource, ResourceGroup, ResourceGroupWithCount } from "../types";
import { DeleteDialog } from "./delete-dialog";
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
  const [selectedGroup, setSelectedGroup] = useState<ResourceGroup | null>(
    null
  );
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );
  const [activeGroupId, setActiveGroupId] = useState<string>("");
  const [activeGroupName, setActiveGroupName] = useState<string>("");

  const [resourcesByGroup, setResourcesByGroup] = useState<
    Record<string, Resource[]>
  >({});

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
        toast.error(
          error instanceof Error
            ? error.message
            : "Không thể xóa nhóm tài nguyên"
        );
      }
    });
  };

  const handleDeleteResource = (id: string) => {
    startDeleteTransition(async () => {
      try {
        await deleteResourceAction(id);

        // Optimistic UI Update: Xóa khỏi local state ngay lập tức
        setResourcesByGroup((prev) => {
          const next = { ...prev };
          // Duyệt qua tất cả các nhóm để tìm và xóa resource
          Object.keys(next).forEach((groupId) => {
            next[groupId] = next[groupId].filter((r) => r.id !== id);
          });
          return next;
        });

        toast.success("Xóa tài nguyên thành công");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Không thể xóa tài nguyên"
        );
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
      setResourcesByGroup((prev) => ({ ...prev, [groupId]: resources }));
    } catch {
      toast.error("Không thể tải danh sách tài nguyên");
    }
  };

  return (
    <div className="space-y-6">
      <TabToolbar
        title="Tài nguyên Spa"
        description="Quản lý Giường, Máy móc và các thiết bị hỗ trợ trị liệu."
        actionLabel="Thêm nhóm"
        onActionClick={() => {
          setSelectedGroup(null);
          setIsGroupSheetOpen(true);
        }}
        searchPlaceholder="Tìm kiếm nhóm tài nguyên..."
      />

      {groups.length === 0 ? (
        <div className="text-center py-16 border rounded-lg border-dashed bg-muted/5">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Bed className="w-6 h-6 text-muted-foreground stroke-2" />
          </div>
          <h4 className="text-sm font-medium mb-1">Chưa có nhóm tài nguyên</h4>
          <p className="text-xs text-muted-foreground mb-6 max-w-[250px] mx-auto">
            Bắt đầu bằng cách tạo nhóm để quản lý giường, phòng hoặc thiết bị
            máy móc của bạn.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button size="sm" onClick={handleAddGroup}>
              <Plus className="w-4 h-4 mr-1 stroke-2" /> Tạo nhóm mới
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedGroup(null);
                setIsGroupSheetOpen(true);
                // Giả lập điền sẵn tên cho template (logic này có thể mở rộng thêm)
              }}
            >
              Dùng mẫu: Phòng Massage
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {groups.map((group) => (
            <Card
              key={group.id}
              className="overflow-hidden transition-all hover:bg-neutral-5/5 border-border shadow-sm"
            >
              <CardHeader className="p-5 pb-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-primary border border-primary/10 shadow-sm">
                      {group.type === "BED" ? (
                        <Bed className="h-6 w-6 stroke-2" />
                      ) : (
                        <Wrench className="h-6 w-6 stroke-2" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-foreground leading-none mb-1.5">
                        {group.name}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-semibold uppercase tracking-wider py-0 px-1.5 rounded-md border-neutral-20/50 bg-neutral-5/10"
                        >
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
                        "h-9 px-4 text-xs font-semibold rounded-lg transition-all",
                        resourcesByGroup[group.id]
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-muted/50 hover:bg-muted"
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
                    <DeleteDialog
                      title="Xác nhận xóa?"
                      description={`Hành động này sẽ xóa nhóm "${group.name}". Bạn không thể xóa nếu nhóm còn tài nguyên.`}
                      onConfirm={() => handleDeleteGroup(group.id)}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                          disabled={group.resource_count > 0}
                          title={
                            group.resource_count > 0
                              ? "Không thể xóa nhóm đang có tài nguyên"
                              : "Xóa nhóm"
                          }
                        >
                          <Trash2 className="h-5 w-5 stroke-2" />
                        </Button>
                      }
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent
                className={cn(
                  "p-0 px-5 transition-all duration-300",
                  resourcesByGroup[group.id]
                    ? "mt-5 pb-5 border-t border-border/50"
                    : "h-0 overflow-hidden"
                )}
              >
                {resourcesByGroup[group.id] && (
                  <div className="pt-5 animation-in slide-in-from-top-2 duration-300">
                    <ResourcesDataTable
                      data={resourcesByGroup[group.id]}
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

  onMaintenance,
  onDelete,
}: {
  data: Resource[];
  onMaintenance: (r: Resource) => void;
  onDelete: (id: string) => void;
}) {
  const columns: ColumnDef<Resource>[] = [
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
        <DataTableColumnHeader column={column} title="Tên tài nguyên" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name") as string}</span>
      ),
    },
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mã" />
      ),
      cell: ({ row }) => (
        <code className="text-xs bg-muted px-1 rounded">
          {row.getValue("code") ? (row.getValue("code") as string) : "-"}
        </code>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Trạng thái" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={status === "ACTIVE" ? "default" : "secondary"}>
            {status}
          </Badge>
        );
      },
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
            <DeleteDialog
              title="Xác nhận xóa?"
              description={`Xóa tài nguyên "${row.original.name}"? Hành động này không thể hoàn tác.`}
              onConfirm={() => onDelete(row.original.id)}
              trigger={
                <div
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none transition-colors hover:bg-destructive/10 text-destructive gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Xóa tài nguyên</span>
                </div>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return <DataTable columns={columns} data={data} />;
}
