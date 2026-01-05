"use client"

import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd"
import { Plus } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

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
import { ScrollArea } from "@/shared/ui/scroll-area"

import { deleteCategory, reorderCategories } from "../api/actions"
import { Category } from "../model/schemas"
import { CategoryItem } from "./category-item"
import { CategorySheet } from "./category-sheet"

interface CategorySidebarProps {
  categories: Category[]
  selectedId?: string
  onSelect: (id: string | undefined) => void
}

export function CategorySidebar({ categories, selectedId, onSelect }: CategorySidebarProps) {
  const [localCategories, setLocalCategories] = useState(categories)
  const [isPending, startTransition] = useTransition()

  // Sheet State
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  // Alert State
  const [alertOpen, setAlertOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Sync props to local state when server data changes (and we are not dragging)
  // Note: careful with this in drag-and-drop contexts, but simplified here.
  if (JSON.stringify(categories) !== JSON.stringify(localCategories) && !isPending) {
    setLocalCategories(categories)
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(localCategories)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setLocalCategories(items)

    // Call server action to persist order
    const ids = items.map((item) => item.id)
    startTransition(async () => {
      const res = await reorderCategories(ids)
      if (!res.success) {
        toast.error("Lỗi cập nhật thứ tự")
        // Revert state if needed (omitted for brevity)
      }
    })
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsSheetOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setDeletingId(id)
    setAlertOpen(true)
  }

  const confirmDelete = () => {
    if (!deletingId) return
    startTransition(async () => {
      const res = await deleteCategory(deletingId)
      if (res.success) {
        toast.success("Đã xóa danh mục")
        if (selectedId === deletingId) onSelect(undefined)
      } else {
        toast.error(res.error || "Không thể xóa danh mục")
      }
      setAlertOpen(false)
      setDeletingId(null)
    })
  }

  return (
    <div className="flex flex-col h-full" suppressHydrationWarning>
      <div className="p-4 border-b flex items-center justify-between" suppressHydrationWarning>
        <h2 className="font-semibold text-lg">Danh mục</h2>
        <Button size="sm" variant="outline" onClick={() => { setEditingCategory(null); setIsSheetOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          <Button
            variant={selectedId === undefined ? "secondary" : "ghost"}
            className="w-full justify-start mb-2 font-medium"
            onClick={() => onSelect(undefined)}
          >
            Tất cả dịch vụ
          </Button>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="categories">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
                  {localCategories.map((category, index) => (
                    <Draggable key={category.id} draggableId={category.id} index={index}>
                      {(provided, snapshot) => (
                        <CategoryItem
                          category={category}
                          isSelected={selectedId === category.id}
                          isDragging={snapshot.isDragging}
                          provided={provided}
                          onSelect={onSelect}
                          onEdit={handleEdit}
                          onDelete={handleDeleteClick}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </ScrollArea>

      <CategorySheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        initialData={editingCategory}
      />

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa danh mục này?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Các dịch vụ trong danh mục này sẽ bị mất liên kết danh mục (nhưng không bị xóa).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isPending ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
