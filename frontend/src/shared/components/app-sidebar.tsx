"use client"

import {
  LayoutDashboard,
} from "lucide-react"

import { navigationConfig } from "@/shared/config/navigation"
import { cn } from "@/shared/lib/utils"
import { UserRole } from "@/shared/types"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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

  // Hàm chuyển role nhanh để test (Chỉ dùng trong quá trình dev)
  const switchRole = (newRole: string) => {
    document.cookie = `user-role=${newRole}; path=/`
    router.refresh()
    router.push("/dashboard")
  }

  return (
    <Sidebar collapsible="icon" className="border-r bg-white">
      <SidebarHeader className="pt-9 pb-4 px-6 group-data-[collapsible=icon]:p-2">
        <Link href="/" className="flex items-center gap-3 font-bold text-primary text-2xl group-data-[collapsible=icon]:justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0">
            <LayoutDashboard className="size-6" />
          </div>
          <span className="group-data-[collapsible=icon]:hidden tracking-tight">Synapse</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="mt-4">
        {config.sidebarNav.map((group) => (
          <SidebarGroup key={group.title} className="py-0 px-0">
            {group.title && group.title !== "Main" && (
              <SidebarGroupLabel className="px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground/40 mt-6 mb-2">
                {group.title}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-0">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={cn(
                          "px-6 rounded-lg transition-all mx-2 w-auto h-12",
                          isActive && "bg-accent text-primary font-semibold shadow-sm"
                        )}
                      >
                        <Link href={item.href} className="flex items-center gap-4">
                          <Icon className={cn("size-6", isActive ? "text-primary" : "text-muted-foreground/70")} />
                          <span className="group-data-[collapsible=icon]:hidden text-[15px]">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Role Switcher - Subtle */}
        <div className="mt-auto px-6 py-4 opacity-5 hover:opacity-100 transition-opacity group-data-[collapsible=icon]:hidden">
          <p className="text-[10px] text-muted-foreground mb-1 uppercase font-bold">Dev Mode</p>
          <div className="flex gap-1">
            {["manager", "receptionist", "technician", "customer"].map((r) => (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className={cn(
                  "text-[8px] px-1 py-0.5 rounded border",
                  role === r ? "bg-primary text-white" : "hover:bg-muted"
                )}
              >
                {r[0]}
              </button>
            ))}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
