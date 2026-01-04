
import { Button } from '@/shared/ui/button';
import React from 'react';

export default function DeskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full flex-col">
      {/* WHY: Header gọn để dành tối đa không gian cho Booking Grid quan trọng bên dưới */}
      <header className="border-b p-2 flex justify-between items-center gap-4">
        <div className="font-bold">Lễ Tân</div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm">Đặt Nhanh (F1)</Button>
           <Button variant="outline" size="sm">Check-in (F2)</Button>
           <Button variant="outline" size="sm">Hàng Chờ</Button>
        </div>
        <Button variant="ghost" size="sm">Đăng Xuất</Button>
      </header>

      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
