"use client";

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
import { useState, useTransition } from "react";
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
            <div key={group.id} className="border rounded-lg bg-card overflow-hidden">
              <div className="p-4 flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded-md border">
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
                    {resourcesByGroup[group.id] ? "Ẩn" : "Hiện chi tiết"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleAddResource(group.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
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
                <div className="p-0 border-t">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/10 text-muted-foreground text-left">
                        <th className="p-3 font-medium">Tài nguyên</th>
                        <th className="p-3 font-medium">Mã</th>
                        <th className="p-3 font-medium">Trạng thái</th>
                        <th className="p-3 font-medium text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resourcesByGroup[group.id].length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-muted-foreground">
                            Chưa có tài nguyên nào trong nhóm này.
                          </td>
                        </tr>
                      ) : (
                        resourcesByGroup[group.id].map((res) => (
                          <tr key={res.id} className="border-b last:border-0 hover:bg-muted/20">
                            <td className="p-3 font-medium">{res.name}</td>
                            <td className="p-3 text-xs font-mono">{res.code || "-"}</td>
                            <td className="p-3">
                              <Badge variant={res.status === "ACTIVE" ? "default" : "secondary"}>
                                {res.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                  title="Lên lịch bảo trì"
                                  onClick={() => handleMaintenance(res)}
                                >
                                  <CalendarClock className="h-3.5 w-3.5" />
                                </Button>
                                <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                                    <AlertDialogDescription>Xóa tài nguyên &quot;{res.name}&quot;?</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteResource(res.id)} className="bg-destructive">Xóa</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
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
