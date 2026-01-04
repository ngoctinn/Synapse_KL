import { cn } from "@/shared/lib/utils";
import { Toaster } from "@/shared/ui/sonner";
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="vi" suppressHydrationWarning className={cn("antialiased", outfit.variable)}>
      <body className={`${inter.variable} font-sans`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
