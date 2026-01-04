"use client"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/shared/ui/resizable"
import { ReactNode } from "react"

export default function DeskLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <header className="h-14 border-b flex items-center px-4 justify-between bg-card text-card-foreground shrink-0">
        <div className="font-bold text-lg">Reception Desk</div>
        <div className="flex gap-4 text-sm font-medium">
          <div className="cursor-pointer hover:underline">Đặt lịch</div>
          <div className="cursor-pointer hover:underline">Check-in</div>
          <div className="cursor-pointer hover:underline">Thanh toán</div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="hidden md:block bg-muted/20">
            <div className="h-full p-4 overflow-auto">
              {/* Queue / Waiting Area Placeholder */}
              <div className="font-semibold mb-4 text-sm text-foreground/70 uppercase">Hàng chờ & Yêu cầu</div>
              {/* This would be populated with waiting list later */}
              <div className="space-y-2">
                <div className="p-3 border rounded bg-background shadow-sm text-sm">
                  <div className="font-medium">Khách lẻ - 10:30</div>
                  <div className="text-xs text-muted-foreground">Check-in chờ</div>
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize={80}>
            <div className="h-full p-4 overflow-y-auto">
               {children}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  )
}
