import { ReactNode } from "react"
import { UserRole } from "@/shared/types"

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: UserRole[]
  currentRole: UserRole
  fallback?: ReactNode
}

/**
 * RoleGuard Component
 * Sử dụng để ẩn/hiện nội dung dựa trên Role của người dùng.
 * Có thể dùng ở cả Server và Client Component.
 */
export function RoleGuard({
  children,
  allowedRoles,
  currentRole,
  fallback = null,
}: RoleGuardProps) {
  const hasAccess = allowedRoles.includes(currentRole)

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
