"use client";

import { useFormGuard } from "@/shared/hooks/use-form-guard";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Form } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import {
  createCategoryAction,
  createSkillAction
} from "../actions";
import { serviceCreateSchema, type ServiceCreateForm } from "../schemas";
import type { ResourceGroup, ResourceGroupWithCount, ServiceCategory, ServiceWithDetails, Skill } from "../types";
import { ServiceGeneralTab } from "./service-form/service-general-tab";
import { ServicePricingTab } from "./service-form/service-pricing-tab";
import { ServiceResourceTab } from "./service-form/service-resource-tab";

interface ServiceFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ServiceCategory[];
  skills: Skill[];
  resourceGroups: ResourceGroupWithCount[] | ResourceGroup[];
  service?: ServiceWithDetails | null;
  onSubmit: (data: ServiceCreateForm) => Promise<void>;
}

export function ServiceFormSheet({
  open,
  onOpenChange,
  categories,
  skills,
  resourceGroups,
  service,
  onSubmit,
}: ServiceFormSheetProps) {
  const isEdit = !!service;
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("general");
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showSkillDialog, setShowSkillDialog] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newSkillName, setNewSkillName] = useState("");
  const [isCreatingSub, setIsCreatingSub] = useState(false);

  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(serviceCreateSchema),
    defaultValues: {
        category_id: service?.category_id || "uncategorized",
      name: service?.name || "",
        duration: service?.duration ?? 0,
        buffer_time: service?.buffer_time ?? 0,
      price: Number(service?.price) || 0,
      description: service?.description || "",
      image_url: service?.image_url || "",
      is_active: service?.is_active ?? true,
      skill_ids: service?.skills.map((s) => s.id) || [],
      resource_requirements: service?.resource_requirements.map(r => ({
        group_id: r.group_id,
        quantity: r.quantity,
        start_delay: r.start_delay,
        usage_duration: r.usage_duration ?? undefined
      })) || [],
    },
  });

  // Reset form when service changes
  useEffect(() => {
    if (open) {
      form.reset({
          category_id: service?.category_id || "uncategorized",
        name: service?.name || "",
        duration: service?.duration ?? 0,
        buffer_time: service?.buffer_time ?? 0,
        price: Number(service?.price) || 0,
        description: service?.description || "",
        image_url: service?.image_url || "",
        is_active: service?.is_active ?? true,
        skill_ids: service?.skills.map((s) => s.id) || [],
        resource_requirements: service?.resource_requirements.map(r => ({
          group_id: r.group_id,
          quantity: r.quantity,
          start_delay: r.start_delay,
          usage_duration: r.usage_duration ?? undefined
        })) || [],
      });
      setActiveTab("general");
    }
  }, [open, service, form]);

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

  const errors = form.formState.errors;
  const tabErrors = {
    general: !!(errors.name || errors.category_id || errors.description),
    pricing: !!(errors.price || errors.duration || errors.buffer_time),
    technical: !!(errors.skill_ids || errors.resource_requirements),
  };

  const onInvalid = (errors: FieldErrors<ServiceCreateForm>) => {
    const hasGeneralError = !!(errors.name || errors.category_id || errors.description);
    const hasPricingError = !!(errors.price || errors.duration || errors.buffer_time);
    const hasTechnicalError = !!(errors.skill_ids || errors.resource_requirements);

    if (hasGeneralError) setActiveTab("general");
    else if (hasPricingError) setActiveTab("pricing");
    else if (hasTechnicalError) setActiveTab("technical");
  };

  async function handleFormSubmit(data: ServiceCreateForm) {
    // Validate resource availability
    for (const req of data.resource_requirements || []) {
      const group = (resourceGroups as ResourceGroupWithCount[]).find(g => g.id === req.group_id);
      if (group && 'active_count' in group && req.quantity > group.active_count) {
        toast.error(`Nhóm "${group.name}" chỉ có ${group.active_count} tài nguyên khả dụng.`);
        setActiveTab("technical");
        return;
      }
    }

    startTransition(async () => {
      try {
        await onSubmit(data);
        form.reset(data); // Reset with new data to clear isDirty
        onOpenChange(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Đã có lỗi xảy ra");
      }
    });
  }

  async function handleCreateCategory() {
    if (!newCatName) return;
    setIsCreatingSub(true);
    try {
      const res = await createCategoryAction({ name: newCatName });
      if (res.success) {
        toast.success("Đã tạo danh mục mới");
        setShowCategoryDialog(false);
        setNewCatName("");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsCreatingSub(false);
    }
  }

  async function handleCreateSkill() {
    if (!newSkillName) return;
    setIsCreatingSub(true);
    try {
      const res = await createSkillAction({ name: newSkillName });
      if (res.success) {
        toast.success("Đã tạo kỹ năng mới");
        setShowSkillDialog(false);
        setNewSkillName("");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsCreatingSub(false);
    }
  }

  // Validation Logic: Check if resources exceed service duration
  const duration = form.watch("duration");
  const bufferTime = form.watch("buffer_time");
  const resourceRequirements = form.watch("resource_requirements");

  const totalDuration = (duration || 0) + (bufferTime || 0);
  const conflictResources = resourceRequirements?.filter(r => {
    const end = (r.start_delay || 0) + (r.usage_duration || 0);
    return end > totalDuration;
  }) || [];

  const hasResourceConflict = conflictResources.length > 0;

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className="sm:max-w-xl w-full flex flex-col p-0 gap-0" {...contentProps}>
          <SheetHeader className="p-6 pb-2 shrink-0">
            <SheetTitle>{isEdit ? "Cập nhật dịch vụ" : "Thêm dịch vụ mới"}</SheetTitle>
            <SheetDescription>
              {isEdit ? "Điều chỉnh thông tin dịch vụ." : "Thiết lập thông tin dịch vụ mới."}
            </SheetDescription>
          </SheetHeader>

          {hasResourceConflict && (
              <div className="px-6 pb-2">
                <Alert variant="destructive" className="py-2.5 bg-destructive/10 border-destructive/20 text-destructive">
                  <AlertTriangle className="h-4 w-4 stroke-destructive" />
                  <AlertTitle className="ml-2 font-semibold text-destructive">Xung đột thời gian</AlertTitle>
                  <AlertDescription className="ml-2 text-xs text-destructive/90">
                    Có {conflictResources.length} tài nguyên dùng quá tổng thời lượng ({totalDuration}p).
                    Vui lòng chỉnh lại ở tab &quot;Kỹ thuật&quot;.
                  </AlertDescription>
                </Alert>
              </div>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit, onInvalid)}
              className="flex-1 flex flex-col min-h-0"
            >
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger
                      value="general"
                      className="relative"
                    >
                      Thông tin chung
                      {tabErrors.general && (
                        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-destructive" />
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="pricing"
                      className="relative"
                    >
                      Giá & Thời gian
                      {tabErrors.pricing && (
                        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-destructive" />
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="technical"
                      className="relative"
                    >
                      Kỹ thuật
                      {tabErrors.technical && (
                        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-destructive" />
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="mt-0 focus-visible:ring-0 outline-none">
                    <ServiceGeneralTab
                      categories={categories}
                      onAddCategory={() => setShowCategoryDialog(true)}
                    />
                  </TabsContent>

                  <TabsContent value="pricing" className="mt-0 focus-visible:ring-0 outline-none">
                    <ServicePricingTab />
                  </TabsContent>

                  <TabsContent value="technical" className="mt-0 focus-visible:ring-0 outline-none">
                     <ServiceResourceTab
                        skills={skills}
                        resourceGroups={resourceGroups}
                        onAddSkill={() => setShowSkillDialog(true)}
                     />
                  </TabsContent>
                </Tabs>
              </div>

              <div className="p-6 border-t bg-background shrink-0 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleOpenChange(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isPending || hasResourceConflict} className="min-w-[120px]">
                  {isEdit ? "Lưu thay đổi" : "Tạo dịch vụ"}
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
                Bạn đã thực hiện một số thay đổi trong biểu mẫu. Nếu thoát bây giờ, tất cả dữ liệu đã nhập sẽ bị mất.
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

        {/* Quick Create Category Dialog */}
        <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Tạo danh mục mới</DialogTitle>
              <DialogDescription>Nhập nhanh tên danh mục bạn muốn bổ sung.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Tên danh mục..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowCategoryDialog(false)}>Hủy</Button>
              <Button onClick={handleCreateCategory} disabled={isCreatingSub || !newCatName}>
                {isCreatingSub ? "Đang tạo..." : "Xác nhận"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

         {/* Quick Create Skill Dialog */}
         <Dialog open={showSkillDialog} onOpenChange={setShowSkillDialog}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Tạo kỹ năng mới</DialogTitle>
              <DialogDescription>Nhập nhanh tên kỹ năng cần bổ sung cho dịch vụ này.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Tên kỹ năng..."
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowSkillDialog(false)}>Hủy</Button>
              <Button onClick={handleCreateSkill} disabled={isCreatingSub || !newSkillName}>
                {isCreatingSub ? "Đang tạo..." : "Xác nhận"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </Sheet>
    </>
  );
}
