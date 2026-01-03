"use client";

import { Button } from "@/shared/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { ImageUpload } from "@/shared/ui/image-upload";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";
import { Plus } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { type ServiceCreateForm } from "../../schemas";
import type { ServiceCategory } from "../../types";

interface ServiceGeneralTabProps {
  categories: ServiceCategory[];
  onAddCategory: () => void;
}

export function ServiceGeneralTab({ categories, onAddCategory }: ServiceGeneralTabProps) {
  const form = useFormContext<ServiceCreateForm>();

  return (
    <div className="space-y-4 pt-1">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>Tên dịch vụ</FormLabel>
            <FormControl>
              <Input placeholder="VD: Massage Body Đá nóng" {...field} />
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
            <div className="flex gap-2">
              <div className="flex-1 min-w-0">
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn danh mục..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="uncategorized">
                      <span className="text-muted-foreground">Chưa phân loại</span>
                    </SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="shrink-0"
                onClick={onAddCategory}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="image_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hình ảnh dịch vụ</FormLabel>
            <FormControl>
              <ImageUpload
                value={field.value}
                onChange={(url: string | null) => field.onChange(url || "")}
                bucket="service-images"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="is_active"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Trạng thái hoạt động</FormLabel>
              <div className="text-sm text-muted-foreground">
                Dịch vụ này có đang được kinh doanh không?
              </div>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
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
                placeholder="Mô tả về quy trình, công dụng..."
                className="resize-none min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
