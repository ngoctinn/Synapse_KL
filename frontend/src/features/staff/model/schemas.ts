import { z } from "zod"

export enum StaffRole {
    MANAGER = "manager",
    RECEPTIONIST = "receptionist",
    TECHNICIAN = "technician",
}

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
    [StaffRole.MANAGER]: "Quản lý",
    [StaffRole.RECEPTIONIST]: "Lễ tân",
    [StaffRole.TECHNICIAN]: "Kỹ thuật viên",
}

export const staffInviteSchema = z.object({
    email: z.email({ error: "Email không hợp lệ" }),
    fullName: z.string().min(2, { error: "Tên phải có ít nhất 2 ký tự" }),
    title: z.string().min(2, { error: "Chức danh không được để trống" }),
    role: z.enum(StaffRole, {
        error: "Vui lòng chọn vai trò",
    }),
})

export type StaffInviteValues = z.infer<typeof staffInviteSchema>

export const staffUpdateSchema = z.object({
    fullName: z.string().min(2, { error: "Tên phải có ít nhất 2 ký tự" }),
    title: z.string().min(2, { error: "Chức danh không được để trống" }),
    bio: z.string().optional(),
    colorCode: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { error: "Mã màu không hợp lệ" }),
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
    role?: StaffRole // Optional because it comes from public.profiles join
    avatarUrl?: string
    email?: string // For display
    skillIds?: string[]
}
