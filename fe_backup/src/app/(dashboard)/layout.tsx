import { AppSidebar } from "@/shared/components/app-sidebar"
import { BottomNav } from "@/shared/components/bottom-nav"
import { UserRole } from "@/shared/types"
import {
    SidebarInset,
    SidebarProvider
} from "@/shared/ui/sidebar"
import { Metadata } from "next"
import { cookies } from "next/headers"
import React from "react"

export const metadata: Metadata = {
  title: "Dashboard | Synapse",
  description: "Bảng điều khiển quản lý hệ thống Spa - Synapse CRM",
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.JSX.Element> {
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
      <SidebarInset className="bg-background min-w-0 overflow-x-hidden">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 max-w-[1600px] w-full mx-auto min-w-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

