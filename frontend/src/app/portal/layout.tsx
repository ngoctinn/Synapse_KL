
import { Button } from '@/shared/ui/button';
import React from 'react';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
       <header className="border-b p-4 flex justify-between items-center container mx-auto">
         <div className="font-bold text-lg">Synapse Spa</div>
         <nav className="hidden md:flex gap-4">
           <Button variant="link">Dịch Vụ</Button>
           <Button variant="link">Giới Thiệu</Button>
           <Button variant="link">Liên Hệ</Button>
         </nav>
         <div className="flex gap-2">
             <Button variant="ghost">Đăng Nhập</Button>
             <Button>Đặt Lịch Ngay</Button>
         </div>
       </header>

       <main className="flex-1 container mx-auto p-4 md:p-8">
         {children}
       </main>

       <footer className="border-t p-8 mt-8 bg-gray-50">
         <div className="container mx-auto text-center text-gray-500 text-sm">
           © 2026 Synapse Spa. Cổng thông tin khách hàng.
         </div>
       </footer>
    </div>
  );
}
