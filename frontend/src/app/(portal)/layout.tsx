import { PortalNav } from "@/components/portal-nav"
import { ReactNode } from "react"

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col w-full">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <PortalNav />
      </header>
      <main className="flex-1 w-full">
        {children}
      </main>
      <footer className="border-t bg-muted/50 py-12 text-center text-sm md:text-left">
        <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="font-bold text-lg mb-4">SYNAPSE</div>
            <p className="text-muted-foreground">Hệ thống quản lý Spa hiện đại.</p>
          </div>
          <div>
            <div className="font-bold mb-4">Khám phá</div>
            <div className="flex flex-col gap-2 text-muted-foreground">
              <a href="#">Dịch vụ</a>
              <a href="#">Bảng giá</a>
              <a href="#">Đội ngũ</a>
            </div>
          </div>
          <div>
            <div className="font-bold mb-4">Hỗ trợ</div>
            <div className="flex flex-col gap-2 text-muted-foreground">
              <a href="#">FAQ</a>
              <a href="#">Liên hệ</a>
              <a href="#">Điều khoản</a>
            </div>
          </div>
        </div>
        <div className="container mt-12 pt-8 border-t text-center text-muted-foreground">
          © 2026 Synapse Spa System. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
