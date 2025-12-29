"use client"

import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background/50 backdrop-blur-xs">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">
            Đang tải dữ liệu...
        </p>
      </div>
    </div>
  )
}
