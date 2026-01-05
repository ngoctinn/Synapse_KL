"use client"

import { Edit, FolderPlus, MoreHorizontal, Trash } from "lucide-react"

import type { ResourceGroup } from "../model/schemas"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { ScrollArea } from "@/shared/ui/scroll-area"

interface ResourceGroupListProps {
  groups: ResourceGroup[]
  selectedId: string | null
  onSelect: (id: string) => void
  onEdit: (group: ResourceGroup) => void
  onDelete: (id: string) => void
  onCreate: () => void
}

export function ResourceGroupList({
  groups,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onCreate,
}: ResourceGroupListProps) {
  return (
    <div className="flex h-full flex-col border-r bg-background">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold tracking-tight">Nhóm tài nguyên</h2>
        <Button variant="ghost" size="icon" onClick={onCreate}>
          <FolderPlus className="h-5 w-5" />
          <span className="sr-only">Tạo nhóm mới</span>
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 p-4">
          {groups.length === 0 && (
            <div className="text-center text-sm text-muted-foreground p-4">
              Chưa có nhóm nào được tạo.
            </div>
          )}
          {groups.map((group) => (
            <div
              key={group.id}
              className={cn(
                "group flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                selectedId === group.id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
              onClick={() => onSelect(group.id)}
            >
              <div className="flex flex-col items-start gap-1 overflow-hidden">
                <span className="truncate">{group.name}</span>
                <span className="text-xs font-normal opacity-70">
                  {group.resource_count} thiết bị
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(group)}>
                    <Edit className="mr-2 h-4 w-4" /> Sửa tên
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    onClick={() => onDelete(group.id)}
                  >
                    <Trash className="mr-2 h-4 w-4" /> Xóa nhóm
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
