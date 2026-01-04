import { TechBottomNav } from "@/components/tech-bottom-nav"
import { ReactNode } from "react"

export default function TechLayout({ children }: { children: ReactNode }) {
  // Mobile-first layout: content fills screen, bottom nav fixed
  return (
    <div className="flex min-h-screen flex-col w-full bg-muted/10">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur px-4 h-14 flex items-center justify-between">
        <div className="font-semibold">Kỹ Thuật Viên</div>
        <div className="text-sm text-muted-foreground">Synapse</div>
      </header>

      <main className="flex-1 p-4 pb-20">
        {children}
      </main>

      <TechBottomNav />
    </div>
  )
}
