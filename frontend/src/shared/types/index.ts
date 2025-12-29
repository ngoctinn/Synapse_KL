// Shared Types
// Export common TypeScript types/interfaces here

export type ID = string;

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
