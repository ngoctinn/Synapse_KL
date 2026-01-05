"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
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
import { Switch } from "@/shared/ui/switch"
import { Textarea } from "@/shared/ui/textarea"
import { updateStaffProfile } from "../api/actions"
import { staffUpdateSchema, type StaffProfile } from "../model/schemas"

interface StaffGeneralFormProps {
  staff: StaffProfile
}

export function StaffGeneralForm({ staff }: StaffGeneralFormProps) {
  const [isPending, startTransition] = useTransition()

  type FormValues = z.infer<typeof staffUpdateSchema>

  const form = useForm<FormValues>({
    resolver: zodResolver(staffUpdateSchema),
    defaultValues: {
      fullName: staff.fullName,
      title: staff.title,
      bio: staff.bio ?? "",
      colorCode: staff.colorCode,
      avatarUrl: staff.avatarUrl,
      isActive: staff.isActive,
    },
  })

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    const formData = new FormData()
    formData.append("fullName", values.fullName)
    formData.append("title", values.title)
    formData.append("bio", values.bio ?? "")
    formData.append("colorCode", values.colorCode)
    if (values.avatarUrl) formData.append("avatarUrl", values.avatarUrl)
    formData.append("isActive", values.isActive ? "true" : "false")

    startTransition(async () => {
      const result = await updateStaffProfile(staff.userId, null, formData)
      if (result.success) {
        toast.success("Đã cập nhật thông tin thành công")
      } else {
        toast.error(result.message || "Cập nhật thất bại")
      }
    })
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Thông tin cơ bản</CardTitle>
        <CardDescription>
          Cập nhật hồ sơ cá nhân và thông tin hiển thị của nhân viên.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ và tên</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chức danh</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ảnh đại diện</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      bucketName="staff-avatars"
                      folder="avatars"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiểu sử / Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Thông tin giới thiệu ngắn về trình độ hoặc kinh nghiệm..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="colorCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã màu hiển thị</FormLabel>
                    <div className="flex items-center gap-3">
                      <FormControl>
                        <Input {...field} className="font-mono" />
                      </FormControl>
                      <div
                        className="h-10 w-10 shrink-0 border border-border mt-0"
                        style={{ backgroundColor: field.value }}
                      />
                    </div>
                    <FormDescription>Màu sắc nhận diện nhân viên trên lịch hẹn.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Trạng thái hoạt động</FormLabel>
                      <FormDescription>
                        Cho phép nhân viên này xuất hiện trên lịch đặt chỗ.
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

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
