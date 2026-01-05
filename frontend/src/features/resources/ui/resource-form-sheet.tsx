"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { createResource, updateResource } from "../api/actions"
import {
  RESOURCE_STATUS_LABELS,
  resourceFormSchema,
  ResourceStatus,
  type ResourceFormValues,
  type ResourceGroup,
  type ResourceItem,
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

interface ResourceFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: ResourceItem | null
  groups: ResourceGroup[]
  preselectedGroupId?: string
}

export function ResourceFormSheet({
  open,
  onOpenChange,
  initialData,
  groups,
  preselectedGroupId,
}: ResourceFormSheetProps) {
  const [isPending, startTransition] = useTransition()
  const isEditMode = !!initialData

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      name: "",
      code: "",
      status: ResourceStatus.ACTIVE,
      description: "",
      group_id: preselectedGroupId || "",
    },
  })

  // WHY: Update form when opening edit mode
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          name: initialData.name,
          code: initialData.code || "",
          status: initialData.status,
          description: initialData.description || "",
          group_id: initialData.group_id || "",
        })
      } else {
        form.reset({
          name: "",
          code: "",
          status: ResourceStatus.ACTIVE,
          description: "",
          group_id: preselectedGroupId || "",
        })
      }
    }
  }, [open, initialData, preselectedGroupId, form])

  const onSubmit = (data: ResourceFormValues) => {
    startTransition(async () => {
      let result
      if (isEditMode && initialData) {
        result = await updateResource(initialData.id, data)
      } else {
        result = await createResource(data)
      }

      if (result.success) {
        toast.success(
          isEditMode ? "Đã cập nhật thiết bị" : "Đã thêm thiết bị mới"
        )
        onOpenChange(false)
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
            {isEditMode ? "Chỉnh sửa thiết bị" : "Thêm thiết bị mới"}
          </SheetTitle>
          <SheetDescription>
            {isEditMode
              ? "Cập nhật thông tin chi tiết của thiết bị."
              : "Thêm một thiết bị vật lý mới vào nhóm."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
            <FormField
              control={form.control}
              name="group_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thuộc nhóm</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn nhóm tài nguyên" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên thiết bị</FormLabel>
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
                    <FormLabel>Mã (Code)</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: BED-01" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(RESOURCE_STATUS_LABELS).map(([value, label]) => (
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
                      placeholder="Ghi chú về tình trạng, vị trí..."
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang lưu..." : isEditMode ? "Lưu thay đổi" : "Thêm thiết bị"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
