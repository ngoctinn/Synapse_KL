"use client"

import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm font-medium">
            Đang tải dữ liệu bảng điều khiển...
        </p>
      </div>
    </div>
  )
}
