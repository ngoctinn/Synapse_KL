import { Button } from "@/shared/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { ArrowRight, Calendar, LayoutDashboard, Sparkles, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm flex mb-12">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter text-primary">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          Synapse
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Đăng nhập</Link>
          </Button>
          <Button asChild className="shadow-lg shadow-primary/20">
            <Link href="/portal/booking">Đặt lịch ngay</Link>
          </Button>
        </div>
      </div>

      <div className="relative flex flex-col items-center text-center space-y-8 max-w-3xl mb-16">
        <div className="absolute -z-10 top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/20 blur-[120px] rounded-full opacity-20" />

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
          Hiện đại hóa <span className="text-primary italic">Spa</span> của bạn
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed">
          Hệ thống CRM thông minh tích hợp lập lịch tối ưu hóa. Tăng hiệu suất,
          giảm thời gian trống và nâng tầm trải nghiệm khách hàng.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Button size="lg" className="rounded-full px-8 h-12 text-base shadow-xl shadow-primary/25 transition-all hover:scale-105" asChild>
            <Link href="/admin">
              Bắt đầu ngay <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base bg-background/50 backdrop-blur-sm border-primary/20 hover:bg-primary/5 transition-all" asChild>
            <Link href="/docs">Tìm hiểu thêm</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <Card className="bg-background/40 backdrop-blur-md border-primary/10 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <CardHeader>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Lập lịch thông minh</CardTitle>
            <CardDescription>Tự động tối ưu hóa ca làm việc và tài nguyên.</CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-background/40 backdrop-blur-md border-primary/10 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <CardHeader>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Quản lý khách hàng</CardTitle>
            <CardDescription>Cá nhân hóa trải nghiệm và theo dõi liệu trình.</CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-background/40 backdrop-blur-md border-primary/10 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <CardHeader>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <LayoutDashboard className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Báo cáo chuyên sâu</CardTitle>
            <CardDescription>Theo dõi doanh thu và hiệu suất thời gian thực.</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <footer className="mt-24 text-muted-foreground text-sm font-medium">
        © 2026 Synapse KL. Built for excellence.
      </footer>
    </main>
  );
}
