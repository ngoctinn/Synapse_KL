"use client"

import { Plus } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import {
  Category,
  CategorySidebar,
} from "@/features/categories"
import { Button } from "@/shared/ui/button"
import { deleteService, getServiceDetail } from "../api/actions"
import { Service, ServiceWithDetails } from "../model/schemas"
import { CreateServiceSheet } from "./create-service-sheet"
import { EditServiceSheet } from "./edit-service-sheet"
import { ServiceList } from "./service-list"
import { ServiceTableToolbar } from "./service-table-toolbar"

import type { ResourceGroup } from "@/features/resources/model/schemas"
import type { Skill } from "@/features/skills/model/schemas"

interface ServiceViewProps {
  categories: Category[]
  services: Service[]
  skills: Skill[]
  resourceGroups: ResourceGroup[]
  total: number
  page: number
  limit: number
}

export function ServiceView({
  categories,
  services,
  skills,
  resourceGroups,
}: ServiceViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedCategoryId = searchParams.get("categoryId")

  // State for Sheets
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceWithDetails | null>(null)

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)

  const handleSelectCategory = (id: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString())
    if (id) {
      params.set("categoryId", id)
    } else {
      params.delete("categoryId")
    }
    params.set("page", "1") // Reset pagination
    router.push(`/admin/services?${params.toString()}`)
  }

  const handleDeleteService = async (id: string) => {
    // In a real app, show confirmation dialog first (similar to ResourcesView)
    if (!confirm("Bạn có chắc muốn xóa dịch vụ này?")) return

    const res = await deleteService(id)
    if (res.success) {
      toast.success("Đã xóa dịch vụ")
    } else {
      toast.error("Lỗi: " + res.message)
    }
  }

  const handleEditClick = async (serviceLite: Service) => {
    // We need to fetch full details including skills and resources
    // Better approach: Use a Server Action to get details.
    try {
      const detail = await getServiceDetail(serviceLite.id)
      if (detail) {
        setEditingService(detail)
      } else {
        toast.error("Không tìm thấy thông tin dịch vụ")
      }
    } catch (error) {
      toast.error("Không thể tải thông tin dịch vụ")
    }
  }

  return (
    <div className="flex h-[calc(100vh-65px)] w-full overflow-hidden border-t">
      {/* Sidebar: Categories */}
      <div className="w-[280px] flex-shrink-0 bg-background border-r">
        <CategorySidebar
          categories={categories}
          selectedId={selectedCategoryId || undefined}
          onSelect={handleSelectCategory}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-muted/5">
        <div className="p-6 border-b bg-background flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {selectedCategory ? selectedCategory.name : "Tất cả dịch vụ"}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {selectedCategory
                  ? selectedCategory.description || "Quản lý dịch vụ trong danh mục này"
                  : "Quản lý toàn bộ danh sách dịch vụ của Spa"}
              </p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm dịch vụ
            </Button>
          </div>

        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="flex flex-col gap-4">
            <ServiceTableToolbar />
            <ServiceList
              services={services}
              onEdit={handleEditClick}
              onDelete={handleDeleteService}
            />
          </div>
        </div>
      </div>

      {/* Sheets */}
      <CreateServiceSheet
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        categories={categories}
        skills={skills}
        resourceGroups={resourceGroups}
      />

      {editingService && (
        <EditServiceSheet
          open={!!editingService}
          onOpenChange={(open) => !open && setEditingService(null)}
          service={editingService}
          categories={categories}
          skills={skills}
          resourceGroups={resourceGroups}
        />
      )}
    </div>
  )
}
