"use client"

import { navigationConfig } from "@/shared/config/navigation"
import { cn } from "@/shared/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function BottomNav() {
  const pathname = usePathname()
  // Lấy menu của customer từ config
  const customerNav = navigationConfig.customer.sidebarNav[0].items

  return (
    <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background px-4 pb-safe md:hidden">
      {customerNav.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors",
              isActive && "text-primary"
            )}
          >
            <Icon className="size-5" />
            <span className="text-[10px] font-medium">{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}
