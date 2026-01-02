"use client"

import { Column } from "@tanstack/react-table"
import {
    ArrowDown,
    ArrowDownUp,
    ArrowUp
} from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return (
      <div
        data-slot="column-header-title"
        className={cn("px-1 py-1.5 text-sm font-bold text-neutral-80", className)}
      >
        {title}
      </div>
    )
  }

  const isSorted = column.getIsSorted()

  return (
    <div data-slot="column-header" className={cn("flex items-center -ml-3", className)}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 px-3 gap-2 hover:bg-neutral-5/20 text-sm font-bold transition-colors",
          isSorted ? "text-primary" : "text-neutral-80"
        )}
        onClick={() => column.toggleSorting()}
      >
        <span>{title}</span>
        <div className="flex flex-col">
           {isSorted === "asc" ? (
             <ArrowUp className="h-3.5 w-3.5" />
           ) : isSorted === "desc" ? (
             <ArrowDown className="h-3.5 w-3.5" />
           ) : (
             <ArrowDownUp className="h-3.5 w-3.5 opacity-20 group-hover:opacity-100" />
           )}
        </div>
      </Button>
    </div>
  )
}
