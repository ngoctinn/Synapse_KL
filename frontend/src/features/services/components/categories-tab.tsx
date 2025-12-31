"use client";

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
import { Button } from "@/shared/ui/button";
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
import { Edit2, GripVertical, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteCategoryAction, reorderCategoriesAction } from "../actions";
import type { ServiceCategory } from "../types";
import { CategoryFormSheet } from "./category-form-sheet";

interface CategoriesTabProps {
  categories: ServiceCategory[];
}

export function CategoriesTab({ categories }: CategoriesTabProps) {
  const [items, setItems] = useState(categories);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Danh mục dịch vụ</h3>
          <p className="text-sm text-muted-foreground">
            Kéo thả để sắp xếp thứ tự hiển thị trên bảng giá và website
          </p>
        </div>
        <Button onClick={handleAdd} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm danh mục
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-10">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b-0">
                <TableHead className="w-12 bg-inherit"></TableHead>
                <TableHead className="bg-inherit font-bold text-foreground text-sm">Tên Danh Mục</TableHead>
                <TableHead className="bg-inherit font-bold text-foreground text-sm">Mô tả</TableHead>
                <TableHead className="bg-inherit font-bold text-foreground text-sm text-right sticky right-0 bg-secondary shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)] z-10 w-[100px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext items={items} strategy={verticalListSortingStrategy}>
                {items.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            Chưa có danh mục nào.
                        </TableCell>
                    </TableRow>
                ) : (
                    items.map((category) => (
                    <SortableCategoryRow
                        key={category.id}
                        category={category}
                        isDeleting={isDeleting}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                    ))
                )}
              </SortableContext>
            </TableBody>
          </Table>
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

// --- Sortable Row Component ---
interface SortableCategoryRowProps {
  category: ServiceCategory;
  isDeleting: boolean;
  onEdit: (category: ServiceCategory) => void;
  onDelete: (id: string) => void;
}

function SortableCategoryRow({ category, isDeleting, onEdit, onDelete }: SortableCategoryRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
    position: "relative" as const,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        "hover:bg-muted/30 transition-colors",
        isDragging && "bg-accent opacity-80 shadow-md"
      )}
    >
      <TableCell className="w-12 py-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-grab active:cursor-grabbing text-muted-foreground hover:bg-muted"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </Button>
      </TableCell>
      <TableCell className="font-medium py-2">
        {category.name}
      </TableCell>
      <TableCell className="py-2 text-muted-foreground line-clamp-1 max-w-sm" title={category.description || ""}>
         {category.description || "-"}
      </TableCell>
      <TableCell className="py-2 text-right sticky right-0 bg-card shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)] z-10 w-[100px]">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => onEdit(category)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                <AlertDialogDescription>
                  Danh mục "{category.name}" sẽ bị xóa. Bạn không thể xóa nếu danh mục này đang chứa dịch vụ.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(category.id)}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}
