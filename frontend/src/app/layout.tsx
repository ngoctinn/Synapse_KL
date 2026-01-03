import { Toaster } from "@/shared/ui/sonner";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Synapse - Hệ thống CRM & Quản lý Spa",
  description: "Hiện đại hóa Spa, tối ưu hóa lập lịch (Scheduling) và cá nhân hóa trải nghiệm.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="antialiased">
      <body className={`${inter.variable} font-sans selection:bg-primary/10`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
