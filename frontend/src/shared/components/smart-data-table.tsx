"use client"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Checkbox } from "@/shared/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreHorizontal
} from "lucide-react"
import * as React from "react"

export interface Column<T> {
  key: keyof T | "actions" | "no" | "selection"
  label: string
  sortable?: boolean
  filterable?: boolean
  filterOptions?: { label: string; value: string }[]
  render?: (value: unknown, row: T) => React.ReactNode
  /** Chiều rộng cố định cho cột (CSS width) */
  width?: string
}

interface PaginationConfig {
  /** Số dòng mỗi trang */
  pageSize: number
  /** Trang hiện tại (1-indexed) */
  currentPage: number
  /** Tổng số items */
  totalItems: number
  /** Callback khi chuyển trang */
  onPageChange: (page: number) => void
  /** Các tùy chọn số dòng mỗi trang */
  pageSizeOptions?: number[]
  /** Callback khi thay đổi số dòng mỗi trang */
  onPageSizeChange?: (size: number) => void
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  onSelectionChange?: (selectedRows: T[]) => void
  onSort?: (key: keyof T, direction: "asc" | "desc") => void
  onFilterChange?: (key: keyof T, value: string) => void
  /** Cấu hình phân trang - nếu không truyền sẽ hiển thị tất cả */
  pagination?: PaginationConfig
}

/**
 * Component Bảng chuẩn theo thiết kế Synapse V2025.
 * Hỗ trợ: STT, Checkbox selection, Sắp xếp, Bộ lọc từng cột, Menu hành động,
 * Phân trang tùy chỉnh, Scroll ngang với cột Actions sticky.
 */
