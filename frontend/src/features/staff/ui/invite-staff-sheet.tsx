"use client"

import { cn } from "@/shared/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, Plus } from "lucide-react"
import { useMemo, useState, useTransition } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
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

import { UserRole } from "@/shared/model/enums"
import { inviteStaff } from "../api/actions"
import {
  STAFF_ROLE_LABELS,
  staffInviteSchema,
  type StaffInviteValues
} from "../model/schemas"

import { createSkill } from "@/features/skills/api/actions"
import { Skill } from "@/features/skills/model/schemas"
import { Badge } from "@/shared/ui/badge"

interface InviteStaffSheetProps {
  allSkills: Skill[]
}

export function InviteStaffSheet({ allSkills }: InviteStaffSheetProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [skills, setSkills] = useState<Skill[]>(allSkills)
  const [searchQuery, setSearchQuery] = useState("")
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const form = useForm<StaffInviteValues>({
    resolver: zodResolver(staffInviteSchema),
    defaultValues: {
      email: "",
      fullName: "",
      title: "Kỹ thuật viên",
      role: UserRole.TECHNICIAN,
      skillIds: [],
    },
  })

  // WHY: Lấy chi tiết các skill đã chọn để hiển thị Tag
  const selectedSkillIds = form.watch("skillIds") || []
  const activeSkills = useMemo(() =>
    skills.filter(s => selectedSkillIds.includes(s.id)),
    [skills, selectedSkillIds]
  )

  const filteredSuggestions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    return skills.filter(s =>
      !selectedSkillIds.includes(s.id) &&
      (s.name.toLowerCase().includes(query) || s.code.toLowerCase().includes(query))
    )
  }, [skills, selectedSkillIds, searchQuery])

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

      const newSkill = result.data
      setSkills(prev => [...prev, newSkill])
      handleToggleSkill(newSkill.id)
      setSearchQuery("")
      toast.success(`Đã tạo kỹ năng mới: ${newSkill.name}`)
    })
  }


  const onSubmit: SubmitHandler<StaffInviteValues> = (values) => {
    const formData = new FormData()
    formData.append("email", values.email)
    formData.append("fullName", values.fullName)
    formData.append("title", values.title)
    formData.append("role", values.role)
    formData.append("skillIds", JSON.stringify(values.skillIds))

    startTransition(async () => {
      const result = await inviteStaff(null, formData)

      if (result.success) {
        toast.success(result.message)
        setOpen(false)
        form.reset()
      } else {
        toast.error(result.message)
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([key, errors]) => {
            form.setError(key as keyof StaffInviteValues, {
              type: "server",
              message: errors[0]
            })
          })
        }
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Mời nhân viên
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Mời nhân viên mới</SheetTitle>
          <SheetDescription>
            Thiết lập hồ sơ và kỹ năng chuyên môn cho nhân viên ngay từ đầu.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="space-y-6 px-4">
              <div className="space-y-4">
                <FormField<StaffInviteValues, "email">
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="nguyenvan@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField<StaffInviteValues, "fullName">
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ và tên</FormLabel>
                      <FormControl>
                        <Input placeholder="Nguyễn Văn A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField<StaffInviteValues, "role">
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vai trò hệ thống</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn vai trò" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(STAFF_ROLE_LABELS).map(([value, label]) => (
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

                  <FormField<StaffInviteValues, "title">
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chức danh hiển thị</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* WHY: Section gán kỹ năng ngay khi mời */}
                <div className="space-y-3 pt-2">
                  <FormLabel>Kỹ năng chuyên môn</FormLabel>
                  <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-muted/5 min-h-[100px] items-start">
                    {skills.map(skill => {
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
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Thêm kỹ năng mới</DialogTitle>
                          <DialogDescription>
                            Tạo kỹ năng mới nhanh chóng để gán ngay cho nhân viên này.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="new-skill-invite">Tên kỹ năng</Label>
                            <Input
                              id="new-skill-invite"
                              placeholder="VD: Chăm sóc da chuyên sâu"
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
                        <DialogFooter>
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
                </div>
              </div>
            </div>

            <SheetFooter className="px-4">
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Đang xử lý..." : "Mời nhân viên"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
