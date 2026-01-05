"use server"

import { fetchApi } from "@/shared/lib/api-client"
import { revalidatePath } from "next/cache"
import {
  staffInviteSchema,
  type StaffProfile
} from "../model/schemas"

interface ActionState {
    success: boolean
    message?: string
    fieldErrors?: Record<string, string[]>
}

const BASE_URL = "/api/v1/staff"

export async function inviteStaff(
    prevState: ActionState | null,
    formData: FormData
): Promise<ActionState> {
    const rawData = {
        email: formData.get("email"),
        fullName: formData.get("fullName"),
        title: formData.get("title"),
        role: formData.get("role"),
    }

    const validated = staffInviteSchema.safeParse(rawData)

    if (!validated.success) {
        return {
            success: false,
            message: "Dữ liệu không hợp lệ",
            fieldErrors: validated.error.flatten().fieldErrors,
        }
    }

    try {
        const result = await fetchApi(`${BASE_URL}/invite`, {
            method: "POST",
            body: JSON.stringify({
                email: validated.data.email,
                full_name: validated.data.fullName,
                title: validated.data.title,
                role: validated.data.role,
            }),
        })

        if (!result.success) {
            return { success: false, message: result.error }
        }

        revalidatePath("/admin/staff")
        return { success: true, message: "Đã gửi lời mời thành công" }
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Lỗi hệ thống",
        }
    }
}

export async function deleteStaff(id: string): Promise<ActionState> {
    try {
        const result = await fetchApi(`${BASE_URL}/${id}`, {
            method: "DELETE",
        })

        if (!result.success) {
            return { success: false, message: result.error }
        }

        revalidatePath("/admin/staff")
        return { success: true, message: "Đã xóa nhân viên thành công" }
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Lỗi khi xóa nhân viên",
        }
    }
}

interface BackendStaffProfile {
    user_id: string
    full_name: string
    title: string
    bio?: string
    color_code: string
    is_active: boolean
    role?: string
    skill_ids?: string[]
    email?: string
    avatar_url?: string
}
// WHY: Transform snake_case từ Backend sang camelCase cho Frontend
function transformStaff(item: BackendStaffProfile): StaffProfile {
    return {
        userId: item.user_id,
        fullName: item.full_name,
        title: item.title,
        bio: item.bio,
        colorCode: item.color_code,
        isActive: item.is_active,
        role: item.role as any,
        skillIds: item.skill_ids,
        email: item.email,
        avatarUrl: item.avatar_url,
    }
}

export async function getStaffList() {
    const result = await fetchApi<BackendStaffProfile[]>(BASE_URL, { method: "GET" })
    if (!result.success) {
        throw new Error(result.error)
    }

    return result.data.map(transformStaff)
}

export async function getStaffDetail(id: string) {
    const result = await fetchApi<BackendStaffProfile>(`${BASE_URL}/${id}`, { method: "GET" })
    if (!result.success) {
        throw new Error(result.error)
    }

    return transformStaff(result.data)
}

export async function updateStaffProfile(
    id: string,
    prevState: ActionState | null,
    formData: FormData
): Promise<ActionState> {
    const rawData = {
        fullName: formData.get("fullName"),
        title: formData.get("title"),
        bio: formData.get("bio"),
        colorCode: formData.get("colorCode"),
        avatarUrl: formData.get("avatarUrl"),
        isActive: formData.get("isActive") === "true",
    }

    try {
        const result = await fetchApi(`${BASE_URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify({
                full_name: rawData.fullName,
                title: rawData.title,
                bio: rawData.bio,
                color_code: rawData.colorCode,
                avatar_url: rawData.avatarUrl,
                is_active: rawData.isActive,
            }),
        })

        if (!result.success) {
            return { success: false, message: result.error }
        }

        revalidatePath("/admin/staff")
        revalidatePath(`/admin/staff/${id}`)
        return { success: true, message: "Cập nhật thông tin thành công" }
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Lỗi hệ thống",
        }
    }
}

export async function updateStaffSkills(
    id: string,
    skillIds: string[]
): Promise<ActionState> {
    try {
        const result = await fetchApi(`${BASE_URL}/${id}/skills`, {
            method: "PUT",
            body: JSON.stringify({
                skill_ids: skillIds,
            }),
        })

        if (!result.success) {
            return { success: false, message: result.error }
        }

        revalidatePath("/admin/staff")
        revalidatePath(`/admin/staff/${id}`)
        return { success: true, message: "Cập nhật kỹ năng thành công" }
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Lỗi khi cập nhật kỹ năng",
        }
    }
}
