"use client"

import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react"

import {
  RESOURCE_STATUS_LABELS,
  ResourceStatus,
  type ResourceItem,
} from "../model/schemas"

import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"

interface ResourceListProps {
  resources: ResourceItem[]
  onEdit: (item: ResourceItem) => void
  onDelete: (id: string) => void
  onCreate: () => void
  isLoading?: boolean
}

function getStatusBadge(status: ResourceStatus) {
  switch (status) {
    case ResourceStatus.ACTIVE:
      return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">{RESOURCE_STATUS_LABELS[status]}</Badge>
    case ResourceStatus.MAINTENANCE:
      return <Badge variant="destructive" className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200">{RESOURCE_STATUS_LABELS[status]}</Badge>
    case ResourceStatus.INACTIVE:
      return <Badge variant="secondary">{RESOURCE_STATUS_LABELS[status]}</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function ResourceList({
  resources,
  onEdit,
  onDelete,
  onCreate,
  isLoading,
}: ResourceListProps) {
  if (resources.length === 0 && !isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <div className="text-muted-foreground">
          Chưa có thiết bị nào trong nhóm này.
        </div>
        <Button onClick={onCreate} disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm thiết bị đầu tiên
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên thiết bị</TableHead>
              <TableHead>Mã (Code)</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[80px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="font-mono text-xs">{item.code || "-"}</TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Edit className="mr-2 h-4 w-4" /> Sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        onClick={() => onDelete(item.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" /> Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
