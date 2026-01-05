"use server"

import { fetchApi } from "@/shared/lib/api-client"
import { revalidatePath } from "next/cache"
import {
    Category,
    categoryCreateSchema,
    CategoryCreateValues,
    categoryUpdateSchema,
} from "../model/schemas"

export interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export async function getCategories(): Promise<ActionResponse<Category[]>> {
  try {
    const result = await fetchApi<Category[]>("/categories")
    if (!result.success) {
      return { success: false, error: result.error || "Không thể tải danh sách danh mục" }
    }
    const data = result.data
    // Sort by sort_order
    const sortedData = data.sort((a, b) => a.sort_order - b.sort_order)
    return { success: true, data: sortedData }
  } catch (error) {
    console.error("Get categories error:", error)
    return { success: false, error: "Không thể tải danh sách danh mục" }
  }
}

export async function createCategory(values: CategoryCreateValues): Promise<ActionResponse<Category>> {
  try {
    const validated = categoryCreateSchema.parse(values)
    const result = await fetchApi<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(validated),
    })
    if (!result.success) {
      return { success: false, error: result.error || "Lỗi tạo danh mục" }
    }
    revalidatePath("/admin/services")
    return { success: true, data: result.data }
  } catch (error) {
    console.error("Create category error:", error)
    return { success: false, error: "Lỗi tạo danh mục" }
  }
}

export async function updateCategory(id: string, values: Partial<CategoryCreateValues>): Promise<ActionResponse<Category>> {
  try {
    const validated = categoryUpdateSchema.parse(values)
    const result = await fetchApi<Category>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(validated),
    })
    if (!result.success) {
      return { success: false, error: result.error || "Lỗi cập nhật danh mục" }
    }
    revalidatePath("/admin/services")
    return { success: true, data: result.data }
  } catch (error) {
    console.error("Update category error:", error)
    return { success: false, error: "Lỗi cập nhật danh mục" }
  }
}

export async function deleteCategory(id: string): Promise<ActionResponse<void>> {
  try {
    const result = await fetchApi(`/categories/${id}`, {
      method: "DELETE",
    })
    if (!result.success) {
      return { success: false, error: result.error || "Lỗi xóa danh mục (có thể đang chứa dịch vụ)" }
    }
    revalidatePath("/admin/services")
    return { success: true }
  } catch (error) {
    console.error("Delete category error:", error)
    return { success: false, error: "Lỗi xóa danh mục (có thể đang chứa dịch vụ)" }
  }
}

export async function reorderCategories(ids: string[]): Promise<ActionResponse<Category[]>> {
  try {
    const result = await fetchApi<Category[]>("/categories/reorder", {
      method: "PUT",
      body: JSON.stringify({ ids }),
    })
    if (!result.success) {
        return { success: false, error: result.error || "Lỗi sắp xếp danh mục" }
    }
     revalidatePath("/admin/services")
    return { success: true, data: result.data }
  } catch (error) {
    console.error("Reorder categories error:", error)
    return { success: false, error: "Lỗi sắp xếp danh mục" }
  }
}
