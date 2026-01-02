"use client";

import { TabToolbar } from "@/shared/components/tab-toolbar";
import { cn } from "@/shared/lib/utils";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Edit2, GripVertical, MoreHorizontal, Trash2 } from "lucide-react";
import React, { useEffect, useId, useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { deleteCategoryAction, reorderCategoriesAction } from "../actions";
import type { ServiceCategory } from "../types";
import { CategoryFormSheet } from "./category-form-sheet";
import { DeleteDialog } from "./delete-dialog";

interface CategoriesTabProps {
  categories: ServiceCategory[];
  variant?: "default" | "flat";
}

export function CategoriesTab({ categories, variant = "default" }: CategoriesTabProps) {
  const [items, setItems] = useState(categories);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [isDeleting, startDeleteTransition] = useTransition();
  const dndId = useId();

  const activeCategory = useMemo(() =>
    items.find(cat => cat.id === activeId),
    [items, activeId]
  );

  // Update items if prop changes (e.g. initial load or external update)
  useEffect(() => {
    setItems(categories);
  }, [categories]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
        // Prevent sorting from firing when clicking other elements in the row
        activationConstraint: {
            distance: 8,
        }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over?.id);
      const newItems = arrayMove(items, oldIndex, newIndex);

      // 1. Optimistic Update (Immediate Feedback)
      setItems(newItems);

      // 2. Sync with Server (Background)
      reorderCategoriesAction(newItems.map(i => i.id)).catch(() => {
          toast.error("Lỗi khi lưu thứ tự danh mục");
          setItems(items); // Revert on failure
      });
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setIsSheetOpen(true);
  };

  const handleDelete = (id: string) => {
    startDeleteTransition(async () => {
      try {
        await deleteCategoryAction(id);
        toast.success("Xóa danh mục thành công");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Không thể xóa danh mục");
      }
    });
  };

  // Tại sao

  return (
    <div data-slot="data-table" className="space-y-4 font-sans w-full max-w-full overflow-hidden">

      <TabToolbar
        title="Danh sách danh mục"
        description="Phân loại và quản lý các nhóm dịch vụ."
        actionLabel="Thêm danh mục"
        onActionClick={handleAdd}
        searchPlaceholder="Tìm kiếm danh mục..."
      />

      <div className={cn(
        "relative w-full overflow-x-auto",
        variant !== "flat" && "overflow-hidden rounded-xl border border-border bg-background"
      )}>
        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <Table className="min-w-full">
            <TableHeader className="bg-card/80 border-b border-neutral-10/60 sticky top-0 z-30 backdrop-blur-md">
              <TableRow className="hover:bg-transparent border-b border-neutral-20/50">
                <TableHead className="w-12 h-12 bg-inherit px-4"></TableHead>
                <TableHead className="w-12 h-12 font-semibold text-neutral-80 bg-inherit text-sm px-4">No</TableHead>
                <TableHead className="h-12 bg-inherit font-semibold text-neutral-80 text-sm px-4">Tên Danh Mục</TableHead>
                <TableHead className="h-12 bg-inherit font-semibold text-neutral-80 text-sm px-4">Mô tả</TableHead>
                <TableHead className="h-12 bg-inherit font-semibold text-neutral-80 text-sm px-4 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext items={items} strategy={verticalListSortingStrategy}>
                {items.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            Chưa có danh mục nào.
                        </TableCell>
                    </TableRow>
                ) : (
                    items.map((category: ServiceCategory, idx: number) => (
                    <SortableCategoryRow
                        key={category.id}
                        category={category}
                        index={idx}
                        isDeleting={isDeleting}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                    ))
                )}
              </SortableContext>
            </TableBody>
          </Table>


          {typeof document !== 'undefined' && createPortal(
            <DragOverlay dropAnimation={null}>
              {activeId && activeCategory ? (
                <div className="w-full border rounded-xl bg-background shadow-2xl opacity-90 overflow-hidden ring-2 ring-primary/20">
                  <table className="w-full border-collapse">
                    <tbody>
                        <CategoryStaticRow
                          category={activeCategory}
                          index={items.findIndex(c => c.id === activeId)}
                        />
                    </tbody>
                  </table>
                </div>
              ) : null}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </div>

      <CategoryFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        category={selectedCategory}
      />
    </div>
  );
}

// --- Memoized Sortable Row Component ---
interface SortableCategoryRowProps {
  category: ServiceCategory;
  index: number;
  isDeleting: boolean;
  onEdit: (category: ServiceCategory) => void;
  onDelete: (id: string) => void;
  isDragDisabled?: boolean;
}

const SortableCategoryRow = React.memo(({ category, index, isDeleting, onEdit, onDelete, isDragDisabled }: SortableCategoryRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id, disabled: isDragDisabled });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 0 : 1,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        "group transition-all duration-200 border-b border-neutral-20/50 last:border-0 h-16 hover:bg-neutral-5/20",
        isDragging && "bg-muted/50"
      )}
    >
      <TableCell className="w-12 py-2 px-4">
         <Button
           variant="ghost"
           size="icon"
            className={cn("h-8 w-8 transition-colors", isDragDisabled ? "opacity-20 cursor-not-allowed" : "cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-primary")}
            disabled={isDragDisabled}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </Button>
      </TableCell>
      <TableCell className="font-semibold text-sm text-neutral-60 py-2 w-12 px-4">
        {index + 1}
      </TableCell>
      <TableCell className="font-semibold text-sm text-neutral-80 py-2 px-4">
        {category.name}
      </TableCell>
      <TableCell className="py-2 px-4 text-xs text-neutral-60 font-medium line-clamp-1 max-w-sm" title={category.description || ""}>
         {category.description || "-"}
      </TableCell>
      <TableCell className="py-2 px-4 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(category)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DeleteDialog
               title="Xác nhận xóa?"
               description={`Danh mục "${category.name}" sẽ bị xóa. Bạn không thể xóa nếu danh mục này đang chứa dịch vụ.`}
               onConfirm={() => onDelete(category.id)}
               trigger={
                <div
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none transition-colors hover:bg-destructive/10  text-destructive gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Xóa danh mục</span>
                </div>
               }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

SortableCategoryRow.displayName = "SortableCategoryRow";

// --- Static Static Row for DragOverlay ---
function CategoryStaticRow({ category, index }: { category: ServiceCategory; index: number }) {
  return (
    <TableRow className="h-16 bg-background border-none">
      <TableCell className="w-12 py-2 px-4">
         <Button variant="ghost" size="icon" className="h-8 w-8 cursor-grabbing text-primary">
           <GripVertical className="h-4 w-4" />
         </Button>
      </TableCell>
      <TableCell className="font-semibold text-sm text-neutral-60 py-2 w-12 px-4">
        {index + 1}
      </TableCell>
      <TableCell className="font-semibold text-sm text-neutral-80 py-2 px-4">
        {category.name}
      </TableCell>
      <TableCell className="py-2 px-4 text-xs text-neutral-60 font-medium line-clamp-1 max-w-sm">
         {category.description || "-"}
      </TableCell>
      <TableCell className="py-2 px-4 text-right">
         <Button variant="ghost" size="icon" disabled>
           <MoreHorizontal className="h-4 w-4" />
         </Button>
      </TableCell>
    </TableRow>
  );
}
