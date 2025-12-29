import { AppSidebar } from "@/shared/components/app-sidebar"
import { Separator } from "@/shared/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/shared/ui/sidebar"
import { ChevronRight } from "lucide-react"
import React from "react"

/**
 * Dashboard Layout (Unified Console)
 * Quản lý việc hiển thị các Parallel Routes dựa trên Slot.
 */
export default function DashboardLayout({
  children,
  manager,
  receptionist,
  technician,
}: {
  children: React.ReactNode
  manager: React.ReactNode
  receptionist: React.ReactNode
  technician: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Admin Control Panel</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Unified Console</span>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 max-w-[1600px] w-full mx-auto">
          {/* Children thường là nội dung mặc định hoặc Dashboard tổng */}
          <div className="rounded-xl border p-6 bg-card shadow-sm">
            {children}
          </div>

          <div className="mt-8 grid gap-8 border-t pt-8">
            <div className="rounded-lg border p-4 bg-card shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Manager View Slot
              </h2>
              {manager}
            </div>

            <div className="rounded-lg border p-4 bg-card shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Receptionist View Slot
              </h2>
              {receptionist}
            </div>

            <div className="rounded-lg border p-4 bg-card shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Technician View Slot
              </h2>
              {technician}
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
