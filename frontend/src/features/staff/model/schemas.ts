import { UserRole } from "@/shared/model/enums"
import { z } from "zod"

export const STAFF_ROLE_LABELS: Record<UserRole, string> = {
    [UserRole.MANAGER]: "Quản lý",
    [UserRole.RECEPTIONIST]: "Lễ tân",
    [UserRole.TECHNICIAN]: "Kỹ thuật viên",
    [UserRole.CUSTOMER]: "Khách hàng",
}

export const staffInviteSchema = z.object({
    email: z.email({ message: "Email không hợp lệ" }),
    fullName: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
    title: z.string().min(2, { message: "Chức danh không được để trống" }),
    role: z.nativeEnum(UserRole, {
        message: "Vui lòng chọn vai trò",
    }),
})

export type StaffInviteValues = z.infer<typeof staffInviteSchema>

export const staffUpdateSchema = z.object({
    fullName: z.string().min(2, { error: "Tên phải có ít nhất 2 ký tự" }),
    title: z.string().min(2, { error: "Chức danh không được để trống" }),
    bio: z.string(),
    colorCode: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { error: "Mã màu không hợp lệ" }),
    avatarUrl: z.string().nullable().optional(),
    isActive: z.boolean(),
})

export type StaffUpdateValues = z.infer<typeof staffUpdateSchema>

export interface StaffProfile {
    userId: string
    fullName: string
    title: string
    bio?: string
    colorCode: string
    isActive: boolean
    role?: UserRole // Ensure consistency with UserRole enum
    avatarUrl?: string
    email?: string // For display
    skillIds?: string[]
}
