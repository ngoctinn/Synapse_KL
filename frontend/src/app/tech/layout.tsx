
import { Button } from '@/shared/ui/button';
import React from 'react';

export default function TechLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col border">
      <header className="border-b p-4 flex justify-between">
        <div>Kỹ Thuật Viên</div>
        <div>Ca Sáng</div>
      </header>

      <main className="flex-1 p-4">
        {children}
      </main>

      <nav className="border-t p-4 flex justify-around">
        <Button variant="ghost">Lịch</Button>
        <Button variant="ghost">Hồ Sơ</Button>
        <Button variant="ghost">Cài Đặt</Button>
      </nav>
    </div>
  );
}
