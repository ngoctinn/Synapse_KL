"use client"

import { Check, Loader2, Plus } from "lucide-react"
import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"

import { createSkill } from "@/features/skills/api/actions"
import { type Skill } from "@/features/skills/model/schemas"
import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
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
import { updateStaffSkills } from "../api/actions"
import { type StaffProfile } from "../model/schemas"

interface StaffSkillMatrixProps {
  staff: StaffProfile
  allSkills: Skill[]
}

export function StaffSkillMatrix({ staff, allSkills }: StaffSkillMatrixProps) {
  const [isPending, startTransition] = useTransition()
  const [skills, setSkills] = useState<Skill[]>(allSkills)
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(
    staff.skillIds || []
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  // WHY: Lấy chi tiết các skill đã chọn để hiển thị Tag
  const activeSkills = useMemo(() =>
    skills.filter(s => selectedSkillIds.includes(s.id)),
    [skills, selectedSkillIds]
  )

  // WHY: Lọc danh sách gợi ý (loại bỏ những cái đã chọn)
  const filteredSuggestions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    return skills.filter(s =>
      !selectedSkillIds.includes(s.id) &&
      (s.name.toLowerCase().includes(query) || s.code.toLowerCase().includes(query))
    )
  }, [skills, selectedSkillIds, searchQuery])

  const handleToggleSkill = (skillId: string) => {
    setSelectedSkillIds(prev =>
      prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    )
  }

  const handleCreateNewSkill = async () => {
    const name = searchQuery.trim()
    if (!name) return

    startTransition(async () => {
      const result = await createSkill({ name })
      if (result.success) {
        const newSkill = result.data
        setSkills(prev => [...prev, newSkill])
        setSelectedSkillIds(prev => [...prev, newSkill.id])
        setSearchQuery("")
        toast.success(`Đã tạo và gán kỹ năng: ${newSkill.name}`)
      } else {
        toast.error(result.error || "Không thể tạo kỹ năng")
      }
    })
  }

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateStaffSkills(staff.userId, selectedSkillIds)
      if (result.success) {
        toast.success("Đã cập nhật hồ sơ kỹ năng")
      } else {
        toast.error(result.message || "Cập nhật thất bại")
      }
    })
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Năng lực chuyên môn</CardTitle>
            <CardDescription>
              Quản lý các kỹ năng và chứng chỉ hành nghề của nhân viên.
            </CardDescription>
          </div>
          <Button onClick={handleSave} disabled={isPending} size="sm">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu thay đổi
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0 space-y-4">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 min-h-[100px] items-start">
            {skills.map(skill => {
              const isSelected = selectedSkillIds.includes(skill.id)
              return (
                <Badge
                  key={skill.id}
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-3 py-1.5 transition-all hover:scale-105 active:scale-95 select-none",
                    isSelected ? "shadow-sm" : "text-muted-foreground hover:bg-accent"
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
                <Button variant="outline" size="sm" className="h-8 border-dashed gap-1 px-3">
                  <Plus className="h-4 w-4" />
                  <span>Kỹ năng mới</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Thêm kỹ năng mới</DialogTitle>
                  <DialogDescription>
                    Tạo một kỹ năng mới để gán cho nhân viên này và những người khác.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Tên kỹ năng</Label>
                    <Input
                      id="name"
                      placeholder="VD: Massage Thụy Điển"
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

          <div className="rounded-md bg-blue-50 p-4 border border-blue-100">
            <div className="flex gap-3">
              <div className="p-1 h-fit rounded-full bg-blue-100 text-blue-600">
                <Check className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">Tính năng thông minh</p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Hệ thống tự động sử dụng danh sách Kỹ năng này để tối ưu hóa việc sắp xếp lịch hẹn thông qua bộ giải thuật Synapse RCPSP.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
