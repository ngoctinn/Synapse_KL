"use client"

import { Calendar, CheckSquare, User } from "lucide-react"

export function TechBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t flex items-center justify-around z-50 md:hidden pb-safe">
      <div className="flex flex-col items-center gap-1 p-2 text-primary">
        <Calendar className="h-6 w-6" />
        <span className="text-[10px] font-medium">Lịch</span>
      </div>
      <div className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
        <CheckSquare className="h-6 w-6" />
        <span className="text-[10px] font-medium">Công việc</span>
      </div>
      <div className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
        <User className="h-6 w-6" />
        <span className="text-[10px] font-medium">Cá nhân</span>
      </div>
    </nav>
  )
}
