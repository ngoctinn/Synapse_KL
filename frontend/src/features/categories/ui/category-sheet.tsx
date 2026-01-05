"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet"
import { Textarea } from "@/shared/ui/textarea"

import { createCategory, updateCategory } from "../api/actions"
import { Category, CategoryCreateValues, categoryCreateSchema } from "../model/schemas"

interface CategorySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Category | null
}

export function CategorySheet({ open, onOpenChange, initialData }: CategorySheetProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<CategoryCreateValues>({
    resolver: zodResolver(categoryCreateSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
    values: initialData
      ? {
        name: initialData.name,
        description: initialData.description || "",
      }
      : undefined,
  })

  const onSubmit = (values: CategoryCreateValues) => {
    startTransition(async () => {
      let result
      if (initialData) {
        result = await updateCategory(initialData.id, values)
      } else {
        result = await createCategory(values)
      }

      if (result.success) {
        toast.success(initialData ? "Đã cập nhật danh mục" : "Đã tạo danh mục mới")
        onOpenChange(false)
        if (!initialData) form.reset()
      } else {
        toast.error(result.error || "Có lỗi xảy ra")
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{initialData ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</SheetTitle>
          <SheetDescription>
            {initialData
              ? "Cập nhật thông tin danh mục dịch vụ."
              : "Tạo danh mục mới để phân loại dịch vụ."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên danh mục</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Chăm sóc da" {...field} />
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
                  <FormLabel>Mô tả (Tùy chọn)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Mô tả ngắn về danh mục..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "Lưu thay đổi" : "Tạo danh mục"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