export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  onRowClick,
  onSelectionChange,
  onSort,
  onFilterChange,
  pagination,
}: DataTableProps<T>) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string | number>>(new Set())
  const [sortConfig, setSortConfig] = React.useState<{ key: string; dir: "asc" | "desc" } | null>(null)

  const toggleAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set())
      onSelectionChange?.([])
    } else {
      const allIds = data.map(d => d.id)
      setSelectedIds(new Set(allIds))
      onSelectionChange?.(data)
    }
  }

  const toggleRow = (id: string | number) => {
    const newIds = new Set(selectedIds)
    if (newIds.has(id)) {
      newIds.delete(id)
    } else {
      newIds.add(id)
    }
    setSelectedIds(newIds)
    onSelectionChange?.(data.filter(row => newIds.has(row.id)))
  }

  const handleSort = (key: string) => {
    const direction = sortConfig?.key === key && sortConfig.dir === "asc" ? "desc" : "asc"
    setSortConfig({ key, dir: direction })
    onSort?.(key as keyof T, direction)
  }

  // Tính toán pagination
  const totalPages = pagination ? Math.ceil(pagination.totalItems / pagination.pageSize) : 1
  const startItem = pagination ? (pagination.currentPage - 1) * pagination.pageSize + 1 : 1
  const endItem = pagination ? Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems) : data.length

  // Tạo mảng số trang để hiển thị
  const getPageNumbers = () => {
    if (!pagination) return []
    const { currentPage } = pagination
    const pages: (number | "...")[] = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      // Luôn hiển thị trang 1
      pages.push(1)

      if (currentPage > 3) {
        pages.push("...")
      }

      // Các trang xung quanh trang hiện tại
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push("...")
      }

      // Luôn hiển thị trang cuối
      if (totalPages > 1) pages.push(totalPages)
    }

    return pages
  }

  // Tính STT dựa trên pagination
  const getRowNumber = (index: number) => {
    if (pagination) {
      return (pagination.currentPage - 1) * pagination.pageSize + index + 1
    }
    return index + 1
  }

  return (
    <div className="space-y-4">
      {/* Table với scroll ngang, có border và rounded */}
      <div className="overflow-x-auto rounded-lg border border-neutral-10 bg-card">
        <Table className="min-w-full">
          <TableHeader>
            {/* Header Row */}
            <TableRow className="hover:bg-transparent border-b-0">
              {columns.map((column) => {
                const isSticky = column.key === "actions"
                const stickyClass = isSticky
                  ? "sticky right-0 bg-secondary shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)] z-10"
                  : ""

                if (column.key === "no") {
                  return (
                    <TableHead
                      key="no"
                      className="w-12 font-bold text-foreground bg-inherit"
                      style={{ width: column.width }}
                    >
                      No
                    </TableHead>
                  )
                }
                if (column.key === "selection") {
                  return (
                    <TableHead key="selection" className="w-12 bg-inherit" style={{ width: column.width }}>
                      <Checkbox
                        checked={selectedIds.size === data.length && data.length > 0}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                  )
                }
                return (
                  <TableHead
                    key={column.key as string}
                    className={cn("group bg-inherit", stickyClass)}
                    style={{ width: column.width }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-foreground text-sm">{column.label}</span>
                      {column.sortable && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0 hover:bg-muted opacity-60 hover:opacity-100 transition-opacity"
                          onClick={() => handleSort(column.key as string)}
                        >
                          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  </TableHead>
                )
              })}
            </TableRow>

            {/* Filter Row - Nền siêu nhạt chuẩn Airy */}
            <TableRow className="hover:bg-transparent bg-neutral-5/15 border-b border-neutral-10">
              {columns.map((column) => {
                const isSticky = column.key === "actions"
                const stickyClass = isSticky
                  ? "sticky right-0 bg-secondary shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)] z-10"
                  : ""

                if (column.key === "no") {
                  return <TableCell key="no" className="py-2 bg-inherit"></TableCell>
                }
                if (column.key === "selection") {
                  return <TableCell key="selection" className="py-2 bg-inherit"></TableCell>
                }
                if (column.key === "actions") {
                  return (
                     <TableCell key="actions-filter" className={cn("py-2", stickyClass)}>
                        <div className="flex justify-end">
                          <Filter className="h-4 w-4 text-muted-foreground/40" />
                        </div>
                     </TableCell>
                  )
                }

                return (
                  <TableCell key={`${column.key as string}-filter`} className="py-1.5 px-3 bg-inherit">
                    {column.filterable ? (
                      <Select onValueChange={(val) => onFilterChange?.(column.key as keyof T, val)}>
                        <SelectTrigger className="w-full text-xs bg-background h-8 px-2 rounded-md shadow-none border-neutral-10 font-medium">
                          <SelectValue placeholder="Chọn..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          {column.filterOptions?.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : null}
                  </TableCell>
                )
              })}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <div className="rounded-full bg-muted p-3">
                      <Filter className="h-6 w-6 opacity-40" />
                    </div>
                    <p className="text-sm font-medium">Chưa có dữ liệu hiển thị</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer transition-colors"
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => {
                    const isSticky = column.key === "actions"
                    const stickyClass = isSticky
                      ? "sticky right-0 bg-card shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]"
                      : ""

                    if (column.key === "no") {
                      return (
                        <TableCell key="no" className="font-medium text-muted-foreground/80 bg-inherit">
                          {getRowNumber(index)}
                        </TableCell>
                      )
                    }
                    if (column.key === "selection") {
                      return (
                        <TableCell key="selection" className="bg-inherit" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.has(row.id)}
                            onCheckedChange={() => toggleRow(row.id)}
                          />
                        </TableCell>
                      )
                    }
                    if (column.key === "actions") {
                      return (
                        <TableCell
                          key="actions"
                          className={cn(
                            "text-right sticky right-0 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)] transition-colors z-10",
                            "bg-card group-hover:bg-accent group-data-[state=selected]:bg-accent/80"
                          )}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="secondary" size="icon" className="h-8 w-8 rounded-lg shadow-sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px] rounded-xl shadow-lg border-border/50">
                              <DropdownMenuItem className="cursor-pointer rounded-lg flex gap-2">
                                <span>Xem chi tiết</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer rounded-lg flex gap-2">
                                <span>Chỉnh sửa</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer rounded-lg text-destructive focus:text-destructive flex gap-2">
                                <span>Xóa</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )
                    }

                    const val = row[column.key as keyof T]
                    return (
                      <TableCell key={column.key as string} className="text-foreground">
                        {column.render ? column.render(val, row) : (val as React.ReactNode)}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          {/* Thông tin hiển thị */}
          <div className="text-sm text-muted-foreground">
            Hiển thị {startItem}-{endItem} của {pagination.totalItems} kết quả
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Page size selector */}
            {pagination.pageSizeOptions && pagination.onPageSizeChange && (
              <div className="flex items-center gap-2 mr-4">
                <span className="text-sm text-muted-foreground">Hiển thị</span>
                <Select
                  value={String(pagination.pageSize)}
                  onValueChange={(val) => pagination.onPageSizeChange?.(Number(val))}
                >
                  <SelectTrigger className="h-9 w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pagination.pageSizeOptions.map(size => (
                      <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Page navigation */}
            <div className="flex items-center gap-1">
              {/* Previous button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                disabled={pagination.currentPage <= 1}
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page numbers */}
              {getPageNumbers().map((page, idx) => (
                page === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
                ) : (
                  <Button
                    key={page}
                    variant={pagination.currentPage === page ? "default" : "ghost"}
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => pagination.onPageChange(page)}
                  >
                    {page}
                  </Button>
                )
              ))}

              {/* Next button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                disabled={pagination.currentPage >= totalPages}
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
