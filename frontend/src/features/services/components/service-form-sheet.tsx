"use client";

import { useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
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
import { MultiSelect } from "@/shared/ui/multi-select";
import { serviceCreateSchema, type ServiceCreateForm } from "../schemas";
import { createServiceAction, updateServiceAction } from "../actions";
import type { ResourceGroup, ServiceCategory, Skill, ServiceWithDetails } from "../types";

interface ServiceFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ServiceCategory[];
  skills: Skill[];
  resourceGroups: ResourceGroup[];
  service?: ServiceWithDetails | null;
}

export function ServiceFormSheet({
  open,
  onOpenChange,
  categories,
  skills,
  resourceGroups,
  service,
}: ServiceFormSheetProps) {
  const isEdit = !!service;
  const [isPending, startTransition] = useTransition();

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
      skill_ids: (service?.skills.map((s) => s.id) || []) as string[],
      resource_requirements: (service?.resource_requirements.map(r => ({
        ...r,
        usage_duration: r.usage_duration === null ? undefined : r.usage_duration
      })) || []) as any[],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "resource_requirements",
  });

  // Reset form
  if (open && (form.getValues("name") !== (service?.name || "") || (service && form.getValues("skill_ids")?.length === 0 && service.skills.length > 0))) {
      form.reset({
        category_id: service?.category_id || "",
        name: service?.name || "",
        duration: service?.duration || 60,
        buffer_time: service?.buffer_time || 10,
        price: Number(service?.price) || 0,
        description: service?.description || "",
        skill_ids: (service?.skills.map((s) => s.id) || []) as string[],
        resource_requirements: (service?.resource_requirements.map(r => ({
          ...r,
          usage_duration: r.usage_duration === null ? undefined : r.usage_duration
        })) || []) as any[],
      });
  }

  async function onSubmit(data: ServiceCreateForm) {
    startTransition(async () => {
      try {
        if (isEdit && service) {
          await updateServiceAction(service.id, data);
          toast.success("Cập nhật dịch vụ thành công");
        } else {
          await createServiceAction(data);
          toast.success("Tạo dịch vụ mới thành công");
        }
        onOpenChange(false);
        form.reset();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Đã có lỗi xảy ra");
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}</SheetTitle>
          <SheetDescription>
            Cấu hình thông tin dịch vụ, kỹ năng yêu cầu và tài nguyên cần thiết.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Tên dịch vụ</FormLabel>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn danh mục..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá dịch vụ (VNĐ)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời gian thực hiện (phút)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                    <FormLabel>Thời gian nghỉ (phút)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="skill_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kỹ năng yêu cầu</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={skillOptions}
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder="Chọn các kỹ năng..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Tài nguyên yêu cầu</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => append({ group_id: "", quantity: 1, start_delay: 0 })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm tài nguyên
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start p-3 border rounded-lg bg-muted/20">
                  <FormField
                    control={form.control}
                    name={`resource_requirements.${index}.group_id`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn nhóm..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {resourceGroups.map((group) => (
                              <SelectItem key={group.id} value={group.id}>
                                {group.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`resource_requirements.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem className="w-20">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="SL"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả dịch vụ</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả chi tiết về dịch vụ này..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-background pb-4 border-t mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending} className="min-w-[100px]">
                {isEdit ? "Cập nhật" : "Tạo dịch vụ"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
