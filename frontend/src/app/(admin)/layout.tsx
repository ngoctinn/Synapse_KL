import { AdminSidebar } from "@/components/admin-sidebar"
import { Separator } from "@/shared/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/shared/ui/sidebar"
import { ReactNode } from "react"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="font-medium text-sm">Quản trị hệ thống</div>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
