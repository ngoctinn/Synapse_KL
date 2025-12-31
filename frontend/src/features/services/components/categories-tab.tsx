"use client";

import { PageHeader } from "@/shared/components/page-header";
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
import { Checkbox } from "@/shared/ui/checkbox";
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
import { useEffect, useMemo, useState, useTransition } from "react";
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
  const [search, setSearch] = useState("");
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

  // Logic handleFormSubmit cho CategoryFormSheet (nếu cần xử lý tập trung)
  // Hiện tại Sheet tự gọi action bên trong, nên ta chỉ cần sync toast.


  const filteredItems = useMemo(() => {
    if (!search) return items;
    const searchLower = search.toLowerCase();
    return items.filter(cat =>
        cat.name.toLowerCase().includes(searchLower) ||
        (cat.description && cat.description.toLowerCase().includes(searchLower))
    );
  }, [items, search]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Danh mục dịch vụ"
        subtitle="Kéo thả để sắp xếp thứ tự hiển thị trên bảng giá và website"
        actionLabel="Thêm danh mục"
        onActionClick={handleAdd}
        onSearch={setSearch}
      />

      <div className="overflow-x-auto rounded-lg border border-border">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b-0">
                <TableHead className="w-12 bg-inherit"></TableHead>
                <TableHead className="w-12 font-bold text-foreground bg-inherit text-sm">No</TableHead>
                <TableHead className="w-12 bg-inherit">
                  <Checkbox disabled />
                </TableHead>
                <TableHead className="bg-inherit font-bold text-foreground text-sm">Tên Danh Mục</TableHead>
                <TableHead className="bg-inherit font-bold text-foreground text-sm">Mô tả</TableHead>
                <TableHead className="bg-inherit font-bold text-foreground text-sm text-right sticky right-0 bg-secondary z-10 w-[80px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext items={filteredItems} strategy={verticalListSortingStrategy}>
                {filteredItems.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            {search ? "Không tìm thấy danh mục nào." : "Chưa có danh mục nào."}
                        </TableCell>
                    </TableRow>
                ) : (
                    filteredItems.map((category: ServiceCategory, idx: number) => (
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
  index: number;
  isDeleting: boolean;
  onEdit: (category: ServiceCategory) => void;
  onDelete: (id: string) => void;
}

function SortableCategoryRow({ category, index, isDeleting, onEdit, onDelete }: SortableCategoryRowProps) {
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
        isDragging && "bg-accent opacity-80"
      )}
    >
      <TableCell className="w-12 py-2">
         <Button
           variant="ghost"
           size="icon"
           className="cursor-grab active:cursor-grabbing text-muted-foreground"
           {...attributes}
           {...listeners}
         >
           <GripVertical className="h-4 w-4" />
         </Button>
      </TableCell>
      <TableCell className="font-medium text-muted-foreground/80 py-2 w-12">
        {index + 1}
      </TableCell>
      <TableCell className="w-12 py-2">
        <Checkbox disabled />
      </TableCell>
      <TableCell className="font-medium py-2">
        {category.name}
      </TableCell>
      <TableCell className="py-2 text-muted-foreground line-clamp-1 max-w-sm" title={category.description || ""}>
         {category.description || "-"}
      </TableCell>
      <TableCell className="py-2 text-right sticky right-0 bg-card z-10 w-[80px]">
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <div
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-destructive hover:text-destructive-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa danh mục
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
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
                    className="bg-destructive"
                  >
                    Xóa
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
