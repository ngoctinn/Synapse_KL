"use client"

import { Column } from "@tanstack/react-table"
import {
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  EyeOff,
} from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"

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
    <div data-slot="column-header" className={cn("flex items-center gap-1", className)}>
      <span className="font-bold text-sm text-neutral-80 whitespace-nowrap">
        {title}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7"
          >
            {isSorted === "desc" ? (
              <ArrowDown className="h-3.5 w-3.5" />
            ) : isSorted === "asc" ? (
              <ArrowUp className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownUp className="h-3.5 w-3.5" />
            )}
            <span className="sr-only">Sắp xếp</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[160px] p-1 shadow-md border-border/40">
          <DropdownMenuItem
            onClick={() => column.toggleSorting(false)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <ArrowUp className="h-3.5 w-3.5 text-muted-foreground/70" />
            Tăng dần
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => column.toggleSorting(true)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <ArrowDown className="h-3.5 w-3.5 text-muted-foreground/70" />
            Giảm dần
          </DropdownMenuItem>
          <DropdownMenuSeparator className="opacity-50" />
          <DropdownMenuItem
            onClick={() => column.toggleVisibility(false)}
            className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
          >
            <EyeOff className="h-3.5 w-3.5 opacity-70" />
            Ẩn cột
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
