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
import { useTransition } from "react";
import { useFieldArray, useForm, type DefaultValues } from "react-hook-form";
import { toast } from "sonner";
import { serviceCreateSchema, type ServiceCreateForm, type ServiceCreateFormInput } from "../schemas";
import type { ResourceGroup, ResourceGroupWithCount, ServiceCategory, ServiceWithDetails, Skill } from "../types";

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

  const skillOptions = skills.map((s) => ({ label: s.name, value: s.id }));

  const form = useForm<ServiceCreateFormInput, any, ServiceCreateForm>({
    resolver: zodResolver(serviceCreateSchema),
    defaultValues: {
      category_id: service?.category_id || "",
      name: service?.name || "",
      duration: service?.duration || 60,
      buffer_time: service?.buffer_time || 10,
      price: Number(service?.price) || 0,
      description: service?.description || "",
      is_active: service?.is_active ?? true,
      skill_ids: (service?.skills.map((s) => s.id) || []) as string[],
      resource_requirements: (service?.resource_requirements.map(r => ({
        group_id: r.group_id,
        quantity: r.quantity,
        start_delay: r.start_delay,
        usage_duration: r.usage_duration ?? undefined
      })) || []) as ServiceCreateFormInput['resource_requirements'],
    } as DefaultValues<ServiceCreateFormInput>,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "resource_requirements",
  });

  async function handleFormSubmit(data: ServiceCreateForm) {
    for (const req of data.resource_requirements || []) {
      const group = (resourceGroups as ResourceGroupWithCount[]).find(g => g.id === req.group_id);
      if (group && 'active_count' in group && req.quantity > group.active_count) {
        toast.error(`Nhóm "${group.name}" chỉ có ${group.active_count} tài nguyên khả dụng.`);
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg flex flex-col p-0 gap-0">
        <SheetHeader className="p-6 pb-2 border-b shrunk-0">
          <SheetTitle>{isEdit ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}</SheetTitle>
          <SheetDescription>
            Thiết lập thông tin dịch vụ, giá cả và định mức tài nguyên.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="flex-1 flex flex-col min-h-0"
          >
            <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0">
              <div className="px-6 pt-4 border-b bg-muted/5 shrink-0">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="general">Cơ bản</TabsTrigger>
                  <TabsTrigger value="pricing">Giá & Giờ</TabsTrigger>
                  <TabsTrigger value="technical">Kỹ thuật</TabsTrigger>
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Đơn giá (VNĐ)</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            value={field.value ? new Intl.NumberFormat('vi-VN').format(field.value) : ""}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^0-9]/g, "");
                              field.onChange(Number(raw));
                            }}
                            className="text-right font-mono"
                            placeholder="0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
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
                      <FormLabel>Yêu cầu tài nguyên</FormLabel>
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
                                            {'active_count' in group && (
                                              <span className="text-[10px] text-muted-foreground">({group.active_count})</span>
                                            )}
                                          </div>
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
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isEdit ? "Lưu thay đổi" : "Tạo dịch vụ"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
