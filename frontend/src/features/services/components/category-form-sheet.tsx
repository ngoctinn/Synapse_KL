"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { categoryCreateSchema, type CategoryCreateForm } from "../schemas";
import { createCategoryAction, updateCategoryAction } from "../actions";
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
  if (open && form.getValues("name") !== (category?.name || "")) {
    form.reset({
      name: category?.name || "",
      description: category?.description || "",
    });
  }

  async function onSubmit(data: CategoryCreateForm) {
    startTransition(async () => {
      try {
        if (isEdit && category) {
          await updateCategoryAction(category.id, data);
          toast.success("Cập nhật danh mục thành công");
        } else {
          await createCategoryAction(data);
          toast.success("Tạo danh mục mới thành công");
        }
        onOpenChange(false);
        form.reset();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Đã có lỗi xảy ra");
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
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
                  <FormLabel>Tên danh mục</FormLabel>
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
