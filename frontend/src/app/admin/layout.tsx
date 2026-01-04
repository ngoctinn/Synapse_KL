
import { Button } from '@/shared/ui/button';
import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full">
      <aside className="w-64 border-r p-4 flex flex-col gap-4">
        <div className="font-bold">Quản Trị Viên</div>
        <nav className="flex flex-col gap-2">
          <Button variant="ghost" className="justify-start">Tổng Quan</Button>
          <Button variant="ghost" className="justify-start">Nhân Viên</Button>
          <Button variant="ghost" className="justify-start">Dịch Vụ</Button>
          <Button variant="ghost" className="justify-start">Cấu Hình</Button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="border-b p-4 flex justify-between items-center">
          <div>Cổng Quản Lý</div>
          <Button variant="outline">Đăng Xuất</Button>
        </header>
        <div className="flex-1 p-4 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
