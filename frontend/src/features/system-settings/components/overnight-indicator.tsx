"use client"

import { cn } from "@/shared/lib/utils"
import { AlertCircle } from "lucide-react"

interface OvernightIndicatorProps {
  className?: string
}

export function OvernightIndicator({ className }: OvernightIndicatorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 bg-amber-50/50 text-amber-600 border border-amber-200/60 px-2 py-0.5 rounded-full text-[10px] font-medium animate-in fade-in slide-in-from-top-1 duration-300",
        className
      )}
    >
      <AlertCircle className="h-3 w-3 stroke-[1.5]" />
      <span className="leading-none uppercase tracking-tight">Sáng hôm sau (+1)</span>
    </div>
  )
}
