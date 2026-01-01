"use client";

import { useFormGuard } from "@/shared/hooks/use-form-guard";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
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
import { createResourceAction } from "../actions";
import { resourceCreateSchema, type ResourceCreateForm } from "../schemas";
import type { Resource } from "../types";

interface ResourceFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  groupName?: string;
  resource?: Resource | null;
}

export function ResourceFormSheet({
  open,
  onOpenChange,
  groupId,
  groupName,
  resource,
}: ResourceFormSheetProps) {
  const isEdit = !!resource;
  const [isPending, startTransition] = useTransition();

  const form = useForm<ResourceCreateForm>({
    resolver: zodResolver(resourceCreateSchema),
    defaultValues: {
      group_id: groupId,
      name: resource?.name || "",
      code: resource?.code || "",
      status: resource?.status || "ACTIVE",
      description: resource?.description || "",
      image_url: resource?.image_url || "",
    },
  });

  // Reset form
  useEffect(() => {
    if (open) {
      form.reset({
        group_id: groupId,
        name: resource?.name || "",
        code: resource?.code || "",
        status: resource?.status || "ACTIVE",
        description: resource?.description || "",
        image_url: resource?.image_url || "",
      });
    }
  }, [open, groupId, resource, form]);

  const {
    handleOpenChange,
    showExitConfirm,
    setShowExitConfirm,
    handleConfirmExit,
    contentProps
  } = useFormGuard({
    isDirty: form.formState.isDirty,
    onClose: () => onOpenChange(false),
    onReset: () => form.reset(),
  });

  async function onSubmit(data: ResourceCreateForm) {
    if (isEdit) {
      toast.error("Tính năng cập nhật tài nguyên đang được phát triển");
      return;
    }

    startTransition(async () => {
      const result = await createResourceAction(data);
      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          className="sm:max-w-md flex flex-col"
          {...contentProps}
        >
          <SheetHeader>
            <SheetTitle>{isEdit ? "Chỉnh sửa tài nguyên" : "Thêm tài nguyên"}</SheetTitle>
            <SheetDescription>
              Nhập thông tin chi tiết cho tài nguyên mới trong nhóm <strong>{groupName || groupId}</strong>.
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-4 flex-1"
            >
              <FormField
                control={form.control}
                name="group_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Nhóm tài nguyên</FormLabel>
                    <FormControl>
                      <Input value={groupName || field.value} disabled className="bg-muted/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Tên tài nguyên</FormLabel>
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả về tài nguyên này..."
                        className="resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-6 border-t mt-auto">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleOpenChange(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isPending} className="min-w-[100px]">
                  {isEdit ? "Cập nhật" : "Tạo mới"}
                </Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Thay đổi chưa được lưu</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn đang nhập dở thông tin tài nguyên. Thoát bây giờ sẽ làm mất các dữ liệu này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmExit}
              className="bg-destructive hover:bg-destructive/90"
            >
              Thoát và bỏ qua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
