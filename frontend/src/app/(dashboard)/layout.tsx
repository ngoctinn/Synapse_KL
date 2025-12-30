import { AppSidebar } from "@/shared/components/app-sidebar"
import { BottomNav } from "@/shared/components/bottom-nav"
import { UserRole } from "@/shared/types"
import { Separator } from "@/shared/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/shared/ui/sidebar"
import { ChevronRight } from "lucide-react"
import { cookies } from "next/headers"
import React from "react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Lấy role từ cookie (Server-side)
  const cookieStore = await cookies()
  const userRole = (cookieStore.get("user-role")?.value as UserRole) || "manager"

  const isCustomer = userRole === "customer"

  if (isCustomer) {
    return (
      <div className="flex min-h-svh flex-col bg-background">
        <main className="flex-1 pb-20 p-4">
          <div className="mx-auto max-w-md w-full">
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar role={userRole} />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Bảng điều khiển Quản trị</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Điều phối Hợp nhất</span>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 max-w-[1600px] w-full mx-auto">
          {/* Main content area */}
          <div className="rounded-xl border p-6 bg-card shadow-sm">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

