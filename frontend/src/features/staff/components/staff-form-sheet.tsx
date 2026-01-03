"use client";

import {
  inviteStaffAction,
  updateStaffWithSkillsAction
} from "@/features/staff/actions";
import { SkillSelector } from "@/features/staff/components/skill-selector";
import { staffInviteSchema, staffProfileSchema } from "@/features/staff/schemas";
import type { StaffProfileWithSkills } from "@/features/staff/types";
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
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface StaffFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: StaffProfileWithSkills;
  onSuccess?: () => void;
}

export function StaffFormSheet({ open, onOpenChange, staff, onSuccess }: StaffFormSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!staff;

  // Conditional schema and default values
  const schema = isEdit ? staffProfileSchema : staffInviteSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: isEdit
      ? {
          user_id: staff.user_id,
          full_name: staff.full_name,
          title: staff.title,
          bio: staff.bio || "",
          color_code: staff.color_code,
          is_active: staff.is_active,
        }
      : {
          email: "",
          full_name: "",
          title: "Kỹ thuật viên",
          role: "technician",
        },
  });

  const [skillIds, setSkillIds] = useState<string[]>(staff?.skill_ids || []);

  useEffect(() => {
    if (open) {
      if (staff) {
        form.reset({
          user_id: staff.user_id,
          full_name: staff.full_name,
          title: staff.title,
          bio: staff.bio || "",
          color_code: staff.color_code,
          is_active: staff.is_active,
        });
        setSkillIds(staff.skill_ids);
      } else {
        form.reset({
          email: "",
          full_name: "",
          title: "Kỹ thuật viên",
          role: "technician",
        });
        setSkillIds([]);
      }
    }
  }, [staff, form, open]);

  const {
    handleOpenChange,
    showExitConfirm,
    setShowExitConfirm,
    handleConfirmExit,
    contentProps,
  } = useFormGuard({
    isDirty: form.formState.isDirty,
    onClose: () => onOpenChange(false),
    onReset: () => form.reset(),
  });

  async function onSubmit(values: any) {
    try {
      setIsSubmitting(true);
      let result;

      if (isEdit) {
        // Edit Mode
        result = await updateStaffWithSkillsAction(staff.user_id, values, { skill_ids: skillIds });
      } else {
        // Invite Mode
        result = await inviteStaffAction(values);
      }

      if (result.success) {
        toast.success(result.message);
        onSuccess?.();
        onOpenChange(false);
        form.reset();
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
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className="sm:max-w-xl w-full flex flex-col p-0 gap-0" {...contentProps}>
          <div className="bg-primary/5 p-8 border-b border-primary/10">
            <SheetHeader className="text-left space-y-1">
              <SheetTitle className="text-2xl font-bold tracking-tight text-primary">
                {isEdit ? "Cập nhật hồ sơ" : "Mời nhân viên mới"}
              </SheetTitle>
              <SheetDescription className="text-muted-foreground font-medium">
                {isEdit
                  ? "Chỉnh sửa thông tin chuyên môn của nhân viên."
                  : "Gửi email mời nhân viên tham gia hệ thống."}
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* Invite specific fields */}
                {!isEdit && (
                   <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80 font-semibold tracking-tight">Email</FormLabel>
                        <FormControl>
                          <Input placeholder="staff@synapse.com" {...field} className="h-12 rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80 font-semibold tracking-tight">Họ và tên</FormLabel>
                      <FormControl>
                        <Input placeholder="Nguyễn Văn A" {...field} className="h-12 rounded-xl" />
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

                  {!isEdit ? (
                     <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/80 font-semibold tracking-tight">Vai trò</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn vai trò" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="technician">Kỹ thuật viên</SelectItem>
                              <SelectItem value="receptionist">Lễ tân</SelectItem>
                              <SelectItem value="manager">Quản lý</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <FormField
                      control={form.control}
                      name="color_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/80 font-semibold tracking-tight">Mã màu</FormLabel>
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
                  )}
                </div>

                {/* Edit specific fields */}
                {isEdit && (
                  <>
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
                              placeholder="Kinh nghiệm 5 năm..."
                              className="min-h-[100px] resize-none"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <div className="pt-6 flex gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => handleOpenChange(false)}
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
    </>
  );
}

