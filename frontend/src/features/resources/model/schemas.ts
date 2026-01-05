import { z } from "zod"

// === Enums ===

// WHY: Mapping 1:1 với Backend ResourceType Enum
export enum ResourceType {
  BED = "BED",
  EQUIPMENT = "EQUIPMENT",
  ROOM = "ROOM",
}

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  [ResourceType.BED]: "Giường",
  [ResourceType.EQUIPMENT]: "Thiết bị",
  [ResourceType.ROOM]: "Phòng",
}

// WHY: Mapping 1:1 với Backend ResourceStatus Enum
export enum ResourceStatus {
  ACTIVE = "ACTIVE",
  MAINTENANCE = "MAINTENANCE",
  INACTIVE = "INACTIVE",
}

export const RESOURCE_STATUS_LABELS: Record<ResourceStatus, string> = {
  [ResourceStatus.ACTIVE]: "Hoạt động",
  [ResourceStatus.MAINTENANCE]: "Bảo trì",
  [ResourceStatus.INACTIVE]: "Ngưng hoạt động",
}

// === Resource Group Schemas ===

// WHY: Read model từ API
export const resourceGroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.nativeEnum(ResourceType),
  description: z.string().nullable().optional(),
  resource_count: z.number().int().default(0),
  active_count: z.number().int().default(0),
})

export type ResourceGroup = z.infer<typeof resourceGroupSchema>

// WHY: Form schema cho Tạo/Sửa Group
export const resourceGroupFormSchema = z.object({
  name: z.string().min(1, "Tên nhóm không được để trống").max(100, "Tên quá dài"),
  type: z.nativeEnum(ResourceType),
  description: z.string().optional(),
})

export type ResourceGroupFormValues = z.infer<typeof resourceGroupFormSchema>

// === Resource Item Schemas ===

// WHY: Read model từ API
export const resourceSchema = z.object({
  id: z.string().uuid(),
  group_id: z.string().uuid().nullable(),
  name: z.string(),
  code: z.string().nullable(),
  status: z.nativeEnum(ResourceStatus),
  description: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
})

export type ResourceItem = z.infer<typeof resourceSchema>

// WHY: Form schema cho Tạo/Sửa Resource
export const resourceFormSchema = z.object({
  name: z.string().min(1, "Tên thiết bị không được để trống").max(100, "Tên quá dài"),
  code: z.string().max(50, "Mã quá dài").optional(),
  status: z.nativeEnum(ResourceStatus),
  description: z.string().optional(),
  group_id: z.string().uuid("Vui lòng chọn nhóm tài nguyên"),
})

export type ResourceFormValues = z.infer<typeof resourceFormSchema>
