import { Suspense } from "react"

import { getResourceGroups } from "@/features/resources/api/actions"
import { getServices } from "@/features/services/api/actions"
import { getCategories } from "@/features/services/api/category-actions"
import { CreateServiceSheet, ServiceList } from "@/features/services/ui"
import { getSkills } from "@/features/skills/api/actions"
import { Separator } from "@/shared/ui/separator"

export default async function ServicesPage() {
  const [servicesResult, categories, skills, resourceGroupsResult] = await Promise.all([
    getServices(),
    getCategories(),
    getSkills(),
    getResourceGroups(),
  ])

  const resourceGroups = resourceGroupsResult.success ? resourceGroupsResult.data : []

  return (
    <div className="flex h-full flex-col space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Dịch vụ</h2>
          <p className="text-muted-foreground">
            Quản lý danh sách dịch vụ, giá cả và các yêu cầu kỹ năng.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <CreateServiceSheet
            categories={categories}
            skills={skills}
            resourceGroups={resourceGroups}
          />
        </div>
      </div>

      <Separator />

      <div className="flex-1">
        <Suspense fallback={<div>Đang tải danh sách dịch vụ...</div>}>
          <ServiceList services={servicesResult.data} />
        </Suspense>
      </div>
    </div>
  )
}
