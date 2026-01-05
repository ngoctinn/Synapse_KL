import { z } from "zod"

export const skillSchema = z.object({
    id: z.uuid(),
    name: z.string().min(2, { error: "Tên kỹ năng phải có ít nhất 2 ký tự" }),
    code: z.string().min(2, { error: "Mã kỹ năng phải có ít nhất 2 ký tự" }),
    description: z.string().optional().nullable(),
})

export type Skill = z.infer<typeof skillSchema>

export const skillCreateSchema = z.object({
    name: z.string().min(2, { error: "Tên kỹ năng phải có ít nhất 2 ký tự" }),
    code: z.string().optional(),
    description: z.string().optional(),
})

export type SkillCreateValues = z.infer<typeof skillCreateSchema>
