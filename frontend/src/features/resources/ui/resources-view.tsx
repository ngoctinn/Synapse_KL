"use client"

import { Plus } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { deleteResource, deleteResourceGroup } from "../api/actions"
import { ResourceGroup, ResourceItem } from "../model/schemas"
import { ResourceFormSheet } from "./resource-form-sheet"
import { ResourceGroupList } from "./resource-group-list"
import { ResourceGroupSheet } from "./resource-group-sheet"
import { ResourceList } from "./resource-list"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog"
import { Button } from "@/shared/ui/button"

interface ResourcesViewProps {
  groups: ResourceGroup[]
  resources: ResourceItem[]
}

export function ResourcesView({ groups, resources }: ResourcesViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedGroupId = searchParams.get("groupId")

  const [isPending, startTransition] = useTransition()

  // === State: Group Sheet ===
  const [isGroupSheetOpen, setIsGroupSheetOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<ResourceGroup | null>(null)

  // === State: Resource Sheet ===
  const [isResourceSheetOpen, setIsResourceSheetOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null)

  // === State: Alert ===
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean
    type: "group" | "resource"
    id: string
    title: string
    description: string
  }>({
    isOpen: false,
    type: "group",
    id: "",
    title: "",
    description: "",
  })

  // === Handlers: Navigation ===
  const handleSelectGroup = (id: string) => {
    router.push(`/admin/resources?groupId=${id}`)
  }

  // === Handlers: Group Actions ===
  const handleCreateGroup = () => {
    setEditingGroup(null)
    setIsGroupSheetOpen(true)
  }

  const handleEditGroup = (group: ResourceGroup) => {
    setEditingGroup(group)
    setIsGroupSheetOpen(true)
  }

  const handleDeleteGroup = (id: string) => {
    setAlertConfig({
      isOpen: true,
      type: "group",
      id,
      title: "Xóa nhóm tài nguyên?",
      description: "Hành động này không thể hoàn tác. Các thiết bị trong nhóm cũng sẽ bị ảnh hưởng.",
    })
  }

  // === Handlers: Resource Actions ===
  const handleCreateResource = () => {
    setEditingResource(null)
    setIsResourceSheetOpen(true)
  }

  const handleEditResource = (item: ResourceItem) => {
    setEditingResource(item)
    setIsResourceSheetOpen(true)
  }

  const handleDeleteResource = (id: string) => {
    setAlertConfig({
      isOpen: true,
      type: "resource",
      id,
      title: "Xóa thiết bị?",
      description: "Bạn có chắc chắn muốn xóa thiết bị này khỏi hệ thống?",
    })
  }

  // === Handlers: Alert Confirmation ===
  const confirmDelete = () => {
    startTransition(async () => {
      let result
      if (alertConfig.type === "group") {
        result = await deleteResourceGroup(alertConfig.id)
        if (result.success && selectedGroupId === alertConfig.id) {
          router.push("/admin/resources") // Reset selection if deleted active group
        }
      } else {
        result = await deleteResource(alertConfig.id)
      }

      if (result.success) {
        toast.success("Đã xóa thành công")
        setAlertConfig((prev) => ({ ...prev, isOpen: false }))
      } else {
        toast.error("Không thể xóa: " + (result.error || "Lỗi không xác định"))
      }
    })
  }

  const selectedGroup = groups.find((g) => g.id === selectedGroupId)

  return (
    <div className="flex h-[calc(100vh-65px)] w-full overflow-hidden border-t">
      {/* Sidebar: Group List (25%) */}
      <div className="w-1/4 min-w-[250px] max-w-[350px]">
        <ResourceGroupList
          groups={groups}
          selectedId={selectedGroupId}
          onSelect={handleSelectGroup}
          onEdit={handleEditGroup}
          onDelete={handleDeleteGroup}
          onCreate={handleCreateGroup}
        />
      </div>

      {/* Main Content: Resource List (75%) */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedGroupId ? (
          <>
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <h1 className="text-xl font-bold">{selectedGroup?.name}</h1>
                <p className="text-sm text-muted-foreground">{selectedGroup?.description}</p>
              </div>
              <Button onClick={handleCreateResource}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm thiết bị
              </Button>
            </div>

            <div className="flex-1 overflow-auto p-6 bg-muted/5">
              <div className="bg-background rounded-lg border shadow-sm p-4">
                <ResourceList
                  resources={resources}
                  onEdit={handleEditResource}
                  onDelete={handleDeleteResource}
                  onCreate={handleCreateResource}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <h2 className="text-xl font-semibold">Chưa chọn nhóm tài nguyên</h2>
            <p>Vui lòng chọn một nhóm từ danh sách bên trái để quản lý thiết bị.</p>
          </div>
        )}
      </div>

      {/* Dialogs & Sheets */}
      <ResourceGroupSheet
        open={isGroupSheetOpen}
        onOpenChange={setIsGroupSheetOpen}
        initialData={editingGroup}
      />

      <ResourceFormSheet
        open={isResourceSheetOpen}
        onOpenChange={setIsResourceSheetOpen}
        initialData={editingResource}
        groups={groups}
        preselectedGroupId={selectedGroupId || undefined}
      />

      <AlertDialog open={alertConfig.isOpen} onOpenChange={(open) => setAlertConfig(prev => ({ ...prev, isOpen: open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertConfig.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Đang xóa..." : "Xóa vĩnh viễn"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
