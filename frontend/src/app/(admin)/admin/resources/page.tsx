import { getResourceGroups, getResources } from "@/features/resources/api/actions"
import { ResourcesView } from "@/features/resources/ui/resources-view"
import { Suspense } from "react"

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const metadata = {
  title: "Quản lý Tài nguyên - Synapse Spa",
}

export default async function ResourcesPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const groupId = typeof resolvedParams.groupId === "string" ? resolvedParams.groupId : undefined

  // Parallel data fetching
  const [groupsResult, resourcesResult] = await Promise.all([
    getResourceGroups(),
    groupId ? getResources(groupId) : Promise.resolve({ success: true, data: [] }),
  ])

  if (!groupsResult.success) {
    return <div className="p-8 text-destructive">Lỗi tải danh sách nhóm: {groupsResult.error}</div>
  }

  const groups = groupsResult.data
  const resources = resourcesResult.success ? (resourcesResult.data || []) : []

  console.log("ResourcesPage Debug:", { groupId, resourcesCount: resources.length, success: resourcesResult.success })
  if (resources.length > 0) {
    console.log("Sample resource:", resources[0])
  }

  return (
    <Suspense fallback={<div className="p-8">Đang tải dữ liệu...</div>}>
      <ResourcesView groups={groups} resources={resources} />
    </Suspense>
  )
}
