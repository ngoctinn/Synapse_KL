import { UserRole } from "@/shared/types"
import {
  CalendarDays,
  Clock,
  CreditCard,
  Home,
  Package,
  Settings,
  UserCircle,
  Users,
  Wrench
} from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon: any
}

export interface NavConfig {
  mainNav: NavItem[]
  sidebarNav: {
    title: string
    items: NavItem[]
  }[]
}

export const navigationConfig: Record<UserRole, NavConfig> = {
  manager: {
    mainNav: [],
    sidebarNav: [
      {
        title: "",
        items: [
          { title: "Trang chủ", href: "/dashboard/manager", icon: Home },
          { title: "Lịch hẹn", href: "/dashboard/manager/calendar", icon: CalendarDays },
          { title: "Khách hàng", href: "/dashboard/manager/patients", icon: Users },
          { title: "Báo cáo", href: "/dashboard/manager/reports", icon: CreditCard },
          { title: "Cài đặt", href: "/dashboard/manager/settings", icon: Settings },
        ],
      },
    ],
  },
  receptionist: {
    mainNav: [],
    sidebarNav: [
      {
        title: "Tiếp đón",
        items: [
          { title: "Bàn làm việc", href: "/dashboard/receptionist", icon: Home },
          { title: "Đặt lịch hẹn", href: "/dashboard/receptionist/appointments", icon: CalendarDays },
          { title: "Khách hàng", href: "/dashboard/receptionist/customers", icon: Users },
          { title: "Thanh toán", href: "/dashboard/receptionist/billing", icon: CreditCard },
        ],
      },
    ],
  },
  technician: {
    mainNav: [],
    sidebarNav: [
      {
        title: "Kỹ thuật",
        items: [
          { title: "Công việc của tôi", href: "/dashboard/technician", icon: Wrench },
          { title: "Lịch trình", href: "/dashboard/technician/schedule", icon: Clock },
          { title: "Kho vật tư", href: "/dashboard/technician/inventory", icon: Package },
        ],
      },
    ],
  },
  customer: {
    mainNav: [],
    sidebarNav: [
      {
        title: "Cá nhân",
        items: [
          { title: "Trang chính", href: "/dashboard/customer", icon: Home },
          { title: "Lịch hẹn của tôi", href: "/dashboard/customer/appointments", icon: CalendarDays },
          { title: "Hồ sơ", href: "/me", icon: UserCircle },
        ],
      },
    ],
  },
}
