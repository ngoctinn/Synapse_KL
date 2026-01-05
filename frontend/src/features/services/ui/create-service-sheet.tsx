"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useState, useTransition } from "react"
import { useFieldArray, useForm, type SubmitHandler } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/shared/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
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
  SheetTrigger,
} from "@/shared/ui/sheet"
import { Switch } from "@/shared/ui/switch"
import { Textarea } from "@/shared/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group"

import type { Skill } from "@/features/skills/model/schemas"
import { createService } from "../api/actions"
import type { Category } from "../api/category-actions"
import { serviceCreateSchema } from "../model/schemas"

interface CreateServiceSheetProps {
  categories: Category[]
  skills: Skill[]
}

export function CreateServiceSheet({ categories, skills }: CreateServiceSheetProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  type FormValues = z.infer<typeof serviceCreateSchema>

  const form = useForm<FormValues>({
    resolver: zodResolver(serviceCreateSchema),
    defaultValues: {
      name: "",
      categoryId: null,
      duration: 60,
      bufferTime: 10,
      price: 0,
      description: null,
      imageUrl: null,
      isActive: true,
      skillIds: [],
      resourceRequirements: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "resourceRequirements",
  })

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    const formData = new FormData()
    formData.append("name", values.name)
    if (values.categoryId) formData.append("categoryId", values.categoryId)
    formData.append("duration", String(values.duration))
    formData.append("bufferTime", String(values.bufferTime))
    formData.append("price", String(values.price))
    if (values.description) formData.append("description", values.description)
    if (values.imageUrl) formData.append("imageUrl", values.imageUrl)
    formData.append("isActive", String(values.isActive))
    formData.append("skillIds", JSON.stringify(values.skillIds))
    formData.append("resourceRequirements", JSON.stringify(values.resourceRequirements))

    startTransition(async () => {
      const result = await createService(null, formData)
      if (result.success) {
        toast.success(result.message)
        setOpen(false)
        form.reset()
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Thêm dịch vụ
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[500px] sm:w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Thêm dịch vụ mới</SheetTitle>
          <SheetDescription>
            Điền thông tin để tạo dịch vụ mới. Các trường có dấu * là bắt buộc.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
            {/* Thông tin cơ bản */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên dịch vụ *</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Massage Thái 90 phút" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời lượng (phút) *</FormLabel>
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
                name="bufferTime"
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
                    <FormDescription>Thời gian chuẩn bị/vệ sinh</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá (VNĐ) *</FormLabel>
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả chi tiết về dịch vụ..."
                      className="min-h-[80px] resize-none"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Kỹ năng yêu cầu */}
            <FormField
              control={form.control}
              name="skillIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kỹ năng yêu cầu *</FormLabel>
                  <FormDescription>
                    Nhân viên cần có TẤT CẢ các kỹ năng này để thực hiện dịch vụ.
                  </FormDescription>
                  <ToggleGroup
                    type="multiple"
                    variant="outline"
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-wrap gap-2"
                  >
                    {skills.map((skill) => (
                      <ToggleGroupItem
                        key={skill.id}
                        value={skill.id}
                        className="data-[state=on]:border-primary data-[state=on]:bg-primary/5"
                      >
                        {skill.name}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Trạng thái */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Kích hoạt dịch vụ</FormLabel>
                    <FormDescription>
                      Dịch vụ sẽ xuất hiện trong danh sách đặt lịch.
                    </FormDescription>
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

            <SheetFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang tạo..." : "Tạo dịch vụ"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
