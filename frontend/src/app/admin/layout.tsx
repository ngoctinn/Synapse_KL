import { AppSidebar } from '@/shared/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/shared/ui/sidebar';
import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="border-b flex gap-4 p-4">
          <SidebarTrigger />
          <div>Cổng Quản Lý</div>
        </header>
        <div className="flex-1 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
