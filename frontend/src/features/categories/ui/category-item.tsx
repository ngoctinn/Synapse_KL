"use client"

import { DraggableProvided } from "@hello-pangea/dnd"
import { GripVertical, MoreHorizontal, Pencil, Trash } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"

import { Category } from "../model/schemas"

interface CategoryItemProps {
  category: Category
  isSelected: boolean
  isDragging: boolean
  provided: DraggableProvided
  onSelect: (id: string) => void
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
}

export function CategoryItem({
  category,
  isSelected,
  isDragging,
  provided,
  onSelect,
  onEdit,
  onDelete,
}: CategoryItemProps) {
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={cn(
        "group flex items-center justify-between rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
        isSelected && "bg-accent text-accent-foreground",
        isDragging && "opacity-50 ring-2 ring-primary"
      )}
    >
      <div
        className="flex flex-1 items-center gap-2 cursor-pointer"
        onClick={() => onSelect(category.id)}
      >
        <div
          {...provided.dragHandleProps}
          className="text-muted-foreground/50 hover:text-foreground cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <span className="font-medium truncate">{category.name}</span>
        {category.service_count !== undefined && category.service_count > 0 && (
          <Badge
            variant="secondary"
            className="ml-auto text-xs px-1.5 h-5 min-w-[20px] justify-center"
          >
            {category.service_count}
          </Badge>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(category)}>
            <Pencil className="mr-2 h-3 w-3" /> Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete(category.id)}
          >
            <Trash className="mr-2 h-3 w-3" /> Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
