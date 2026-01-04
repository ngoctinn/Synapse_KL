
import { Button } from '@/shared/ui/button';
import React from 'react';

export default function TechLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      {/* WHY: Giả lập viewport điện thoại/tablet vì KTV chủ yếu dùng thiết bị di động */}
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col border-x">
        <header className="border-b p-4 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="font-semibold">Ca Làm Việc</div>
          <Button variant="ghost" size="icon">🔔</Button>
        </header>

        <main className="flex-1 p-4">
          {children}
        </main>

        <nav className="border-t p-2 grid grid-cols-3 gap-1 bg-white sticky bottom-0">
          <Button variant="ghost">Trang Chủ</Button>
          <Button variant="ghost">Lịch Sử</Button>
          <Button variant="ghost">Cá Nhân</Button>
        </nav>
      </div>
    </div>
  );
}
