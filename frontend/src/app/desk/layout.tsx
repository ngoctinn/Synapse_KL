import { Button } from '@/shared/ui/button';
import React from 'react';

export default function DeskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <header className="border-b p-4 flex justify-between">
        <div>Reception Desk</div>
        <div className="flex gap-4">
          <Button variant="outline">Tạo Booking</Button>
          <Button>Đăng Xuất</Button>
        </div>
      </header>

      <main className="p-4">
        {children}
      </main>
    </div>
  );
}
