"use client"

import { Check, ChevronsUpDown, X } from "lucide-react"
import * as React from "react"

import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
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
            "w-full justify-between h-auto min-h-9 px-3 py-2 font-normal hover:bg-accent/20",
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
                      variant="secondary"
                      className="gap-1 rounded-sm py-0 h-6"
                    >
                      {option?.label}
                      <button
                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUnselect(value)
                          }
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onClick={() => handleUnselect(value)}
                      >
                        <X className="h-3 w-3 hover:text-destructive" />
                      </button>
                    </Badge>
                  )
                })}
                {selected.length > maxCount && (
                  <Badge variant="secondary" className="h-6">
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
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-sage-100 overflow-hidden shadow-xl" align="start">
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
                    className="flex items-center gap-2 px-2 py-1.5 cursor-pointer aria-selected:bg-accent/50"
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border border-input transition-colors",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-transparent"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-primary-foreground" />}
                    </div>
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
