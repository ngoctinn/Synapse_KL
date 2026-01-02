"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import * as React from "react"

import { cn } from "@/shared/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"
import { DataTableFilterRow } from "./data-table-filter-row"
import { DataTablePagination } from "./data-table-pagination"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  enableRowSelection?: boolean
  onRowClick?: (row: TData) => void
  stickyHeader?: boolean
  variant?: "default" | "flat"
}

export function DataTable<TData, TValue>({
  columns,
  data,
  enableRowSelection = true,
  onRowClick,
  stickyHeader = true,
  variant = "default",
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    // Tự động nhận diện ID từ dữ liệu để quản lý state (rowSelection) chính xác
    getRowId: (originalRow, index) => {
      const row = originalRow as Record<string, unknown>
      return row.id ? String(row.id) : index.toString()
    },
  })

  return (
    <div data-slot="data-table" className="space-y-4 font-sans">
      <div className={cn(
        "relative",
        variant === "default" && "overflow-hidden rounded-xl border border-border bg-background"
      )}>
        <Table>
          <TableHeader className={cn("bg-neutral-5/20 dark:bg-neutral-90/10 border-b-0 sticky top-0 z-30 shadow-none hover:bg-transparent", stickyHeader && "backdrop-blur-md")}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-none transition-none">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan} className="h-12 text-sm font-bold text-neutral-80 bg-transparent px-4 border-b border-neutral-20/80">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}

            {/* Hàng filter tích hợp trực tiếp vào Header */}
            <DataTableFilterRow table={table} />

          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="group cursor-pointer transition-all duration-200 border-b border-neutral-20/50 last:border-0 h-16 hover:bg-neutral-5/20 dark:hover:bg-neutral-90/10 data-[state=selected]:bg-primary/5"
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2 px-4 text-xs sm:text-sm text-neutral-80 font-medium group-hover:text-neutral-100 transition-colors">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-neutral-40 font-medium"
                >
                  Không tìm thấy kết quả phù hợp.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
