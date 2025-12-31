"use client";

import { DurationSelect } from "@/shared/components/duration-select";
import { Button } from "@/shared/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { MultiSelect } from "@/shared/ui/multi-select";
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
import { Switch } from "@/shared/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Textarea } from "@/shared/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { serviceCreateSchema, type ServiceCreateForm } from "../schemas";
import type { ResourceGroup, ResourceGroupWithCount, ServiceCategory, ServiceWithDetails, Skill } from "../types";
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
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const skillOptions = skills.map((s) => ({ label: s.name, value: s.id }));

  const form = useForm({
    resolver: zodResolver(serviceCreateSchema),
    defaultValues: {
      category_id: service?.category_id || "",
      name: service?.name || "",
      duration: service?.duration || 60,
      buffer_time: service?.buffer_time || 10,
      price: Number(service?.price) || 0,
      description: service?.description || "",
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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "resource_requirements",
  });

  const errors = form.formState.errors;
  const tabErrors = {
    general: !!(errors.name || errors.category_id || errors.description),
    pricing: !!(errors.price || errors.duration || errors.buffer_time),
    technical: !!(errors.skill_ids || errors.resource_requirements),
  };

  const onInvalid = () => {
    if (tabErrors.general) setActiveTab("general");
    else if (tabErrors.pricing) setActiveTab("pricing");
    else if (tabErrors.technical) setActiveTab("technical");
  };

  async function handleFormSubmit(data: ServiceCreateForm) {
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
        onOpenChange(false);
        form.reset();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Đã có lỗi xảy ra");
      }
    });
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && form.formState.isDirty) {
      setShowExitConfirm(true);
      return;
    }
    onOpenChange(open);
  };

  useEffect(() => {
    if (open) {
      form.reset({
        category_id: service?.category_id || "",
        name: service?.name || "",
        duration: service?.duration || 60,
        buffer_time: service?.buffer_time || 10,
        price: Number(service?.price) || 0,
        description: service?.description || "",
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

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent 
          className="sm:max-w-lg flex flex-col p-0 gap-0"
          onPointerDownOutside={(e) => {
            if (form.formState.isDirty) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (form.formState.isDirty) e.preventDefault();
          }}
        >
          <SheetHeader className="p-6 pb-2 border-b shrink-0">
            <SheetTitle>{isEdit ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}</SheetTitle>
            <SheetDescription>
              Thiết lập thông tin dịch vụ, giá cả và định mức tài nguyên.
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit, onInvalid)}
              className="flex-1 flex flex-col min-h-0"
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                <div className="px-6 pt-4 border-b bg-muted/5 shrink-0">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="general" className="relative">
                      Cơ bản
                      {tabErrors.general && <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />}
                    </TabsTrigger>
                    <TabsTrigger value="pricing" className="relative">
                      Giá & Giờ
                      {tabErrors.pricing && <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />}
                    </TabsTrigger>
                    <TabsTrigger value="technical" className="relative">
                      Kỹ thuật
                      {tabErrors.technical && <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />}
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
                  <TabsContent value="general" className="mt-0 space-y-4">
                    <div className="flex items-center justify-between">
                      <FormField
                        control={form.control}
                        name="is_active"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormLabel>Trạng thái hoạt động</FormLabel>
                            <FormControl>
                              <Switch
                                checked={!!field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel required>Tên dịch vụ</FormLabel>
                            <FormControl>
                              <Input placeholder="VD: Massage Thụy Điển 90p" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Danh mục</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn danh mục..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
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
                            <FormLabel>Mô tả chi tiết</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Mô tả về liệu trình, tác dụng và lưu ý..."
                                className="min-h-[150px] resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="pricing" className="mt-0 space-y-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => {
                        const currentVal = field.value || 0;
                        
                        // Smart Suggestions: Lọc mốc giá phổ biến dựa trên những gì đang gõ
                        const commonSpaPrices = [
                          100000, 150000, 200000, 250000, 300000, 350000, 400000, 450000, 
                          500000, 550000, 600000, 750000, 800000, 900000, 1000000, 1200000, 
                          1500000, 2000000, 2500000, 3000000, 5000000
                        ];
                        
                        const suggestions = currentVal > 0 && currentVal < 10000 
                          ? commonSpaPrices.filter(p => p.toString().startsWith(currentVal.toString())).slice(0, 4)
                          : [];

                        return (
                          <FormItem>
                            <FormLabel required>Đơn giá</FormLabel>
                            <FormControl>
                              <div className="space-y-2.5">
                                <div className="relative">
                                  <Input
                                    type="text"
                                    value={field.value ? new Intl.NumberFormat("vi-VN").format(field.value) : ""}
                                    onChange={(e) => {
                                      let raw = e.target.value.toLowerCase().replace(/[^0-9km.]/g, "");
                                      
                                      // Logic Shorthand: 500k -> 500.000, 1.2m -> 1.200.000, 500. -> 500.000
                                      if (raw.endsWith("k") || (raw.endsWith(".") && !raw.includes("m"))) {
                                        const num = parseFloat(raw.slice(0, -1)) || 0;
                                        field.onChange(num * 1000);
                                      } else if (raw.endsWith("m")) {
                                        const num = parseFloat(raw.slice(0, -1)) || 0;
                                        field.onChange(num * 1000000);
                                      } else {
                                        field.onChange(Number(raw.replace(/[^0-9]/g, "")));
                                      }
                                    }}
                                    className="text-right font-mono pr-12 h-11 text-base bg-muted/5 focus:bg-background transition-colors"
                                    placeholder="0"
                                  />
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none font-medium opacity-70">
                                    VNĐ
                                  </div>
                                </div>
                                
                                {/* Smart Suggestions - Outline Style */}
                                {suggestions.length > 0 ? (
                                  <div className="flex flex-wrap gap-2 pt-1 animate-in fade-in slide-in-from-top-1">
                                    {suggestions.map((p) => (
                                      <Button
                                        key={p}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="font-medium text-primary border-primary/20 hover:bg-primary/5 h-8"
                                        onClick={() => field.onChange(p)}
                                      >
                                        {new Intl.NumberFormat('vi-VN').format(p)} ₫
                                      </Button>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {[100000, 200000, 500000, 1000000].map((p) => (
                                      <Button
                                        key={p}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="font-medium text-muted-foreground hover:text-primary h-8"
                                        onClick={() => field.onChange(p)}
                                      >
                                        {new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(p)}
                                      </Button>
                                    ))}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50 font-normal"
                                      onClick={() => field.onChange(0)}
                                    >
                                      Xóa trắng
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel required>Thực hiện</FormLabel>
                            <FormControl>
                              <DurationSelect
                                value={field.value}
                                onValueChange={field.onChange}
                                step={15}
                                max={240}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="buffer_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nghỉ / Dọn</FormLabel>
                            <FormControl>
                              <DurationSelect
                                value={field.value || 0}
                                onValueChange={field.onChange}
                                step={5}
                                max={60}
                                placeholder="Không nghỉ"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="technical" className="mt-0 space-y-4">
                    <FormField
                      control={form.control}
                      name="skill_ids"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kỹ năng bắt buộc</FormLabel>
                          <FormControl>
                            <MultiSelect
                              options={skillOptions}
                              onChange={field.onChange}
                              selected={field.value || []}
                              placeholder="Chọn kỹ năng..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Yêu cầu tài nguyên</FormLabel>
                          <p className="text-[10px] text-muted-foreground italic">Xem timeline sử dụng bên dưới</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => append({ group_id: "", quantity: 1, start_delay: 0 })}
                          className="h-8 text-primary hover:text-primary hover:bg-primary/10 -mr-2"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" /> Thêm tài nguyên
                        </Button>
                      </div>

                      <div className="border rounded-md p-3 bg-muted/10 space-y-2">
                                              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                                                <span>0p</span>
                                                <span>{form.watch("duration")}p</span>
                                              </div>
                                              <div className="relative h-6 bg-muted/30 rounded overflow-hidden flex items-center">
                                                <div className="absolute inset-0 bg-primary/5 border-x border-primary/20" />
                                                {fields.map((item, index) => {
                                                  const req = form.watch(`resource_requirements.${index}`);
                                                  const duration = form.watch("duration") || 60;
                                                  const start = req?.start_delay || 0;
                                                  const usage = req?.usage_duration || (duration - start);                            
                            if (!req?.group_id) return null;

                            const left = (start / duration) * 100;
                            const width = (usage / duration) * 100;

                            return (
                              <div 
                                key={item.id}
                                className="absolute h-3 bg-primary/40 rounded-sm border border-primary/60 transition-all shadow-sm"
                                style={{ 
                                  left: `${Math.max(0, Math.min(100, left))}%`, 
                                  width: `${Math.max(1, Math.min(100 - left, width))}%`,
                                  top: `${4 + (index % 3) * 4}px`
                                }}
                                title={`Tài nguyên ${index + 1}`}
                              />
                            );
                          })}
                        </div>
                        <p className="text-[9px] text-center text-muted-foreground">Biểu đồ thời điểm chiếm dụng tài nguyên</p>
                      </div>

                      <div className="space-y-3">
                        {fields.map((item, index) => (
                          <div key={item.id} className="p-3 rounded-lg border bg-background space-y-3 relative group">
                            <div className="flex items-center justify-between gap-2">
                              <FormField
                                control={form.control}
                                name={`resource_requirements.${index}.group_id`}
                                render={({ field }) => (
                                  <FormItem className="flex-1 space-y-0 mb-0">
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="h-9">
                                          <SelectValue placeholder="Chọn nhóm..." />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {resourceGroups.map((group) => (
                                          <SelectItem key={group.id} value={group.id}>
                                            <div className="flex items-center gap-2">
                                                                                          <span>{group.name}</span>
                                                                                          {"active_count" in group && (
                                                                                            <span className="text-[10px] text-muted-foreground">({group.active_count})</span>
                                                                                          )}                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                onClick={() => remove(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <FormField
                                control={form.control}
                                name={`resource_requirements.${index}.quantity`}
                                render={({ field }) => (
                                  <FormItem className="space-y-1 mb-0">
                                    <div className="flex items-center justify-between">
                                      <FormLabel className="text-xs text-muted-foreground font-normal">Số lượng</FormLabel>
                                    </div>
                                    <FormControl>
                                      <Input type="number" min={1} className="h-8" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`resource_requirements.${index}.start_delay`}
                                render={({ field }) => (
                                  <FormItem className="space-y-1 mb-0">
                                    <div className="flex items-center justify-between">
                                      <FormLabel className="text-xs text-muted-foreground font-normal">Bắt đầu sau</FormLabel>
                                    </div>
                                    <FormControl>
                                      <DurationSelect
                                        value={field.value || 0}
                                        onValueChange={field.onChange}
                                        step={5}
                                        max={120}
                                        placeholder="Ngay lập tức"
                                        className="h-8 min-h-0"
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        ))}

                        {fields.length === 0 && (
                          <div className="py-8 text-center border border-dashed rounded-lg text-sm text-muted-foreground bg-muted/5">
                            Chưa có yêu cầu tài nguyên nào.
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>

              <div className="p-6 border-t bg-background shrink-0 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleOpenChange(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isPending} className="min-w-[120px]">
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
                onClick={() => {
                  setShowExitConfirm(false);
                  onOpenChange(false);
                  form.reset();
                }}
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