import { redirect } from "next/navigation"
import { UserRole } from "@/shared/types"
import { cookies } from "next/headers"

/**
 * Dashboard Dispatcher
 * Trang này đóng vai trò điều phối người dùng về đúng Dashboard theo Role của họ.
 * Thực hiện redirect tại Server Component để tránh flash nội dung không phù hợp.
 */
export default async function DashboardPage() {
  // Lấy role từ cookie
  const cookieStore = await cookies()
  const userRole = (cookieStore.get("user-role")?.value as UserRole) || "manager"

  const roleRoutes: Record<UserRole, string> = {
    manager: "/dashboard/manager",
    receptionist: "/dashboard/receptionist",
    technician: "/dashboard/technician",
    customer: "/dashboard/customer",
  }

  const targetPath = roleRoutes[userRole] || "/login"
  redirect(targetPath)
}
