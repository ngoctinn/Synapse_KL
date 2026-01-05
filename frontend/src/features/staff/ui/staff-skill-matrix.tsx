"use client"

import { Check, Loader2, Plus, X } from "lucide-react"
import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"

import { createSkill } from "@/features/skills/api/actions"
import { type Skill } from "@/features/skills/model/schemas"
import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"
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
        <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-muted/30 min-h-[100px] items-start content-start">
          {activeSkills.length === 0 && !isPending && (
            <p className="text-sm text-muted-foreground w-full text-center py-6">
              Chưa có kỹ năng nào được gán. Hãy chọn hoặc tạo mới bên dưới.
            </p>
          )}

          {activeSkills.map(skill => (
            <Badge
              key={skill.id}
              variant="secondary"
              className="pl-3 pr-1 py-1.5 gap-1 group hover:bg-destructive/10 hover:text-destructive transition-colors border-primary/20"
            >
              <span className="font-medium text-xs">{skill.name}</span>
              <button
                onClick={() => handleToggleSkill(skill.id)}
                className="p-0.5 rounded-full hover:bg-destructive hover:text-white transition-colors"
                title="Gỡ bỏ"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}


          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-dashed gap-1 bg-background">
                <Plus className="h-4 w-4" />
                <span>Thêm/Tạo mới</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Tìm hoặc nhập kỹ năng mới..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>
                    {searchQuery.trim() !== "" ? (
                      <div className="p-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-primary gap-2 h-9"
                          onClick={handleCreateNewSkill}
                          disabled={isPending}
                        >
                          <Plus className="h-4 w-4" />
                          <span className="truncate">Tạo mới: "{searchQuery}"</span>
                        </Button>
                      </div>
                    ) : (
                      "Không tìm thấy kỹ năng."
                    )}
                  </CommandEmpty>
                  <CommandGroup heading="Kỹ năng hiện có">
                    {filteredSuggestions.map(skill => (
                      <CommandItem
                        key={skill.id}
                        value={skill.name}
                        onSelect={() => {
                          handleToggleSkill(skill.id)
                          setSearchQuery("")
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedSkillIds.includes(skill.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span>{skill.name}</span>
                        <span className="ml-auto text-[10px] text-muted-foreground opacity-50">{skill.code}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
      </CardContent>
    </Card>
  )
}
