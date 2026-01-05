"use client"

import { MoreHorizontal, ShieldCheck, Trash } from "lucide-react"
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

import { deleteStaff } from "../api/actions"
import { StaffProfile, StaffRole } from "../model/schemas"

interface StaffListProps {
  staff: StaffProfile[]
}

function getInitials(name: string) {
  if (!name) return "S"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function RoleBadge({ role }: { role?: StaffRole }) {
  if (!role) return <Badge variant="outline">User</Badge>

  switch (role) {
    case StaffRole.MANAGER:
      return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200">Quản lý</Badge>
    case StaffRole.RECEPTIONIST:
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">Lễ tân</Badge>
    case StaffRole.TECHNICIAN:
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">KTV</Badge>
    default:
      return <Badge variant="outline">{role}</Badge>
  }
}

function ActiveStatus({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <div className="flex items-center text-sm text-green-600">
        <ShieldCheck className="mr-1 h-4 w-4" />
        Hoạt động
      </div>
    )
  }
  return (
    <div className="flex items-center text-sm text-muted-foreground">
      <ShieldCheck className="mr-1 h-4 w-4 text-gray-400" />
      Đã vô hiệu hóa
    </div>
  )
}


export function StaffList({ staff }: StaffListProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!deleteId) return

    startTransition(async () => {
      const result = await deleteStaff(deleteId)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
      setDeleteId(null)
    })
  }

  return (
    <>
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Chức danh</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[80px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Chưa có nhân viên nào. Hãy mời nhân viên đầu tiên!
                </TableCell>
              </TableRow>
            ) : (
              staff.map((item) => (
                <TableRow
                  key={item.userId}
                  className="cursor-pointer"
                  onClick={() => router.push(`/admin/staff/${item.userId}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={item.avatarUrl} alt={item.fullName} />
                        <AvatarFallback
                          style={{ backgroundColor: item.colorCode || "#6366F1", color: "white" }}
                        >
                          {getInitials(item.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{item.fullName}</span>
                        <span className="text-xs text-muted-foreground">{item.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><RoleBadge role={item.role} /></TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>
                    <ActiveStatus isActive={item.isActive} />
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
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/admin/staff/${item.userId}`)}>
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item.userId)}>
                          Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(item.userId)}
                        >
                          <Trash className="mr-2 h-4 w-4" /> Xóa nhân viên
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ vô hiệu hóa tài khoản của nhân viên. Họ sẽ không thể đăng nhập vào hệ thống nữa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Đang xóa..." : "Xóa nhân viên"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
