import { UserRole } from "@/shared/types"
import { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Trang điều hướng Dashboard theo vai trò người dùng',
}

/**
 * Dashboard Dispatcher
 * Điều phối người dùng về đúng Dashboard theo Role.
 * Server-side redirect để tránh flash nội dung không phù hợp với role.
 */
export default async function DashboardPage(): Promise<never> {
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
