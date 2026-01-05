"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Check, Plus } from "lucide-react"
import { useState, useTransition } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { createSkill } from "@/features/skills/api/actions"
import { formatDuration } from "@/shared/lib/format"
import { cn } from "@/shared/lib/utils"

import type { Category } from "@/features/categories/model/schemas"
import type { ResourceGroup } from "@/features/resources/model/schemas"
import type { Skill } from "@/features/skills/model/schemas"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form"
import { ImageUpload } from "@/shared/ui/image-upload"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
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
  SheetTitle
} from "@/shared/ui/sheet"
import { Switch } from "@/shared/ui/switch"
import { Textarea } from "@/shared/ui/textarea"

import { createService } from "../api/actions"
import { SERVICE_BUFFER_OPTIONS, SERVICE_DURATION_OPTIONS } from "../config/constants"
import { serviceCreateSchema } from "../model/schemas"
import { ResourceRequirementsList } from "./resource-requirements-list"

interface CreateServiceSheetProps {
  categories: Category[]
  skills: Skill[]
  resourceGroups: ResourceGroup[]
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateServiceSheet({
  categories,
  skills,
  resourceGroups,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: CreateServiceSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [skillsState, setSkillsState] = useState<Skill[]>(skills)
  const [searchQuery, setSearchQuery] = useState("")
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const open = controlledOpen ?? internalOpen
  const setOpen = setControlledOpen ?? setInternalOpen

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

  // WHY: Lấy danh sách ID đã chọn để toggle
  const selectedSkillIds = form.watch("skillIds") || []

  const handleToggleSkill = (skillId: string) => {
    const current = form.getValues("skillIds") || []
    if (current.includes(skillId)) {
      form.setValue("skillIds", current.filter(id => id !== skillId))
    } else {
      form.setValue("skillIds", [...current, skillId])
    }
  }

  const handleCreateNewSkill = async () => {
    const name = searchQuery.trim()
    if (!name) return

    startTransition(async () => {
      const result = await createSkill({ name })
      if (!result.success) {
        toast.error(result.error || "Không thể tạo kỹ năng")
        return
      }

      const newSkill = result.data as Skill
      setSkillsState(prev => [...prev, newSkill])
      handleToggleSkill(newSkill.id)
      setSearchQuery("")
      setIsPopoverOpen(false)
      toast.success(`Đã tạo kỹ năng mới: ${newSkill.name} `)
    })
  }



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
      <SheetContent className="p-0 w-[500px] sm:w-[600px] overflow-y-auto">

        <SheetHeader className="p-4 pb-0">
          <SheetTitle>Thêm dịch vụ mới</SheetTitle>
          <SheetDescription>
            Điền thông tin để tạo dịch vụ mới. Các trường có dấu * là bắt buộc.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="space-y-6 px-4">
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

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thời lượng *</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(Number(v))}
                        value={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SERVICE_DURATION_OPTIONS.map((m) => (
                            <SelectItem key={m} value={String(m)}>
                              {formatDuration(m)}
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
                  name="bufferTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thời gian nghỉ</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(Number(v))}
                        value={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SERVICE_BUFFER_OPTIONS.map((m) => (
                            <SelectItem key={m} value={String(m)}>
                              {m === 0 ? "Không cần" : `${m} phút`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Vệ sinh/chuẩn bị (khuyến nghị: 10-15p)</FormDescription>
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
                      <div className="relative">
                        <Input
                          type="number"
                          min={0}
                          step={1000}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="pr-12"
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground text-sm">
                          VNĐ
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Hiển thị: {field.value ? new Intl.NumberFormat("vi-VN").format(Number(field.value)) : "0"} VNĐ
                    </FormDescription>
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

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hình ảnh</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        bucketName="service-images"
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
                render={() => (
                  <FormItem>
                    <FormLabel>Kỹ năng yêu cầu *</FormLabel>
                    <FormDescription>
                      Nhân viên cần có TẤT CẢ các kỹ năng này để thực hiện dịch vụ.
                    </FormDescription>
                    <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-muted/5 min-h-[100px] items-start mt-2">
                      {skillsState.map(skill => {
                        const isSelected = selectedSkillIds.includes(skill.id)
                        return (
                          <Badge
                            key={skill.id}
                            variant={isSelected ? "default" : "outline"}
                            className={cn(
                              "cursor-pointer px-3 py-1.5 transition-all hover:scale-105 active:scale-95 select-none",
                              isSelected ? "shadow-sm" : "text-muted-foreground hover:bg-background"
                            )}
                            onClick={() => handleToggleSkill(skill.id)}
                          >
                            {skill.name}
                            {isSelected && <Check className="ml-1.5 h-3 w-3" />}
                          </Badge>
                        )
                      })}

                      <Dialog open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline" size="sm" className="h-8 border-dashed gap-1 px-3">
                            <Plus className="h-4 w-4" />
                            <span>Kỹ năng mới</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="p-0 sm:max-w-[425px]">
                          <DialogHeader className="p-4 pb-0">
                            <DialogTitle>Thêm kỹ năng mới</DialogTitle>
                            <DialogDescription>
                              Tạo kỹ năng mới nhanh chóng để gán ngay cho dịch vụ này.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4 px-4">
                            <div className="grid gap-2">
                              <Label htmlFor="new-skill-service">Tên kỹ năng</Label>
                              <Input
                                id="new-skill-service"
                                placeholder="VD: Massage Thụy Điển chuyên sâu"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault()
                                    handleCreateNewSkill()
                                  }
                                }}
                              />
                            </div>
                          </div>
                          <DialogFooter className="p-4 pt-0">
                            <Button
                              type="button"
                              onClick={handleCreateNewSkill}
                              disabled={isPending || !searchQuery.trim()}
                            >
                              {isPending ? "Đang tạo..." : "Xác nhận tạo"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tài nguyên yêu cầu - Refactored */}
              <ResourceRequirementsList
                control={form.control}
                resourceGroups={resourceGroups}
              />

              {/* Trạng thái */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between border p-4">
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

            </div>
            <SheetFooter className="p-4 pt-0">
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Đang tạo..." : "Tạo dịch vụ"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

