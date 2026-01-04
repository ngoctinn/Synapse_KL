"use client"

import {
    BarChart,
    Calendar,
    FileText,
    Home,
    Settings,
    Users
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/shared/ui/sidebar"

const items = [
  { title: "Tổng quan", url: "/admin", icon: Home },
  { title: "Lịch hẹn", url: "/admin/bookings", icon: Calendar },
  { title: "Nhân sự", url: "/admin/staff", icon: Users },
  { title: "Dịch vụ", url: "/admin/services", icon: FileText },
  { title: "Báo cáo", url: "/admin/reports", icon: BarChart },
  { title: "Cài đặt", url: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="h-16 flex items-center justify-center border-b font-bold text-xl">
        Synapse Admin
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t text-xs text-center text-muted-foreground">
        v2025.12
      </SidebarFooter>
    </Sidebar>
  )
}
