import { z } from "zod"

// Service Schemas - Frontend DTOs cho Services API

export const serviceResourceRequirementSchema = z.object({
    groupId: z.string().uuid(),
    quantity: z.number().int().min(1, { error: "Số lượng phải ≥ 1" }),
    startDelay: z.number().int().min(0, { error: "Start delay không được âm" }),
    usageDuration: z.number().int().nullable(),
})

export type ServiceResourceRequirement = z.infer<typeof serviceResourceRequirementSchema>

export const serviceBaseSchema = z.object({
    name: z.string().min(2, { error: "Tên dịch vụ phải có ít nhất 2 ký tự" }),
    categoryId: z.string().uuid().nullable(),
    duration: z.number().int().min(5, { error: "Thời gian thực hiện tối thiểu 5 phút" }),
    bufferTime: z.number().int().min(0, { error: "Thời gian nghỉ không được âm" }),
    price: z.number().min(0, { error: "Giá không được âm" }),
    description: z.string().nullable(),
    imageUrl: z.string().url().or(z.literal("")).nullable(),
    isActive: z.boolean(),
    skillIds: z.array(z.string().uuid()).min(1, { error: "Phải chọn ít nhất 1 kỹ năng" }),
    resourceRequirements: z.array(serviceResourceRequirementSchema),
})

export const serviceCreateSchema = serviceBaseSchema.superRefine((data, ctx) => {
    const totalTime = data.duration + data.bufferTime

    data.resourceRequirements.forEach((req, index) => {
        const usage = req.usageDuration ?? (data.duration - req.startDelay)

        // Logic check: Tài nguyên không thể dùng quá tổng thời gian (duration + buffer)
        if (req.startDelay + usage > totalTime) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Thời gian sử dụng vượt quá tổng thời gian dịch vụ (${totalTime}p)`,
                path: ["resourceRequirements", index, "usageDuration"],
            })
        }

        // Logic check: usage phải dương (đã check ở schema con nhưng check lại logic combine)
        if (usage <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Thời gian sử dụng thực tế phải > 0",
                path: ["resourceRequirements", index, "usageDuration"],
            })
        }
    })
})

export type ServiceCreateValues = z.infer<typeof serviceCreateSchema>

// Fix: Derive from base schema instead of refined create schema to allow .partial()
export const serviceUpdateSchema = serviceBaseSchema.partial().extend({
    skillIds: z.array(z.string().uuid()).min(1, { error: "Không thể xóa hết kỹ năng" }).optional(),
}).superRefine((data, ctx) => {
    // Chỉ validate logic nếu có đủ cả duration và resourceRequirements
    if (data.duration !== undefined && data.bufferTime !== undefined && data.resourceRequirements) {
        const totalTime = data.duration + data.bufferTime
        data.resourceRequirements.forEach((req, index) => {
            const usage = req.usageDuration ?? (data.duration! - req.startDelay)
             if (req.startDelay + usage > totalTime) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Logic Error: Resource > Service Time (${totalTime}p)`,
                    path: ["resourceRequirements", index, "usageDuration"],
                })
            }
        })
    }
})

export type ServiceUpdateValues = z.infer<typeof serviceUpdateSchema>

// Read types (from API response)
export interface ServiceCategory {
    id: string
    name: string
    description?: string
    sortOrder: number
}

export interface ServiceSkill {
    id: string
    name: string
    code: string
}

export interface ServiceResourceGroup {
    id: string
    name: string
    type: string
}

export interface ServiceResourceRequirementRead {
    groupId: string
    group: ServiceResourceGroup
    quantity: number
    startDelay: number
    usageDuration: number | null
}

export interface Service {
    id: string
    categoryId: string | null
    name: string
    duration: number
    bufferTime: number
    price: number
    description: string | null
    imageUrl: string | null
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface ServiceWithDetails extends Service {
    category: ServiceCategory | null
    skills: ServiceSkill[]
    resourceRequirements: ServiceResourceRequirementRead[]
}
