import { z } from "zod"

export const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  sort_order: z.number().default(0),
  service_count: z.number().int().default(0).optional(), // From ReadWithCount
})

export type Category = z.infer<typeof categorySchema>

export const categoryCreateSchema = z.object({
  name: z.string().min(1, "Tên danh mục không được để trống").max(100, "Tên danh mục quá dài"),
  description: z.string().optional(),
})

export type CategoryCreateValues = z.infer<typeof categoryCreateSchema>

export const categoryUpdateSchema = categoryCreateSchema.partial()

export const categoryReorderSchema = z.object({
  ids: z.array(z.string().uuid()),
})
