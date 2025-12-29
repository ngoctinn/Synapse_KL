"use client"

import {
  LayoutDashboard,
} from "lucide-react"

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
import { navigationConfig } from "@/shared/config/navigation"
import { UserRole } from "@/shared/types"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/shared/lib/utils"

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
    <Sidebar className="border-r">
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LayoutDashboard className="size-5" />
          </div>
          Synapse
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {config.sidebarNav.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                        <Link href={item.href}>
                          <Icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Role Switcher (Development Only) */}
        <SidebarGroup className="mt-auto border-t">
          <SidebarGroupLabel>Dev Tools: Switch Role</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="grid grid-cols-2 gap-1 p-2">
              {["manager", "receptionist", "technician", "customer"].map((r) => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={cn(
                    "text-[10px] px-1 py-1 rounded border",
                    role === r ? "bg-primary text-white" : "hover:bg-muted"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
