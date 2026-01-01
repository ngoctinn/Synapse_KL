/**
 * Vietnamese text constants for data table components.
 * Centralized location for i18n-ready text.
 */
export const DATA_TABLE_TEXT = {
  // Search & Filter
  searchPlaceholder: "Tìm kiếm nhanh...",
  selectPlaceholder: "Chọn...",
  selectAll: "Tất cả",

  // Empty State
  emptyTitle: "Chưa có dữ liệu hiển thị",
  emptyDescription: "Thử thay đổi bộ lọc hoặc thêm dữ liệu mới",

  // Pagination
  showing: "Hiển thị",
  of: "của",
  results: "kết quả",
  paginationInfo: (start: number, end: number, total: number) =>
    `Hiển thị ${start}-${end} của ${total} kết quả`,

  // Actions
  viewDetails: "Xem chi tiết",
  edit: "Chỉnh sửa",
  delete: "Xóa",

  // Column Headers
  no: "No",
} as const

export type DataTableTextKey = keyof typeof DATA_TABLE_TEXT
