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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/ui/select";
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
import { createResourceGroupAction } from "../actions";
import { resourceGroupCreateSchema, type ResourceGroupCreateForm } from "../schemas";
import type { ResourceGroup } from "../types";

interface ResourceGroupFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: ResourceGroup | null;
}

export function ResourceGroupFormSheet({
  open,
  onOpenChange,
  group,
}: ResourceGroupFormSheetProps) {
  const isEdit = !!group;
  const [isPending, startTransition] = useTransition();

  const form = useForm<ResourceGroupCreateForm>({
    resolver: zodResolver(resourceGroupCreateSchema),
    defaultValues: {
      name: group?.name || "",
      type: group?.type || "BED",
      description: group?.description || "",
    },
  });

  // 1. Fix: Side-effect (resetting form) inside useEffect
  useEffect(() => {
    if (open) {
      form.reset({
        name: group?.name || "",
        type: group?.type || "BED",
        description: group?.description || "",
      });
    }
  }, [open, group, form]);

  // 2. Fix: Use standardized dirty guard
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

  async function onSubmit(data: ResourceGroupCreateForm) {
    if (isEdit) {
      toast.error("Tính năng cập nhật nhóm đang được phát triển");
      return;
    }

    startTransition(async () => {
      try {
        await createResourceGroupAction(data);
        toast.success("Tạo nhóm tài nguyên thành công");
        onOpenChange(false);
        form.reset();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Đã có lỗi xảy ra");
      }
    });
  }

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className="sm:max-w-md" {...contentProps}>
        <SheetHeader>
          <SheetTitle>{isEdit ? "Chỉnh sửa nhóm" : "Thêm nhóm tài nguyên"}</SheetTitle>
          <SheetDescription>
            Nhóm giúp phân loại tài nguyên (VD: Giường massage, Máy công nghệ cao).
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
                  <FormLabel required>Tên nhóm tài nguyên</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Giường chức năng" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Loại tài nguyên</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isEdit}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BED">Giường (BED)</SelectItem>
                      <SelectItem value="EQUIPMENT">Thiết bị (EQUIPMENT)</SelectItem>
                      <SelectItem value="ROOM">Phòng (ROOM)</SelectItem>
                      <SelectItem value="OTHER">Khác (OTHER)</SelectItem>
                    </SelectContent>
                  </Select>
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
                      placeholder="Mô tả về nhóm tài nguyên này..."
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
                variant="ghost"
                onClick={() => handleOpenChange(false)}
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

      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Thay đổi chưa được lưu</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn đang nhập dở thông tin. Thoát bây giờ sẽ làm mất các dữ liệu này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục chỉnh sửa</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmExit}
              className="bg-destructive hover:bg-destructive/90"
            >
              Thoát và bỏ qua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
    </>
  );
}
