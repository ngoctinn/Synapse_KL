"use server"

import { fetchApi } from "@/shared/lib/api-client"
import { UserRole } from "@/shared/model/enums"
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

const BASE_URL = "/staff"

import { createClient } from "@supabase/supabase-js"

// ...

export async function inviteStaff(
    prevState: ActionState | null,
    formData: FormData
): Promise<ActionState> {
    const rawData = {
        email: formData.get("email") as string,
        fullName: formData.get("fullName") as string,
        title: formData.get("title") as string,
        role: formData.get("role") as UserRole,
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
        // SCHEME 2: Invite via Next.js (Node.js) to bypass Python Cloudflare WAF issues
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // 1. Invite User via Supabase Admin API
        const { data: userData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
            validated.data.email,
            {
                data: {
                    full_name: validated.data.fullName,
                    role: validated.data.role
                }
            }
        )

        if (inviteError) {
            console.error("Supabase Invite Error:", inviteError)

            // Check for existing user error
            if (inviteError.message.includes("already been registered")) {
                 // Try to fetch existing user to get ID for syncing
                 // NOTE: This might not verify password/ownership, but safe for 'sync' logic as email is key.
                 // Actually admin.invteUserByEmail returns user even if existing? No, it errors.
            }

            return { success: false, message: `Lỗi mời: ${inviteError.message}` }
        }

        const userId = userData.user?.id

        if (!userId) {
             return { success: false, message: "Không nhận được User ID từ hệ thống." }
        }

        // 2. Sync with Backend (Create Staff Profile)
        const result = await fetchApi(`${BASE_URL}/invite`, {
            method: "POST",
            body: JSON.stringify({
                user_id: userId,
                email: validated.data.email,
                full_name: validated.data.fullName,
                title: validated.data.title,
                role: validated.data.role,
                // Removed skip_invitation - Backend now expects direct sync
            }),
        })

        if (!result.success) {
            console.error("Backend Sync Failed. Rolling back Supabase User...", result.error)

            // 3. ROLLBACK: Delete the user from Supabase Auth so we don't have orphan users
            const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

            if (deleteError) {
                console.error("CRITICAL: Failed to rollback user deletion!", deleteError)
                // In real prod, this should alert an admin channel
                return {
                    success: false,
                    message: `Lỗi đồng bộ hệ thống: ${result.error}. (Lưu ý: Tài khoản Auth chưa xóa sạch, vui lòng báo Admin)`
                }
            }

            return {
                success: false,
                message: `Lỗi đồng bộ hồ sơ: ${result.error}. Đã hủy lời mời để đảm bảo dữ liệu.`
            }
        }

        revalidatePath("/admin/staff")
        return { success: true, message: "Đã gửi lời mời thành công" }
    } catch (error) {
        console.error("Invite Action Error:", error)
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
export async function resendInviteStaff(email: string): Promise<ActionState> {
    if (!email) {
        return { success: false, message: "Email không hợp lệ" }
    }

    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email)

        if (error) {
            console.error("Resend Invite Error:", error)
            return { success: false, message: `Lỗi gửi lại lời mời: ${error.message}` }
        }

        return { success: true, message: "Đã gửi lại email mời nhân viên" }
    } catch (error) {
        console.error("Resend Invite Action Error:", error)
        return {
            success: false,
            message: error instanceof Error ? error.message : "Lỗi hệ thống",
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
    role?: UserRole
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
        role: item.role,
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
