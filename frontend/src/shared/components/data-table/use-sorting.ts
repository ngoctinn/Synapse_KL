"use client"

import * as React from "react"

export type SortDirection = "asc" | "desc"

export interface SortConfig {
  key: string
  direction: SortDirection
}

export interface UseSortingProps<T> {
  onSort?: (key: keyof T, direction: SortDirection) => void
}

export interface UseSortingReturn {
  sortConfig: SortConfig | null
  handleSort: (key: string) => void
  getSortDirection: (key: string) => SortDirection | null
  clearSort: () => void
}

/**
 * Hook for managing sort state in data tables.
 * Toggles between asc/desc on same column clicks.
 */
export function useSorting<T>({
  onSort,
}: UseSortingProps<T> = {}): UseSortingReturn {
  const [sortConfig, setSortConfig] = React.useState<SortConfig | null>(null)

  const handleSort = React.useCallback((key: string) => {
    setSortConfig(prev => {
      const direction: SortDirection =
        prev?.key === key && prev.direction === "asc" ? "desc" : "asc"

      onSort?.(key as keyof T, direction)
      return { key, direction }
    })
  }, [onSort])

  const getSortDirection = React.useCallback((key: string): SortDirection | null => {
    if (sortConfig?.key === key) {
      return sortConfig.direction
    }
    return null
  }, [sortConfig])

  const clearSort = React.useCallback(() => {
    setSortConfig(null)
  }, [])

  return {
    sortConfig,
    handleSort,
    getSortDirection,
    clearSort,
  }
}
