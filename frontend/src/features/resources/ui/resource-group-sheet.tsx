"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { createResourceGroup, updateResourceGroup } from "../api/actions"
import {
  RESOURCE_TYPE_LABELS,
  resourceGroupFormSchema,
  ResourceType,
  type ResourceGroup,
  type ResourceGroupFormValues,
} from "../model/schemas"

import { Button } from "@/shared/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet"
import { Textarea } from "@/shared/ui/textarea"

interface ResourceGroupSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: ResourceGroup | null // Null = Create Mode
}

export function ResourceGroupSheet({
  open,
  onOpenChange,
  initialData,
}: ResourceGroupSheetProps) {
  const [isPending, startTransition] = useTransition()
  const isEditMode = !!initialData

  const form = useForm<ResourceGroupFormValues>({
    resolver: zodResolver(resourceGroupFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || ResourceType.BED,
      description: initialData?.description || "",
    },
  })

  // Reset form when initialData changes
  // WHY: Đảm bảo form có dữ liệu mới nhất khi bấm Edit
  if (open && !form.formState.isDirty && initialData && form.getValues("name") !== initialData.name) {
    form.reset({
      name: initialData.name,
      type: initialData.type,
      description: initialData.description || "",
    })
  }

  // Clear form on close if create mode
  if (!open && !initialData && form.formState.isDirty) {
    form.reset()
  }

  const onSubmit = (data: ResourceGroupFormValues) => {
    startTransition(async () => {
      let result
      if (isEditMode && initialData) {
        result = await updateResourceGroup(initialData.id, data)
      } else {
        result = await createResourceGroup(data)
      }

      if (result.success) {
        toast.success(
          isEditMode ? "Đã cập nhật nhóm tài nguyên" : "Đã tạo nhóm tài nguyên mới"
        )
        onOpenChange(false)
        if (!isEditMode) form.reset()
      } else {
        toast.error(result.error || "Có lỗi xảy ra")
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>
            {isEditMode ? "Chỉnh sửa nhóm" : "Tạo nhóm mới"}
          </SheetTitle>
          <SheetDescription>
            {isEditMode
              ? "Cập nhật thông tin nhóm tài nguyên."
              : "Thêm nhóm tài nguyên mới vào hệ thống."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên nhóm</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Giường Massage" {...field} />
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
                    disabled={isEditMode} // WHY: Không đổi loại khi đã tạo
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(RESOURCE_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả (Tùy chọn)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ghi chú thêm về nhóm này..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang lưu..." : isEditMode ? "Lưu thay đổi" : "Tạo nhóm"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
