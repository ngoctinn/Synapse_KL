"use client"

import {
    ChevronRight,
    Flower2
} from "lucide-react"

import { navigationConfig } from "@/shared/config/navigation"
import { cn } from "@/shared/lib/utils"
import { UserRole } from "@/shared/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/shared/ui/sidebar"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

interface AppSidebarProps {
  role?: UserRole
}

export function AppSidebar({ role = "manager" }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const config = navigationConfig[role]

  // Dev helper to switch roles
  const switchRole = (newRole: string) => {
    document.cookie = `user-role=${newRole}; path=/`
    router.refresh()
    router.push("/dashboard")
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      {/* 1. Header with Logo (24px Left Padding to align Icon) */}
      <SidebarHeader className="pt-9 pb-9 px-6 transition-all duration-300 flex-col items-start group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
        <Link href="/" className="flex items-center gap-2 transition-all">
          <Flower2 strokeWidth={1.5} className="w-6 h-6 shrink-0 text-sidebar-accent-foreground" style={{ width: '24px', height: '24px' }} />
          <span className="text-2xl font-bold tracking-tight text-foreground group-data-[collapsible=icon]:hidden">Synapse</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        <SidebarGroup className="py-0 px-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
              {config.sidebarNav.flatMap(group => group.items).map((item) => {
                const Icon = item.icon

                // Normal hóa path để so sánh chính xác tuyệt đối
                const currentPath = pathname.replace(/\/$/, "")
                const targetPath = item.href.replace(/\/$/, "")

                // Kiểm tra Dashboard Roots để tránh Active trùng lặp (ví dụ: Home vs Cardio)
                const isDashboardRoot = [
                  "/dashboard/manager",
                  "/dashboard/receptionist",
                  "/dashboard/technician",
                  "/dashboard/customer"
                ].includes(targetPath)

                const isActive = isDashboardRoot
                  ? currentPath === targetPath
                  : currentPath === targetPath || currentPath.startsWith(targetPath + "/")

                return (
                  <SidebarMenuItem key={item.title} className="flex justify-center w-full">
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "group/menu-item flex items-center h-12 rounded-xl transition-all w-full px-4 justify-start",
                        "group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Link href={item.href} className="flex items-center group-data-[collapsible=icon]:justify-center">
                        <Icon strokeWidth={1.5} style={{ width: '24px', height: '24px' }} className={cn(
                          "w-6 h-6 shrink-0 transition-colors",
                          isActive
                            ? "text-sidebar-accent-foreground"
                            : "text-muted-foreground group-hover/menu-item:text-sidebar-accent-foreground"
                        )} />
                        <span className="ml-2 text-[15px] font-medium group-data-[collapsible=icon]:hidden whitespace-nowrap">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
        <SidebarMenu className="group-data-[collapsible=icon]:items-center px-2 group-data-[collapsible=icon]:px-0">
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="w-full h-14 rounded-xl hover:bg-sidebar-accent/50 group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
            >
              <div className="flex items-center gap-2 w-full group-data-[collapsible=icon]:justify-center">
                <Avatar className="w-9 h-9 border border-sidebar-border shrink-0">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback className="bg-primary/10 text-primary">AD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start overflow-hidden group-data-[collapsible=icon]:hidden">
                  <span className="text-sm font-semibold text-foreground truncate w-full tracking-tight">Admin Synapse</span>
                  <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">{role}</span>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground/40 group-data-[collapsible=icon]:hidden" />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <div className="px-2 pt-4 group-data-[collapsible=icon]:hidden">
            <div className="flex flex-wrap gap-1 opacity-10 hover:opacity-100 transition-opacity">
              {["manager", "receptionist", "technician", "customer"].map((r) => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={cn(
                    "text-[8px] px-1 py-0.5 rounded border border-sidebar-border transition-colors",
                    role === r ? "bg-sidebar-primary text-sidebar-primary-foreground border-sidebar-primary" : "text-muted-foreground hover:bg-sidebar-accent"
                  )}
                >
                  {r[0].toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
