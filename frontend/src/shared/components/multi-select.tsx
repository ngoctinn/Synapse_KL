"use client"

import { ChevronsUpDown, X } from "lucide-react"
import * as React from "react"

import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Checkbox } from "@/shared/ui/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover"

export interface Option {
  label: string
  value: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  emptyText?: string
  className?: string
  maxCount?: number
}

/**
 * MultiSelect - Bộ chọn nhiều mục với tính năng tìm kiếm.
 * Tối ưu cho việc chọn nhiều đối tượng trong quản lý.
 */
export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Chọn các mục...",
  emptyText = "Không tìm thấy kết quả.",
  className,
  maxCount = 3,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleUnselect = (value: string) => {
    onChange(selected.filter((s) => s !== value))
  }

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      handleUnselect(value)
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-auto min-h-11 px-4 py-1 font-normal",
            className
          )}
        >
          <div className="flex flex-wrap gap-1 items-center overflow-hidden">
            {selected.length > 0 ? (
              <>
                {selected.slice(0, maxCount).map((value) => {
                  const option = options.find((o) => o.value === value)
                  return (
                    <Badge
                      key={value}
                      variant="default"
                      className="gap-0 rounded-md p-0 h-8 bg-primary/10 text-primary border-0 font-medium overflow-hidden"
                    >
                      <span className="px-2 py-0.5">{option?.label}</span>
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label={`Xóa ${option?.label}`}
                        className="flex items-center justify-center min-h-6 min-w-6 px-1 border-l border-primary/10 hover:bg-primary/20 transition-colors focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer group"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            e.stopPropagation()
                            handleUnselect(value)
                          }
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleUnselect(value)
                        }}
                      >
                        <X className="h-4 w-4 text-primary/70 group-hover:text-primary" />
                      </span>
                    </Badge>
                  )
                })}
                {selected.length > maxCount && (
                  <Badge variant="default" className="h-7 bg-primary/10 text-primary border-0 font-medium">
                    +{selected.length - maxCount} mục khác
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-border overflow-hidden shadow-xl" align="start">
        <Command className="w-full">
          <CommandInput placeholder="Tìm kiếm..." className="h-9 border-none focus:ring-0" />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto p-1">
              {options.map((option) => {
                const isSelected = selected.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="flex items-center gap-2 px-2 py-1.5 cursor-pointer aria-selected:bg-accent"
                  >
                    <Checkbox checked={isSelected} onCheckedChange={() => handleSelect(option.value)} />
                    <span>{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
