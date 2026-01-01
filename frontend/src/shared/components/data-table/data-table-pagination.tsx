"use client"

import { Button } from "@/shared/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DATA_TABLE_TEXT } from "./data-table-text"

export interface DataTablePaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  startItem: number
  endItem: number
  totalItems: number
  pageSizeOptions?: number[]
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageNumbers: (number | "...")[]
}

/**
 * Pagination component for DataTable.
 * Displays page info, page size selector, and page navigation.
 */
export function DataTablePagination({
  currentPage,
  totalPages,
  pageSize,
  startItem,
  endItem,
  totalItems,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  pageNumbers,
}: DataTablePaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between border-t pt-4">
      {/* Info */}
      <div className="text-sm text-muted-foreground">
        {DATA_TABLE_TEXT.paginationInfo(startItem, endItem, totalItems)}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Page size selector */}
        {pageSizeOptions && onPageSizeChange && (
          <div className="flex items-center gap-2 mr-4">
            <span className="text-sm text-muted-foreground">{DATA_TABLE_TEXT.showing}</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => onPageSizeChange(Number(val))}
            >
              <SelectTrigger className="h-9 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map(size => (
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
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page numbers */}
          {pageNumbers.map((page, idx) => (
            page === "..." ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "ghost"}
                size="icon"
                className="h-9 w-9"
                onClick={() => onPageChange(page)}
                aria-label={`Go to page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
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
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
