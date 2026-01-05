"use client"

import { Check } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { type Skill } from "@/features/skills/model/schemas"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group"
import { updateStaffSkills } from "../api/actions"
import { type StaffProfile } from "../model/schemas"

interface StaffSkillMatrixProps {
  staff: StaffProfile
  allSkills: Skill[]
}

export function StaffSkillMatrix({ staff, allSkills }: StaffSkillMatrixProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(
    staff.skillIds || []
  )

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateStaffSkills(staff.userId, selectedSkillIds)
      if (result.success) {
        toast.success("Đã cập nhật kỹ năng thành công")
      } else {
        toast.error(result.message || "Cập nhật thất bại")
      }
    })
  }

  if (allSkills.length === 0) {
    return (
      <Card className="border-none shadow-none">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-muted-foreground">Chưa có kỹ năng nào được thiết lập trong hệ thống.</p>
          <Button variant="link" onClick={() => window.location.href = "/admin/settings"}>
            Cấu hình kỹ năng ngay
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Ma trận kỹ năng</CardTitle>
        <CardDescription>
          Chọn những kỹ năng mà nhân viên này đã được đào tạo và cấp chứng chỉ.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <ToggleGroup
          type="multiple"
          variant="outline"
          value={selectedSkillIds}
          onValueChange={setSelectedSkillIds}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {allSkills.map((skill) => (
            <ToggleGroupItem
              key={skill.id}
              value={skill.id}
              className="flex h-auto items-center justify-between p-4 text-left data-[state=on]:border-primary data-[state=on]:bg-primary/5"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">{skill.name}</span>
                <span className="text-xs uppercase text-muted-foreground">{skill.code}</span>
              </div>
              <Check
                className={cn(
                  "ml-2 h-4 w-4 transition-opacity",
                  selectedSkillIds.includes(skill.id) ? "opacity-100 text-primary" : "opacity-0"
                )}
              />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
