/**
 * Service Management Types
 * Interfaces cho tất cả entities trong module Services.
 */

// ========== Skill ==========
export interface Skill {
  id: string;
  name: string;
  code: string;
  description: string | null;
}

export interface SkillWithCounts extends Skill {
  service_count: number;
  staff_count: number;
}

// ========== Category ==========
export interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
}

export interface ServiceCategoryWithCount extends ServiceCategory {
  service_count: number;
}

// ========== Resource ==========
export type ResourceType = "BED" | "EQUIPMENT" | "ROOM" | "OTHER";
export type ResourceStatus = "ACTIVE" | "MAINTENANCE" | "INACTIVE";

export interface ResourceGroup {
  id: string;
  name: string;
  type: ResourceType;
  description: string | null;
}

export interface ResourceGroupWithCount extends ResourceGroup {
  resource_count: number;
  active_count: number;
}

export interface Resource {
  id: string;
  group_id: string | null;
  name: string;
  code: string | null;
  status: ResourceStatus;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResourceWithGroup extends Resource {
  group: ResourceGroup | null;
}

export interface ResourceMaintenance {
  id: string;
  resource_id: string;
  start_time: string;
  end_time: string;
  reason: string | null;
  created_at: string;
}

// ========== Service ==========
export interface ServiceResourceRequirement {
  group_id: string;
  quantity: number;
  start_delay: number;
  usage_duration: number | null;
}

export interface Service {
  id: string;
  category_id: string | null;
  name: string;
  duration: number;
  buffer_time: number;
  price: number;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceWithDetails extends Service {
  category: ServiceCategory | null;
  skills: Skill[];
  resource_requirements: ServiceResourceRequirement[];
}

// Pagination response wrapper
export interface ServiceListResponse {
  data: Service[];
  total: number;
  page: number;
  limit: number;
}

// ========== Form DTOs ==========
export interface SkillCreateInput {
  name: string;
  code?: string;
  description?: string;
}

export interface SkillUpdateInput {
  name?: string;
  description?: string;
}

export interface CategoryCreateInput {
  name: string;
  description?: string;
}

export interface CategoryUpdateInput {
  name?: string;
  description?: string;
}

export interface ResourceGroupCreateInput {
  name: string;
  type: ResourceType;
  description?: string;
}

export interface ResourceCreateInput {
  group_id: string;
  name: string;
  code?: string;
  status?: ResourceStatus;

  description?: string;
  image_url?: string;
}

export interface MaintenanceCreateInput {
  start_time: string;
  end_time: string;
  reason?: string;
}

export interface ServiceResourceRequirementInput {
  group_id: string;
  quantity: number;
  start_delay: number;
  usage_duration?: number;
}

export interface ServiceCreateInput {
  category_id?: string;
  name: string;
  duration: number;
  buffer_time?: number;
  price: number;
  description?: string;
  image_url?: string;
  skill_ids?: string[];
  resource_requirements?: ServiceResourceRequirementInput[];
  is_active?: boolean;
}

export interface ServiceUpdateInput {
  category_id?: string;
  name?: string;
  duration?: number;
  buffer_time?: number;
  price?: number;
  description?: string;
  image_url?: string;
  is_active?: boolean;
  skill_ids?: string[];
  resource_requirements?: ServiceResourceRequirementInput[];
}
