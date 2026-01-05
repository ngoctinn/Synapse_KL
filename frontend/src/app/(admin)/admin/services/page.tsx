import { getCategories } from "@/features/categories/api/actions"
import { getResourceGroups } from "@/features/resources/api/actions"
import { getServices } from "@/features/services/api/actions"
import { ServiceView } from "@/features/services/ui/service-view"
import { getSkills } from "@/features/skills/api/actions"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

interface ServicesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const metadata = {
  title: "Quản lý Dịch vụ - Synapse Spa",
}

export default async function ServicesPage(props: ServicesPageProps) {
  const searchParams = await props.searchParams

  const search = typeof searchParams.search === "string" ? searchParams.search : undefined
  const categoryId = typeof searchParams.categoryId === "string" ? searchParams.categoryId : undefined
  const isActiveParam = typeof searchParams.isActive === "string" ? searchParams.isActive : undefined
  const isActive = isActiveParam === "true" ? true : isActiveParam === "false" ? false : undefined

  // Fetch data in parallel
  const [servicesResult, categoriesResult, skillsResult, resourceGroupsResult] = await Promise.all([
    getServices({
      page: 1,
      limit: 100,
      search,
      categoryId,
      isActive
    }),
    getCategories(),
    getSkills(),
    getResourceGroups()
  ])

  if (!servicesResult.success) {
    return <div className="p-4 text-destructive">Lỗi tải danh sách dịch vụ: {servicesResult.error}</div>
  }

  if (!categoriesResult.success) {
    return <div className="p-4 text-destructive">Lỗi tải danh mục: {categoriesResult.error}</div>
  }

  const services = servicesResult.data || []
  const categories = categoriesResult.data || []
  const skills = skillsResult || []
  const resourceGroups = resourceGroupsResult.success ? resourceGroupsResult.data : []

  return (
    <Suspense fallback={<div className="p-4">Đang tải dữ liệu...</div>}>
      <ServiceView
        services={services}
        categories={categories}
        skills={skills}
        resourceGroups={resourceGroups}
        total={servicesResult.total || 0}
        page={1}
        limit={100}
      />
    </Suspense>
  )
}
