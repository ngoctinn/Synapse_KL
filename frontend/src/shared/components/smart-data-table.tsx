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
import { ArrowUpDown, Filter, MoreHorizontal } from "lucide-react"
import * as React from "react"

import { DataTableEmptyState } from "./data-table/data-table-empty-state"
import { DataTablePagination } from "./data-table/data-table-pagination"
import { DATA_TABLE_TEXT } from "./data-table/data-table-text"
import { useSelection } from "./data-table/use-selection"
import { useSorting } from "./data-table/use-sorting"

export interface Column<T> {
  key: keyof T | "actions" | "no" | "selection"
  label: string
  sortable?: boolean
  filterable?: boolean
  filterOptions?: { label: string; value: string }[]
  render?: (value: unknown, row: T) => React.ReactNode
  width?: string
}

interface PaginationConfig {
  pageSize: number
  currentPage: number
  totalItems: number
  onPageChange: (page: number) => void
  pageSizeOptions?: number[]
  onPageSizeChange?: (size: number) => void
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  onSelectionChange?: (selectedRows: T[]) => void
  onSort?: (key: keyof T, direction: "asc" | "desc") => void
  onFilterChange?: (key: keyof T, value: string) => void
  pagination?: PaginationConfig
}

/**
 * DataTable component - Synapse V2025 design.
 * Now uses composable hooks and sub-components internally.
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
  // Use composable hooks
  const { selectedIds, isAllSelected, toggleAll, toggleRow, isSelected } = useSelection({
    data,
    onSelectionChange,
  })

  const { sortConfig, handleSort } = useSorting({ onSort })

  // Pagination calculations
  const totalPages = pagination ? Math.ceil(pagination.totalItems / pagination.pageSize) : 1
  const startItem = pagination ? (pagination.currentPage - 1) * pagination.pageSize + 1 : 1
  const endItem = pagination ? Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems) : data.length

  // Generate page numbers
  const getPageNumbers = (): (number | "...")[] => {
    if (!pagination) return []
    const { currentPage } = pagination
    const pages: (number | "...")[] = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push("...")
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push("...")
      if (totalPages > 1) pages.push(totalPages)
    }
    return pages
  }

  // Row number calculation
  const getRowNumber = (index: number) => {
    if (pagination) {
      return (pagination.currentPage - 1) * pagination.pageSize + index + 1
    }
    return index + 1
  }

  // Get sort direction for aria-sort
  const getSortDirection = (key: string) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === "asc" ? "ascending" : "descending"
    }
    return undefined
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table className="min-w-full">
          <TableHeader>
            {/* Header Row */}
            <TableRow className="hover:bg-transparent border-b-0">
              {columns.map((column) => {
                const isSticky = column.key === "actions"
                const stickyClass = isSticky ? "sticky right-0 bg-secondary z-10" : ""

                if (column.key === "no") {
                  return (
                    <TableHead
                      key="no"
                      className="w-12 font-bold text-foreground bg-inherit"
                      style={{ width: column.width }}
                    >
                      {DATA_TABLE_TEXT.no}
                    </TableHead>
                  )
                }

                if (column.key === "selection") {
                  return (
                    <TableHead key="selection" className="w-12 bg-inherit" style={{ width: column.width }}>
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={toggleAll}
                        aria-label="Select all rows"
                      />
                    </TableHead>
                  )
                }

                return (
                  <TableHead
                    key={column.key as string}
                    className={cn("group bg-inherit", stickyClass)}
                    style={{ width: column.width }}
                    aria-sort={column.sortable ? getSortDirection(column.key as string) ?? "none" : undefined}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-foreground text-sm">{column.label}</span>
                      {column.sortable && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-60 transition-opacity"
                          onClick={() => handleSort(column.key as string)}
                          aria-label={`Sort by ${column.label}`}
                        >
                          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  </TableHead>
                )
              })}
            </TableRow>

            {/* Filter Row */}
            {columns.some(c => c.filterable) && (
              <TableRow className="bg-muted/50 border-b border-border">
                {columns.map((column) => {
                  const isSticky = column.key === "actions"
                  const stickyClass = isSticky ? "sticky right-0 bg-secondary z-10" : ""

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
                          <SelectTrigger className="w-full text-xs bg-background h-11 px-2 rounded-md shadow-none border-border font-medium">
                            <SelectValue placeholder={DATA_TABLE_TEXT.selectPlaceholder} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{DATA_TABLE_TEXT.selectAll}</SelectItem>
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
            )}
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <DataTableEmptyState colSpan={columns.length} />
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer transition-colors"
                  onClick={() => onRowClick?.(row)}
                  data-selected={isSelected(row.id)}
                >
                  {columns.map((column) => {
                    const isSticky = column.key === "actions"
                    const stickyClass = isSticky ? "sticky right-0 bg-card" : ""

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
                            checked={isSelected(row.id)}
                            onCheckedChange={() => toggleRow(row.id)}
                            aria-label={`Select row ${getRowNumber(index)}`}
                          />
                        </TableCell>
                      )
                    }

                    if (column.key === "actions") {
                      return (
                        <TableCell
                          key="actions"
                          className={cn("text-right sticky right-0 z-10 bg-card")}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {column.render ? (
                            column.render(row[column.key as keyof T], row)
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" aria-label="Row actions">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[160px] rounded-xl shadow-lg border-border/50">
                                <DropdownMenuItem className="cursor-pointer rounded-lg flex gap-2">
                                  <span>{DATA_TABLE_TEXT.viewDetails}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer rounded-lg flex gap-2">
                                  <span>{DATA_TABLE_TEXT.edit}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer rounded-lg text-destructive focus:text-destructive flex gap-2">
                                  <span>{DATA_TABLE_TEXT.delete}</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
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

      {/* Pagination */}
      {pagination && (
        <DataTablePagination
          currentPage={pagination.currentPage}
          totalPages={totalPages}
          pageSize={pagination.pageSize}
          startItem={startItem}
          endItem={endItem}
          totalItems={pagination.totalItems}
          pageSizeOptions={pagination.pageSizeOptions}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
          pageNumbers={getPageNumbers()}
        />
      )}
    </div>
  )
}
