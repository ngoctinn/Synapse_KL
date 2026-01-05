"use client"

import { ArrowLeft, Mail, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
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
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { deleteStaff } from "../api/actions"
import { STAFF_ROLE_LABELS, StaffProfile } from "../model/schemas"

interface StaffDetailHeaderProps {
  staff: StaffProfile
}

export function StaffDetailHeader({ staff }: StaffDetailHeaderProps) {
  const router = useRouter()

  const handleDelete = async () => {
    const result = await deleteStaff(staff.userId)
    if (result.success) {
      toast.success("Đã xóa nhân viên thành công")
      router.push("/admin/staff")
    } else {
      toast.error(result.message || "Không thể xóa nhân viên")
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/staff")}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/10">
              <AvatarImage src={staff.avatarUrl} alt={staff.fullName} />
              <AvatarFallback className="text-lg" style={{ backgroundColor: staff.colorCode, color: "white" }}>
                {staff.fullName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{staff.fullName}</h1>
                <Badge variant={staff.isActive ? "default" : "secondary"}>
                  {staff.isActive ? "Đang hoạt động" : "Tạm ngưng"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {staff.role ? STAFF_ROLE_LABELS[staff.role] : "Người dùng"} • {staff.title}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!staff.isActive && (
          <Button variant="outline" size="sm" className="gap-2">
            <Mail className="h-4 w-4" />
            Gửi lại lời mời
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Xóa nhân viên
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
              <AlertDialogDescription>
                Hành động này không thể hoàn tác. Nhân viên <strong>{staff.fullName}</strong> sẽ bị xóa khỏi hệ thống.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Xóa ngay
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
