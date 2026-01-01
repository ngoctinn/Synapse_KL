"use client"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Plus, Search } from "lucide-react"

interface TabToolbarProps {
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  actionLabel?: string
  onActionClick?: () => void
  className?: string
  children?: React.ReactNode
}

/**
 * Simpler toolbar for tab content.
 * Unlike PageHeader, this doesn't include title/subtitle (which belongs to page level).
 */
export function TabToolbar({
  searchPlaceholder = "Tìm kiếm...",
  onSearch,
  actionLabel,
  onActionClick,
  className,
  children,
}: TabToolbarProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 mb-4", className)}>
      {/* Left side - Search */}
      <div className="flex items-center gap-3">
        {onSearch && (
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              className="pl-9"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        )}
        {children}
      </div>

      {/* Right side - Action Button */}
      {actionLabel && onActionClick && (
        <Button onClick={onActionClick} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>{actionLabel}</span>
        </Button>
      )}
    </div>
  )
}
