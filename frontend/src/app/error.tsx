"use client"

import { Button } from "@/shared/ui"
import { AlertCircle, RefreshCcw } from "lucide-react"
import * as React from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    // Log lỗi ra hệ thống monitoring nếu có
    console.error("Next.js Error Boundary:", error)
  }, [error])

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 p-4 text-center">
      <div className="bg-destructive/10 p-4 rounded-full">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Đã có lỗi xảy ra!</h2>
        <p className="text-muted-foreground max-w-[400px]">
          Rất tiếc, hệ thống gặp sự cố không mong muốn. Vui lòng thử lại hoặc liên hệ quản trị viên.
        </p>
      </div>
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="gap-2"
        >
          Tải lại trang
        </Button>
        <Button onClick={() => reset()} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Thử lại ngay
        </Button>
      </div>
    </div>
  )
}
