"use client";

import {
  createStaffProfileAction,
  updateStaffWithSkillsAction
} from "@/features/staff/actions";
import { SkillSelector } from "@/features/staff/components/skill-selector";
import { staffProfileSchema } from "@/features/staff/schemas";
import type { StaffProfileWithSkills } from "@/features/staff/types";
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
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

interface StaffFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: StaffProfileWithSkills;
  onSuccess?: () => void;
}

export function StaffFormSheet({ open, onOpenChange, staff, onSuccess }: StaffFormSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!staff;

  const form = useForm<z.infer<typeof staffProfileSchema>>({
    resolver: zodResolver(staffProfileSchema),
    defaultValues: {
      user_id: staff?.user_id || "00000000-0000-0000-0000-000000000000", // Placeholder for invite
      full_name: staff?.full_name || "",
      title: staff?.title || "Kỹ thuật viên",
      bio: staff?.bio || "",
      color_code: staff?.color_code || "#6366F1",
    },
  });

  const [skillIds, setSkillIds] = useState<string[]>(staff?.skill_ids || []);

  useEffect(() => {
    if (staff) {
      form.reset({
        user_id: staff.user_id,
        full_name: staff.full_name,
        title: staff.title,
        bio: staff.bio || "",
        color_code: staff.color_code,
      });
      setSkillIds(staff.skill_ids);
    } else {
      form.reset({
        user_id: "00000000-0000-0000-0000-000000000000",
        full_name: "",
        title: "Kỹ thuật viên",
        bio: "",
        color_code: "#6366F1",
      });
      setSkillIds([]);
    }
  }, [staff, form, open]);

  async function onSubmit(values: z.infer<typeof staffProfileSchema>) {
    try {
      setIsSubmitting(true);

      let result;
      if (isEdit) {
        // Combined update for atomicity at action level
        result = await updateStaffWithSkillsAction(staff.user_id, values, { skill_ids: skillIds });
      } else {
        // Luồng mời nhân viên (GIẢ ĐỊNH - Cần backend hỗ trợ invite endpoint thực thụ)
        // Hiện tại giả định user_id được sinh ra hoặc gán tay cho MVP.
        result = await createStaffProfileAction(values);
        if (result.success && skillIds.length > 0) {
           // Gán skills ngay sau khi tạo nếu thành công
           // (Cần user_id thực tế từ result nếu result trả về model)
        }
      }

      if (result.success) {
        toast.success(result.message);
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Đã có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl w-full flex flex-col p-0 gap-0">
        <div className="bg-primary/5 p-8 border-b border-primary/10">
          <SheetHeader className="text-left space-y-1">
            <SheetTitle className="text-2xl font-bold tracking-tight text-primary">
              {isEdit ? "Cập nhật hồ sơ" : "Mời nhân viên mới"}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground font-medium">
              {isEdit ? "Chỉnh sửa thông tin chuyên môn của nhân viên." : "Thông tin này sẽ được gửi kèm lời mời làm việc."}
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80 font-semibold tracking-tight">Họ và tên</FormLabel>
                    <FormControl>
                      <Input placeholder="Nguyễn Văn A" {...field} className="h-12 rounded-xl border-muted-foreground/20 focus:ring-primary/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80 font-semibold tracking-tight">Chức danh</FormLabel>
                      <FormControl>
                        <Input placeholder="Kỹ thuật viên" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80 font-semibold tracking-tight">Mã màu hiển thị</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input type="color" {...field} className="w-16 p-1 cursor-pointer" />
                          <Input {...field} placeholder="#000000" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormItem>
                <FormLabel className="text-foreground/80 font-semibold tracking-tight">Kỹ năng chuyên môn</FormLabel>
                <SkillSelector value={skillIds} onChange={setSkillIds} />
              </FormItem>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80 font-semibold tracking-tight">Mô tả / Giới thiệu</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Kinh nghiệm 5 năm trong ngành spa..."
                        className="min-h-[100px] resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-6 flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 shadow-lg shadow-primary/20"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isEdit ? "Lưu thay đổi" : "Gửi lời mời"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
