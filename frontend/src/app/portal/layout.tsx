import { Button } from '@/shared/ui/button';
import Link from 'next/link';
import React from 'react';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <header className="border-b p-4 flex justify-between">
        <div className="flex gap-4">
          <Link href="/portal">Portal</Link>
          <nav className="flex gap-4">
            <Link href="/portal/services">Dịch vụ</Link>
            <Link href="/portal/bookings">Lịch hẹn</Link>
          </nav>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost">Đăng nhập</Button>
          <Button>Đăng ký</Button>
        </div>
      </header>

      <main className="p-4">
        {children}
      </main>

      <footer className="border-t p-4 flex justify-between">
        <div>© 2025 Synapse Spa</div>
        <div className="flex gap-4">
          <Link href="/terms">Điều khoản</Link>
          <Link href="/privacy">Bảo mật</Link>
        </div>
      </footer>
    </div>
  );
}
