"use client";

import { Button } from "@/shared/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { Textarea } from "@/shared/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createCategoryAction, updateCategoryAction } from "../actions";
import { categoryCreateSchema, type CategoryCreateForm } from "../schemas";
import type { ServiceCategory } from "../types";

interface CategoryFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ServiceCategory | null;
}

export function CategoryFormSheet({
  open,
  onOpenChange,
  category,
}: CategoryFormSheetProps) {
  const isEdit = !!category;
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(categoryCreateSchema),
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
    },
  });

  // Reset form khi mở/đóng hoặc đổi category
  useEffect(() => {
    if (open) {
      form.reset({
        name: category?.name || "",
        description: category?.description || "",
      });
    }
  }, [open, category, form]);

  async function onSubmit(data: CategoryCreateForm) {
    startTransition(async () => {
      const result = isEdit && category
        ? await updateCategoryAction(category.id, data)
        : await createCategoryAction(data);

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && form.formState.isDirty) {
      if (confirm("Bạn có thay đổi chưa lưu. Bạn có chắc muốn thoát không?")) {
        onOpenChange(false);
      }
      return;
    }
    onOpenChange(open);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent 
        className="sm:max-w-md"
        onPointerDownOutside={(e) => {
          if (form.formState.isDirty) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (form.formState.isDirty) e.preventDefault();
        }}
      >
        <SheetHeader>
          <SheetTitle>{isEdit ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Cập nhật thông tin danh mục dịch vụ."
              : "Tạo danh mục mới để phân loại các dịch vụ Spa."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Tên danh mục</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Chăm sóc da mặt" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả về danh mục này..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isEdit ? "Cập nhật" : "Tạo mới"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
