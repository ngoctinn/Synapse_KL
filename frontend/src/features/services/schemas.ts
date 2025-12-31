/**
 * Zod Schemas cho form validation.
 */
import { z } from "zod";

// ========== Skill Schemas ==========
export const skillCreateSchema = z.object({
  name: z.string().min(1, "Tên kỹ năng là bắt buộc").max(100),
  code: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
});

export const skillUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export type SkillCreateForm = z.infer<typeof skillCreateSchema>;
export type SkillUpdateForm = z.infer<typeof skillUpdateSchema>;

// ========== Category Schemas ==========
export const categoryCreateSchema = z.object({
  name: z.string().min(1, "Tên danh mục là bắt buộc").max(100),
  description: z.string().max(500).optional(),
});

export const categoryUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export type CategoryCreateForm = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateForm = z.infer<typeof categoryUpdateSchema>;

// ========== Resource Group Schemas ==========
export const resourceGroupCreateSchema = z.object({
  name: z.string().min(1, "Tên nhóm là bắt buộc").max(100),
  type: z.enum(["BED", "EQUIPMENT", "ROOM", "OTHER"]),
  description: z.string().max(500).optional(),
});

export type ResourceGroupCreateForm = z.infer<typeof resourceGroupCreateSchema>;

// ========== Resource Schemas ==========
export const resourceCreateSchema = z.object({
  group_id: z.string().uuid("Chọn nhóm tài nguyên"),
  name: z.string().min(1, "Tên tài nguyên là bắt buộc").max(100),
  code: z.string().max(50).optional(),
  status: z.enum(["ACTIVE", "MAINTENANCE", "OUT_OF_SERVICE"]),
  description: z.string().max(500).optional(),
  image_url: z.string().url().optional().or(z.literal("")),
});

export type ResourceCreateForm = z.infer<typeof resourceCreateSchema>;

// ========== Maintenance Schemas ==========
export const maintenanceCreateSchema = z.object({
  start_time: z.string().min(1, "Thời gian bắt đầu là bắt buộc"),
  end_time: z.string().min(1, "Thời gian kết thúc là bắt buộc"),
  reason: z.string().max(500).optional(),
}).refine(
  (data) => new Date(data.end_time) > new Date(data.start_time),
  { message: "Thời gian kết thúc phải sau thời gian bắt đầu", path: ["end_time"] }
);

export type MaintenanceCreateForm = z.infer<typeof maintenanceCreateSchema>;

// ========== Service Schemas ==========
const resourceRequirementSchema = z.object({
  group_id: z.string().uuid(),
  quantity: z.number().min(1, "Số lượng tối thiểu là 1"),
  start_delay: z.number().min(0).default(0),
  usage_duration: z.number().min(1).optional(),
});

export const serviceCreateSchema = z.object({
  category_id: z.string().uuid().optional().or(z.literal("")),
  name: z.string().min(1, "Tên dịch vụ là bắt buộc").max(255),
  duration: z.number().min(1, "Thời gian phải lớn hơn 0"),
  buffer_time: z.number().min(0),
  price: z.number().min(0, "Giá không được âm"),
  description: z.string().max(2000).optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  skill_ids: z.array(z.string().uuid()),
  resource_requirements: z.array(resourceRequirementSchema),
  is_active: z.boolean(),
});

export type ServiceCreateForm = z.infer<typeof serviceCreateSchema>;
