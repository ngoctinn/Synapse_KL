"use client"

import { Table } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import * as React from "react"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const pageCount = table.getPageCount()
  const pageIndex = table.getState().pagination.pageIndex

  // Logic to generate page numbers with ellipsis
  const getPages = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (pageCount <= maxVisible + 2) {
      for (let i = 0; i < pageCount; i++) pages.push(i)
    } else {
      if (pageIndex < maxVisible - 1) {
        for (let i = 0; i < maxVisible; i++) pages.push(i)
        pages.push("...")
        pages.push(pageCount - 1)
      } else if (pageIndex > pageCount - maxVisible) {
        pages.push(0)
        pages.push("...")
        for (let i = pageCount - maxVisible; i < pageCount; i++) pages.push(i)
      } else {
        pages.push(0)
        pages.push("...")
        for (let i = pageIndex - 1; i <= pageIndex + 1; i++) pages.push(i)
        pages.push("...")
        pages.push(pageCount - 1)
      }
    }
    return pages
  }

  return (
    <div data-slot="pagination" className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
      <div data-slot="pagination-selected" className="flex-1 text-xs sm:text-sm text-neutral-40 font-medium order-2 sm:order-1">
        Đã chọn <span className="text-neutral-80 font-bold">{table.getFilteredSelectedRowModel().rows.length}</span> trên{" "}
        <span className="text-neutral-80 font-bold">{table.getFilteredRowModel().rows.length}</span> dòng.
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-8 order-1 sm:order-2">
        <div data-slot="pagination-page-size" className="flex items-center space-x-2">
          <p className="text-xs sm:text-sm font-semibold text-neutral-60">Hiển thị</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-9 w-[75px] bg-background border-neutral-10/60 rounded-lg hover:border-neutral-20 transition-all font-bold text-xs">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top" className="border-border/40 shadow-xl">
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`} className="text-xs">
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div data-slot="pagination-actions" className="flex items-center gap-1 sm:gap-1.5">
          <Button
            variant="ghost"
            className="h-9 w-9 p-0 hover:bg-neutral-5 rounded-lg text-neutral-40 disabled:opacity-30 transition-all"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Trang trước</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {getPages().map((page, idx) => (
              <React.Fragment key={idx}>
                {page === "..." ? (
                  <span className="px-2 text-neutral-30 text-xs font-bold">...</span>
                ) : (
                  <Button
                    variant={pageIndex === page ? "default" : "ghost"}
                    className={cn(
                      "h-9 min-w-[36px] px-1.5 text-xs font-bold rounded-lg transition-all",
                      pageIndex === page
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
                        : "text-neutral-60 hover:bg-neutral-5 hover:text-neutral-100"
                    )}
                    onClick={() => table.setPageIndex(page as number)}
                  >
                    {(page as number) + 1}
                  </Button>
                )}
              </React.Fragment>
            ))}
          </div>

          <Button
            variant="ghost"
            className="h-9 w-9 p-0 hover:bg-neutral-5 rounded-lg text-neutral-40 disabled:opacity-30 transition-all"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Trang sau</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
