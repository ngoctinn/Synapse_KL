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
import { useActionState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createSkillAction, updateSkillAction } from "../actions";
import { skillCreateSchema, type SkillCreateForm } from "../schemas";
import type { Skill } from "../types";

interface SkillFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skill?: Skill | null;
}

export function SkillFormSheet({
  open,
  onOpenChange,
  skill,
}: SkillFormSheetProps) {
  const isEdit = !!skill;
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(skillCreateSchema),
    defaultValues: {
      name: skill?.name || "",
      code: skill?.code || "",
      description: skill?.description || "",
    },
  });

  // Reset form khi mở/đóng hoặc đổi skill
  useEffect(() => {
    if (open) {
      form.reset({
        name: skill?.name || "",
        code: skill?.code || "",
        description: skill?.description || "",
      });
    }
  }, [open, skill, form]);

  async function onSubmit(data: SkillCreateForm) {
    startTransition(async () => {
      const result = isEdit && skill 
        ? await updateSkillAction(skill.id, data)
        : await createSkillAction(data);

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
          <SheetTitle>{isEdit ? "Chỉnh sửa kỹ năng" : "Thêm kỹ năng mới"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Cập nhật thông tin kỹ năng của Spa."
              : "Tạo kỹ năng mới để gán cho kỹ thuật viên và dịch vụ."}
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
                  <FormLabel required>Tên kỹ năng</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Massage Thái" {...field} />
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
                  <FormLabel>Mã kỹ năng</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: MASSAGE_THAI"
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
                      placeholder="Mô tả ngắn gọn về kỹ năng..."
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
