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
import { Button } from "@/shared/ui/button";
import { Edit2, GripVertical, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteCategoryAction } from "../actions";
import type { ServiceCategory } from "../types";
import { CategoryFormSheet } from "./category-form-sheet";

interface CategoriesTabProps {
  categories: ServiceCategory[];
}

export function CategoriesTab({ categories }: CategoriesTabProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

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

      {categories.length === 0 ? (
        <div className="text-center py-12 border rounded-lg border-dashed">
          <p className="text-muted-foreground">Chưa có danh mục nào. Thêm danh mục đầu tiên.</p>
          <Button variant="link" onClick={handleAdd}>Tạo ngay</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-3 p-3 bg-card border rounded-lg hover:shadow-sm transition-shadow group"
            >
              <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors">
                <GripVertical className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{category.name}</h4>
                {category.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {category.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                  onClick={() => handleEdit(category)}
                >
                  <Edit2 className="h-4 w-4" />
                  <span className="sr-only">Sửa</span>
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Xóa</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Danh mục &quot;{category.name}&quot; sẽ bị xóa. Bạn không thể xóa nếu danh mục này đang chứa dịch vụ.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(category.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Xóa
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        category={selectedCategory}
      />
    </div>
  );
}
