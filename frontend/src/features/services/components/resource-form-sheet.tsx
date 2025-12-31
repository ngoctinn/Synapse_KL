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
import { resourceCreateSchema, type ResourceCreateForm } from "../schemas";
import { createResourceAction } from "../actions";
import type { Resource } from "../types";

interface ResourceFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  resource?: Resource | null;
}

export function ResourceFormSheet({
  open,
  onOpenChange,
  groupId,
  resource,
}: ResourceFormSheetProps) {
  const isEdit = !!resource;
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(resourceCreateSchema),
    defaultValues: {
      group_id: groupId,
      name: resource?.name || "",
      code: resource?.code || "",
      status: (resource?.status || "ACTIVE") as any,
      setup_time_minutes: resource?.setup_time_minutes ?? 0,
      description: resource?.description || "",
      image_url: resource?.image_url || "",
    },
  });

  // Reset form
  if (open && (form.getValues("name") !== (resource?.name || "") || form.getValues("group_id") !== groupId)) {
    form.reset({
      group_id: groupId,
      name: resource?.name || "",
      code: resource?.code || "",
      status: resource?.status || "ACTIVE",
      setup_time_minutes: resource?.setup_time_minutes ?? 0,
      description: resource?.description || "",
      image_url: resource?.image_url || "",
    });
  }

  async function onSubmit(data: ResourceCreateForm) {
    if (isEdit) {
      toast.error("Tính năng cập nhật tài nguyên đang được phát triển");
      return;
    }

    startTransition(async () => {
      try {
        await createResourceAction(data);
        toast.success("Thêm tài nguyên thành công");
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
          <SheetTitle>{isEdit ? "Chỉnh sửa tài nguyên" : "Thêm tài nguyên"}</SheetTitle>
          <SheetDescription>
            Nhập thông tin chi tiết cho tài nguyên mới trong nhóm này.
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
                  <FormLabel>Tên tài nguyên</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Giường 01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã định danh</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: BED-01"
                      {...field}
                      disabled={isEdit}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="setup_time_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thời gian chuẩn bị (phút)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
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
                      placeholder="Mô tả về tài nguyên này..."
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
