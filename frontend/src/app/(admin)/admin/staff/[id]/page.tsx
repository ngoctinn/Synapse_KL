import { notFound } from "next/navigation"
import { Suspense } from "react"

import { getSkills } from "@/features/skills/api/actions"
import { getStaffDetail } from "@/features/staff/api/actions"
import {
  StaffDetailHeader,
  StaffGeneralForm,
  StaffSkillMatrix
} from "@/features/staff/ui"
import { Separator } from "@/shared/ui/separator"
import { Skeleton } from "@/shared/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  try {
    // Fetch data song song (parallel)
    const [staff, allSkills] = await Promise.all([
      getStaffDetail(id),
      getSkills(),
    ])

    if (!staff) {
      notFound()
    }

    return (
      <div className="flex h-full flex-col space-y-6 p-8">
        <StaffDetailHeader staff={staff} />

        <Separator />

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger
              value="general"
            >
              Thông tin chung
            </TabsTrigger>
            <TabsTrigger
              value="skills"
            >
              Kỹ năng
            </TabsTrigger>
            <TabsTrigger
              value="working-hours"
            >
              Lịch làm việc
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
              <StaffGeneralForm staff={staff} />
            </Suspense>
          </TabsContent>

          <TabsContent value="skills">
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
              <StaffSkillMatrix staff={staff} allSkills={allSkills} />
            </Suspense>
          </TabsContent>

          <TabsContent value="working-hours">
            <div className="flex flex-col items-center justify-center py-20 border border-dashed text-center">
              <p className="text-muted-foreground font-medium">Tính năng đang phát triển</p>
              <p className="text-xs text-muted-foreground mt-1">Cấu hình khung giờ làm việc cá nhân cho nhân viên.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  } catch (error) {
    console.error("Error loading staff detail:", error)
    notFound()
  }
}
