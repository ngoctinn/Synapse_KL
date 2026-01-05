"use client"

import { Clock, Edit, MoreHorizontal, Pause, Play, Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
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

import { formatDuration, formatPrice } from "@/shared/lib/format"
import { deleteService, toggleServiceStatus } from "../api/actions"
import type { Service } from "../model/schemas"

interface ServiceListProps {
  services: Service[]
  onEdit: (service: Service) => void
  onDelete: (id: string) => void
}

export function ServiceList({ services, onEdit, onDelete }: ServiceListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleDelete = () => {
    if (!selectedId) return

    startTransition(async () => {
      const result = await deleteService(selectedId)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
      setDeleteDialogOpen(false)
      setSelectedId(null)
    })
  }

  const handleToggleStatus = (id: string) => {
    startTransition(async () => {
      const result = await toggleServiceStatus(id)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  if (services.length === 0) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted-foreground">Chưa có dịch vụ nào được tạo.</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">Dịch vụ</TableHead>
              <TableHead>Chi phí & Thời gian</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[80px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow
                key={service.id}
                className="cursor-pointer"
                onClick={() => router.push(`/admin/services/${service.id}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 rounded-lg border">
                      <AvatarImage src={service.imageUrl ?? ""} alt={service.name} className="object-cover" />
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary uppercase">
                        {service.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-sm leading-none">{service.name}</span>
                      <span className="text-xs text-muted-foreground w-11/12 truncate" title={service.description ?? ""}>
                        {service.description ?? "Chưa có mô tả"}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{formatPrice(service.price)}</span>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {formatDuration(service.duration)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {service.isActive ? (
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                      Đang hoạt động
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Tạm ngưng</Badge>
                  )}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(service)}>
                        <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(service.id)}
                        disabled={isPending}
                      >
                        {service.isActive ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" /> Tạm ngưng
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" /> Kích hoạt
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        onClick={() => {
                          setSelectedId(service.id)
                          setDeleteDialogOpen(true)
                        }}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa dịch vụ</AlertDialogTitle>
            <AlertDialogDescription>
              Dịch vụ này sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending ? "Đang xóa..." : "Xóa dịch vụ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
