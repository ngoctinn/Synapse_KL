"use client"

import { SidebarTrigger } from "@/shared/ui/sidebar"
import { useRouter } from "next/navigation"

export default function CustomerDashboardPage() {
  const router = useRouter()

  const switchRole = (newRole: string) => {
    document.cookie = `user-role=${newRole}; path=/`
    router.refresh()
    router.push("/dashboard")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 px-1">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-2xl font-bold">Xin chào, Khách hàng</h1>
      </div>
      <div className="grid gap-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Lịch hẹn sắp tới</div>
          <div className="mt-2 text-lg font-semibold">Bảo trì định kỳ - 15:00, 30/12/2025</div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Điểm tích lũy</div>
          <div className="text-2xl font-bold text-primary">1.250 pts</div>
        </div>
      </div>

      {/* Dev Switcher for testing */}
      <div className="mt-10 border-t pt-4">
        <p className="text-xs text-muted-foreground mb-2 italic">Dev tool: Switch role</p>
        <div className="flex gap-2">
          {["manager", "receptionist", "technician"].map(r => (
            <button
              key={r}
              onClick={() => switchRole(r)}
              className="text-xs px-2 py-1 border rounded hover:bg-muted"
            >
              Back to {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
