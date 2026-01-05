"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Edit, Plus, Trash } from "lucide-react"
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

import type { ResourceGroup } from "@/features/resources/model/schemas"
import type { Skill } from "@/features/skills/model/schemas"
import { updateService } from "../api/actions"
import type { Category } from "../api/category-actions"
import { serviceUpdateSchema, type ServiceWithDetails } from "../model/schemas"

// WHY: Solver granularity yêu cầu time slots chuẩn 15p increments để tối ưu scheduling
const DURATION_OPTIONS = [15, 30, 45, 60, 75, 90, 120, 150, 180, 240] as const
const BUFFER_OPTIONS = [0, 5, 10, 15, 20, 30] as const

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} phút`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}p` : `${hours} giờ`
}

interface EditServiceSheetProps {
  service: ServiceWithDetails
  categories: Category[]
  skills: Skill[]
  resourceGroups: ResourceGroup[]
}

export function EditServiceSheet({ service, categories, skills, resourceGroups }: EditServiceSheetProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  type FormValues = z.infer<typeof serviceUpdateSchema>

  const form = useForm<FormValues>({
    resolver: zodResolver(serviceUpdateSchema),
    defaultValues: {
      name: service.name,
      categoryId: service.category?.id ?? null,
      duration: service.duration,
      bufferTime: service.bufferTime,
      price: service.price,
      description: service.description,
      imageUrl: service.imageUrl,
      isActive: service.isActive,
      skillIds: service.skills.map((s) => s.id),
      resourceRequirements: service.resourceRequirements.map((r) => ({
        groupId: r.group.id,
        quantity: r.quantity,
        startDelay: r.startDelay,
        usageDuration: r.usageDuration,
      })),
    },
  })

  // Update form values when service prop changes (re-fetch)
  // Trong trường hợp này service được pass từ Server Component nên sẽ fresh khi page reload
  // Tuy nhiên nếu switch giữa các service khác nhau mà không reload page thì cần useEffect
  // Nhưng ở đây sheet nằm trong page [id], id đổi -> page đổi -> component unmount/remount -> ok.

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "resourceRequirements",
  })

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    const formData = new FormData()
    if (values.name) formData.append("name", values.name)
    if (values.categoryId !== undefined) formData.append("categoryId", values.categoryId ?? "")
    if (values.duration) formData.append("duration", String(values.duration))
    if (values.bufferTime !== undefined) formData.append("bufferTime", String(values.bufferTime))
    if (values.price !== undefined) formData.append("price", String(values.price))
    if (values.description !== undefined) formData.append("description", values.description ?? "")
    if (values.imageUrl !== undefined) formData.append("imageUrl", values.imageUrl ?? "")
    if (values.isActive !== undefined) formData.append("isActive", String(values.isActive))
    if (values.skillIds) formData.append("skillIds", JSON.stringify(values.skillIds))
    if (values.resourceRequirements) formData.append("resourceRequirements", JSON.stringify(values.resourceRequirements))

    startTransition(async () => {
      const result = await updateService(service.id, null, formData)
      if (result.success) {
        toast.success(result.message)
        setOpen(false)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="mr-2 h-4 w-4" />
          Chỉnh sửa
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[500px] sm:w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Chỉnh sửa dịch vụ</SheetTitle>
          <SheetDescription>
            Cập nhật thông tin dịch vụ.
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
                        {DURATION_OPTIONS.map((m) => (
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
                        {BUFFER_OPTIONS.map((m) => (
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

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Hình ảnh</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormDescription>Link đến hình ảnh minh họa cho dịch vụ.</FormDescription>
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

            {/* Tài nguyên yêu cầu - useFieldArray */}
            <div className="space-y-4">
              <FormLabel>Tài nguyên yêu cầu</FormLabel>
              <FormDescription>
                Thiết bị/phòng cần thiết. Mặc định dùng suốt thời gian dịch vụ.
              </FormDescription>

              {fields.map((field, index) => (
                <div key={field.id} className="grid gap-4 border p-4 relative">
                  <div className="grid grid-cols-12 gap-2">
                    <FormField
                      control={form.control}
                      name={`resourceRequirements.${index}.groupId`}
                      render={({ field }) => (
                        <FormItem className="col-span-8">
                          <FormLabel className="text-xs">Nhóm tài nguyên *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn nhóm" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {resourceGroups.map((g) => (
                                <SelectItem key={g.id} value={g.id}>
                                  {g.name} ({g.type})
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
                      name={`resourceRequirements.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="col-span-3">
                          <FormLabel className="text-xs">Số lượng *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="col-span-1 flex items-end justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        onClick={() => remove(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Advanced Timing */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-dashed">
                    <FormField
                      control={form.control}
                      name={`resourceRequirements.${index}.startDelay`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Bắt đầu sau</FormLabel>
                          <Select
                            onValueChange={(v) => field.onChange(Number(v))}
                            value={String(field.value ?? 0)}
                          >
                            <FormControl>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">Ngay lập tức (0p)</SelectItem>
                              {DURATION_OPTIONS.map((m) => (
                                <SelectItem key={m} value={String(m)}>{m} phút</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`resourceRequirements.${index}.usageDuration`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Dùng trong</FormLabel>
                          <Select
                            onValueChange={(v) => field.onChange(v === "null" ? null : Number(v))}
                            value={String(field.value ?? "null")}
                          >
                            <FormControl>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="null">Hết dịch vụ</SelectItem>
                              {DURATION_OPTIONS.map((m) => (
                                <SelectItem key={m} value={String(m)}>{m} phút</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ groupId: "", quantity: 1, startDelay: 0, usageDuration: null })}
              >
                <Plus className="mr-2 h-4 w-4" /> Thêm tài nguyên
              </Button>
            </div>

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

            <SheetFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
