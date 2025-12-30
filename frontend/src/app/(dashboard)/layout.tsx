import { AppSidebar } from "@/shared/components/app-sidebar"
import { BottomNav } from "@/shared/components/bottom-nav"
import { UserRole } from "@/shared/types"
import {
    SidebarInset,
    SidebarProvider
} from "@/shared/ui/sidebar"
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
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

