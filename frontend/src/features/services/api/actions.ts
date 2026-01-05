"use server"

import { revalidatePath } from "next/cache"

import { fetchApi } from "@/shared/lib/api-client"
import type {
  Service,
  ServiceWithDetails
} from "../model/schemas"

const API_BASE = "/api/v1"

// WHY: Backend trả snake_case, frontend cần camelCase
interface BackendService {
    id: string
    category_id: string | null
    name: string
    duration: number
    buffer_time: number
    price: number
    description: string | null
    image_url: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

interface BackendServiceWithDetails extends BackendService {
    category: { id: string; name: string; description?: string; sort_order: number } | null
    skills: { id: string; name: string; code: string }[]
    resource_requirements: {
        group_id: string
        quantity: number
        start_delay: number
        usage_duration: number | null
    }[]
}

interface BackendServiceListResponse {
    data: BackendService[]
    total: number
    page: number
    limit: number
}

function transformService(data: BackendService): Service {
    return {
        id: data.id,
        categoryId: data.category_id,
        name: data.name,
        duration: data.duration,
        bufferTime: data.buffer_time,
        price: data.price,
        description: data.description,
        imageUrl: data.image_url,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    }
}

function transformServiceWithDetails(data: BackendServiceWithDetails): ServiceWithDetails {
    return {
        ...transformService(data),
        category: data.category
            ? {
                  id: data.category.id,
                  name: data.category.name,
                  description: data.category.description,
                  sortOrder: data.category.sort_order,
              }
            : null,
        skills: data.skills.map((s) => ({
            id: s.id,
            name: s.name,
            code: s.code,
        })),
        resourceRequirements: data.resource_requirements.map((r) => ({
            groupId: r.group_id,
            quantity: r.quantity,
            startDelay: r.start_delay,
            usageDuration: r.usage_duration,
        })),
    }
}

export async function getServices(
    categoryId?: string,
    isActive?: boolean
): Promise<{ data: Service[]; total: number }> {
    const params = new URLSearchParams()
    if (categoryId) params.append("category_id", categoryId)
    if (isActive !== undefined) params.append("is_active", String(isActive))

    const queryString = params.toString()
    const url = queryString ? `${API_BASE}/services?${queryString}` : `${API_BASE}/services`

    const result = await fetchApi<BackendServiceListResponse>(url, { method: "GET" })

    if (!result.success) {
        throw new Error(result.error || "Không thể tải danh sách dịch vụ")
    }

    return {
        data: result.data.data.map(transformService),
        total: result.data.total,
    }
}


export async function getServiceDetail(id: string): Promise<ServiceWithDetails | null> {
    const result = await fetchApi<BackendServiceWithDetails>(`${API_BASE}/services/${id}`, { method: "GET" })

    if (!result.success) {
        if (result.error.includes("404")) return null
        throw new Error(result.error || "Không thể tải thông tin dịch vụ")
    }

    return transformServiceWithDetails(result.data)
}

export async function createService(
    _prevState: unknown,
    formData: FormData
): Promise<{ success: boolean; message: string; data?: ServiceWithDetails }> {
    const payload = {
        name: formData.get("name") as string,
        category_id: formData.get("categoryId") || null,
        duration: Number(formData.get("duration")),
        buffer_time: Number(formData.get("bufferTime")),
        price: Number(formData.get("price")),
        description: formData.get("description") || null,
        image_url: formData.get("imageUrl") || null,
        is_active: formData.get("isActive") === "true",
        skill_ids: JSON.parse(formData.get("skillIds") as string),
        resource_requirements: JSON.parse(formData.get("resourceRequirements") as string).map(
            (r: { groupId: string; quantity: number; startDelay: number; usageDuration: number | null }) => ({
                group_id: r.groupId,
                quantity: r.quantity,
                start_delay: r.startDelay,
                usage_duration: r.usageDuration,
            })
        ),
    }

    const result = await fetchApi<BackendServiceWithDetails>(`${API_BASE}/services`, {
        method: "POST",
        body: JSON.stringify(payload),
    })

    if (!result.success) {
        return {
            success: false,
            message: result.error || "Tạo dịch vụ thất bại",
        }
    }

    revalidatePath("/admin/services")

    return {
        success: true,
        message: "Đã tạo dịch vụ thành công",
        data: transformServiceWithDetails(result.data),
    }
}

export async function updateService(
    id: string,
    _prevState: unknown,
    formData: FormData
): Promise<{ success: boolean; message: string; data?: ServiceWithDetails }> {
    const payload: Record<string, unknown> = {}

    if (formData.has("name")) payload.name = formData.get("name")
    if (formData.has("categoryId")) payload.category_id = formData.get("categoryId") || null
    if (formData.has("duration")) payload.duration = Number(formData.get("duration"))
    if (formData.has("bufferTime")) payload.buffer_time = Number(formData.get("bufferTime"))
    if (formData.has("price")) payload.price = Number(formData.get("price"))
    if (formData.has("description")) payload.description = formData.get("description") || null
    if (formData.has("imageUrl")) payload.image_url = formData.get("imageUrl") || null
    if (formData.has("isActive")) payload.is_active = formData.get("isActive") === "true"
    if (formData.has("skillIds")) payload.skill_ids = JSON.parse(formData.get("skillIds") as string)
    if (formData.has("resourceRequirements")) {
        payload.resource_requirements = JSON.parse(formData.get("resourceRequirements") as string).map(
            (r: { groupId: string; quantity: number; startDelay: number; usageDuration: number | null }) => ({
                group_id: r.groupId,
                quantity: r.quantity,
                start_delay: r.startDelay,
                usage_duration: r.usageDuration,
            })
        )
    }

    const result = await fetchApi<BackendServiceWithDetails>(`${API_BASE}/services/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    })

    if (!result.success) {
        return {
            success: false,
            message: result.error || "Cập nhật dịch vụ thất bại",
        }
    }

    revalidatePath("/admin/services")
    revalidatePath(`/admin/services/${id}`)

    return {
        success: true,
        message: "Đã cập nhật dịch vụ thành công",
        data: transformServiceWithDetails(result.data),
    }
}

export async function toggleServiceStatus(
    id: string
): Promise<{ success: boolean; message: string }> {
    const result = await fetchApi(`${API_BASE}/services/${id}/toggle-status`, {
        method: "PATCH",
    })

    if (!result.success) {
        return { success: false, message: result.error || "Không thể thay đổi trạng thái" }
    }

    revalidatePath("/admin/services")
    return { success: true, message: "Đã thay đổi trạng thái dịch vụ" }
}

export async function deleteService(id: string): Promise<{ success: boolean; message: string }> {
    const result = await fetchApi(`${API_BASE}/services/${id}`, {
        method: "DELETE",
    })

    if (!result.success) {
        return { success: false, message: result.error || "Xóa dịch vụ thất bại" }
    }

    revalidatePath("/admin/services")
    return { success: true, message: "Đã xóa dịch vụ thành công" }
}
