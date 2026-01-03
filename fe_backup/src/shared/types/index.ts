// Shared Types
// Export common TypeScript types/interfaces here

export type ID = string;

export type UserRole = "manager" | "receptionist" | "technician" | "customer";

export const USER_ROLES: Record<string, UserRole> = {
  MANAGER: "manager",
  RECEPTIONIST: "receptionist",
  TECHNICIAN: "technician",
  CUSTOMER: "customer",
} as const;

export interface BaseEntity {
  id: ID;
  createdAt: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  detail: string;
  status?: number;
}
