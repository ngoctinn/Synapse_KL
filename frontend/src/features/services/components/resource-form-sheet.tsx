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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
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
              name="group_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Nhóm tài nguyên</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEdit}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn nhóm tài nguyên" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* This should be dynamically populated with actual group options */}
                      <SelectItem value={groupId}>{groupId}</SelectItem>
                    </SelectContent>
                  </Select>
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
