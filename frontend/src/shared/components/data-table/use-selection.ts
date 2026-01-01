"use client"

import * as React from "react"

export interface UseSelectionProps<T extends { id: string | number }> {
  data: T[]
  onSelectionChange?: (selectedRows: T[]) => void
}

export interface UseSelectionReturn<T> {
  selectedIds: Set<string | number>
  isAllSelected: boolean
  isSomeSelected: boolean
  toggleAll: () => void
  toggleRow: (id: string | number) => void
  isSelected: (id: string | number) => boolean
  clearSelection: () => void
  selectAll: () => void
  selectedRows: T[]
}

/**
 * Hook for managing row selection state in data tables.
 * Supports select all, individual selection, and provides derived state.
 */
export function useSelection<T extends { id: string | number }>({
  data,
  onSelectionChange,
}: UseSelectionProps<T>): UseSelectionReturn<T> {
  const [selectedIds, setSelectedIds] = React.useState<Set<string | number>>(new Set())

  const isAllSelected = selectedIds.size === data.length && data.length > 0
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < data.length

  const toggleAll = React.useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set())
      onSelectionChange?.([])
    } else {
      const allIds = data.map(d => d.id)
      setSelectedIds(new Set(allIds))
      onSelectionChange?.(data)
    }
  }, [data, isAllSelected, onSelectionChange])

  const toggleRow = React.useCallback((id: string | number) => {
    setSelectedIds(prev => {
      const newIds = new Set(prev)
      if (newIds.has(id)) {
        newIds.delete(id)
      } else {
        newIds.add(id)
      }
      onSelectionChange?.(data.filter(row => newIds.has(row.id)))
      return newIds
    })
  }, [data, onSelectionChange])

  const isSelected = React.useCallback((id: string | number) => {
    return selectedIds.has(id)
  }, [selectedIds])

  const clearSelection = React.useCallback(() => {
    setSelectedIds(new Set())
    onSelectionChange?.([])
  }, [onSelectionChange])

  const selectAll = React.useCallback(() => {
    const allIds = data.map(d => d.id)
    setSelectedIds(new Set(allIds))
    onSelectionChange?.(data)
  }, [data, onSelectionChange])

  const selectedRows = React.useMemo(() => {
    return data.filter(row => selectedIds.has(row.id))
  }, [data, selectedIds])

  return {
    selectedIds,
    isAllSelected,
    isSomeSelected,
    toggleAll,
    toggleRow,
    isSelected,
    clearSelection,
    selectAll,
    selectedRows,
  }
}
