"use client"

import * as React from "react"

export interface UsePaginationProps {
  totalItems: number
  initialPage?: number
  initialPageSize?: number
  pageSizeOptions?: number[]
}

export interface UsePaginationReturn {
  currentPage: number
  pageSize: number
  totalPages: number
  startItem: number
  endItem: number
  pageSizeOptions: number[]
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  nextPage: () => void
  prevPage: () => void
  canNextPage: boolean
  canPrevPage: boolean
  pageNumbers: (number | "...")[]
}

/**
 * Hook for managing pagination state.
 * Extracted from DataTable for reusability.
 */
export function usePagination({
  totalItems,
  initialPage = 1,
  initialPageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
}: UsePaginationProps): UsePaginationReturn {
  const [currentPage, setCurrentPage] = React.useState(initialPage)
  const [pageSize, setPageSizeState] = React.useState(initialPageSize)

  const totalPages = Math.ceil(totalItems / pageSize)
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  // Reset to page 1 when pageSize changes
  const setPageSize = React.useCallback((size: number) => {
    setPageSizeState(size)
    setCurrentPage(1)
  }, [])

  const setPage = React.useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
  }, [totalPages])

  const nextPage = React.useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }, [currentPage, totalPages])

  const prevPage = React.useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }, [currentPage])

  // Generate page numbers array with ellipsis
  const pageNumbers = React.useMemo(() => {
    const pages: (number | "...")[] = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)

      if (currentPage > 3) {
        pages.push("...")
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push("...")
      }

      if (totalPages > 1) pages.push(totalPages)
    }

    return pages
  }, [currentPage, totalPages])

  return {
    currentPage,
    pageSize,
    totalPages,
    startItem,
    endItem,
    pageSizeOptions,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    canNextPage: currentPage < totalPages,
    canPrevPage: currentPage > 1,
    pageNumbers,
  }
}
