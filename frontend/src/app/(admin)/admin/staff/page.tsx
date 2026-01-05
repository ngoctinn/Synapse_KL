import { Suspense } from "react"

import { getSkills } from "@/features/skills/api/actions"
import { getStaffList } from "@/features/staff/api/actions"
import { StaffProfile } from "@/features/staff/model/schemas"
import { InviteStaffSheet, StaffList } from "@/features/staff/ui"
import { Separator } from "@/shared/ui/separator"

export const dynamic = "force-dynamic"

export default async function StaffPage() {
  const [staff, allSkills] = await Promise.all([
    getStaffList() as Promise<StaffProfile[]>,
    getSkills()
  ])

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Nhân viên</h2>
          <p className="text-muted-foreground">
            Quản lý hồ sơ nhân viên, phân quyền và trạng thái hoạt động.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <InviteStaffSheet allSkills={allSkills} />
        </div>
      </div>

      <Separator />

      <div className="flex-1">
        <Suspense fallback={<div>Đang tải danh sách nhân viên...</div>}>
          <StaffList staff={staff} />
        </Suspense>
      </div>
    </div>
  )
}
