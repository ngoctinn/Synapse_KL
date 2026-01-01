"use client"

import { Filter } from "lucide-react"
import { DATA_TABLE_TEXT } from "./data-table-text"

export interface DataTableEmptyStateProps {
  colSpan: number
  title?: string
  description?: string
  icon?: React.ReactNode
}

/**
 * Empty state component for DataTable.
 * Displayed when there's no data to show.
 */
export function DataTableEmptyState({
  colSpan,
  title = DATA_TABLE_TEXT.emptyTitle,
  description = DATA_TABLE_TEXT.emptyDescription,
  icon,
}: DataTableEmptyStateProps) {
  return (
    <tr className="hover:bg-transparent">
      <td colSpan={colSpan} className="h-48 text-center">
        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <div className="rounded-full bg-muted p-3">
            {icon || <Filter className="h-6 w-6 opacity-40" />}
          </div>
          <p className="text-sm font-medium">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground/70">{description}</p>
          )}
        </div>
      </td>
    </tr>
  )
}
