"use client"

import { Button } from "@/shared/ui"
import { AlertTriangle } from "lucide-react"

export default function DashboardError({
  reset,
}: {
  reset: () => void
}) {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-8 text-center">
      <AlertTriangle className="h-10 w-10 text-warning" />
      <div className="space-y-1">
        <h3 className="font-semibold">Không thể tải nội dung</h3>
        <p className="text-sm text-muted-foreground">
          Đã có lỗi xảy ra khi tải dữ liệu trang Dashboard.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={() => reset()}>
        Thử tải lại
      </Button>
    </div>
  )
}
