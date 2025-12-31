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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { resourceGroupCreateSchema, type ResourceGroupCreateForm } from "../schemas";
import { createResourceGroupAction } from "../actions";
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

  // Reset form
  if (open && form.getValues("name") !== (group?.name || "")) {
    form.reset({
      name: group?.name || "",
      type: group?.type || "BED",
      description: group?.description || "",
    });
  }

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
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
                  <FormLabel>Tên nhóm</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Giường Massage" {...field} />
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
                  <FormLabel>Loại tài nguyên</FormLabel>
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
