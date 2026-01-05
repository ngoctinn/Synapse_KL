"use client"

import { Award, Bed, Calendar, Home, Settings, Sparkles, UserCircle, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/shared/ui/sidebar"

const items = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: Home,
  },
  {
    title: "Lịch làm việc",
    url: "/admin/schedule",
    icon: Calendar,
  },
  {
    title: "Nhân sự",
    url: "/admin/staff",
    icon: Users,
  },
  {
    title: "Khách hàng",
    url: "/admin/customers",
    icon: UserCircle,
  },
  {
    title: "Dịch vụ",
    url: "/admin/services",
    icon: Sparkles,
  },
  {
    title: "Tài nguyên",
    url: "/admin/resources",
    icon: Bed,
  },
  {
    title: "Kỹ năng",
    url: "/admin/skills",
    icon: Award,
  },
  {
    title: "Cài đặt",
    url: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Synapse Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = item.url === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.url)

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
