"use client"

import { navigationConfig } from "@/shared/config/navigation"
import { UserRole } from "@/shared/types"
import { usePathname } from "next/navigation"

export function DashboardHeaderTitle() {
  const pathname = usePathname()

  // Extract role and find matching item
  const segments = pathname.split("/")
  // [ "", "dashboard", "manager", ... ]
  const role = segments[2] as UserRole

  if (!role || !navigationConfig[role]) return null

  const config = navigationConfig[role]

  // Flatten items to find match
  const allItems = config.sidebarNav.flatMap(group => group.items)
  const currentItem = allItems.find(item => item.href === pathname)

  if (!currentItem) return null

  const title = currentItem.title === "Cài đặt" ? "Cấu hình vận hành" : currentItem.title

  return (
    <div className="flex items-center gap-2 px-2">
      <h1 className="font-semibold text-lg text-foreground">{title}</h1>
    </div>
  )
}
