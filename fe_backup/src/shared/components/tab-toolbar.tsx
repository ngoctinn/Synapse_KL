"use client"

import { SearchInput } from "@/shared/components/search-input"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { ListFilter, Plus } from "lucide-react"

interface TabToolbarProps {
  title?: string
  description?: string
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  searchValue?: string
  onFilterClick?: () => void
  actionLabel?: string
  onActionClick?: () => void
  children?: React.ReactNode
  className?: string
}

export function TabToolbar({
  title,
  description,
  searchPlaceholder = "Search...",
  onSearch,
  searchValue,
  onFilterClick,
  actionLabel,
  onActionClick,
  children,
  className,
}: TabToolbarProps) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4 md:mb-6 pt-4 md:pt-6", className)}>
      {/* Left side - Title & Description */}
      <div className="space-y-1">
        {title && (
          <h2>
            {title}
          </h2>
        )}
        {description && (
          <p className="text-sm text-muted-foreground m-0">
            {description}
          </p>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
        {/* Search Input */}
        {onSearch && (
          <div className="w-full sm:w-64 lg:w-72">
            <SearchInput
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              size="sm"
            />
          </div>
        )}

        {/* Actions Wrapper for Mobile alignment */}
        <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto justify-end">
            {/* Custom Children Slots (Date Picker, etc.) */}
            {children}

            {/* Filter Button */}
            {onFilterClick && (
            <Button variant="outline" size="sm" className="h-9 w-9 p-0 bg-background" onClick={onFilterClick}>
                <ListFilter className="h-4 w-4" />
            </Button>
            )}

            {/* Primary Action Button */}
            {actionLabel && onActionClick && (
            <Button onClick={onActionClick} className="shadow-sm grow sm:grow-0" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {actionLabel}
            </Button>
            )}
        </div>
      </div>
    </div>
  )
}
