"use client";

import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/shared/ui/sheet";
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/shared/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
    AlertTriangle,
    Bell,
    CheckCircle2,
    ChevronRight,
    Info,
    Lock,
    Mail,
    Plus,
    Settings,
    Trash2
} from "lucide-react";
import { toast } from "sonner";

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-background p-8 md:p-16 space-y-16 max-w-7xl mx-auto">
      {/* Header */}
      <section className="space-y-4 border-b pb-8 border-primary/10">
        <h1 className="text-4xl font-bold tracking-tight text-primary flex items-center gap-3">
          Synapse Component Showcase
        </h1>
        <p className="text-muted-foreground text-lg">
          Dưới đây là toàn bộ hệ thống UI components của dự án Synapse, sử dụng Tailwind v4 và hệ màu OKLCH.
        </p>
      </section>

      {/* 1. Buttons */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-l-4 border-primary pl-4">Buttons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
              <CardDescription>Các biến thể màu sắc và kiểu dáng mặc định.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sizes & Icons</CardTitle>
              <CardDescription>Kích thước và việc tích hợp icon từ Lucide.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon"><Plus className="h-4 w-4" /></Button>
              <Button className="gap-2">
                <Settings className="h-4 w-4" /> Settings
              </Button>
              <Button variant="outline" className="gap-2">
                Tiếp tục <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 2. Typography & Cards */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-l-4 border-primary pl-4">Cards & Typography</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="shadow-lg shadow-primary/5 border-primary/10 overflow-hidden">
            <div className="h-2 bg-primary w-full" />
            <CardHeader>
              <CardTitle className="text-2xl">Premium Card</CardTitle>
              <CardDescription>Mô phỏng một thẻ chức năng quan trọng.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Card này sử dụng shadow nhẹ và border OKLCH để tạo cảm giác sang trọng.
                Nội dung bên trong được căn chỉnh theo chuẩn design system.
              </p>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t py-4">
              <Button variant="secondary" className="w-full">Chi tiết liệu trình</Button>
            </CardFooter>
          </Card>

          <div className="space-y-4">
            <h3 className="text-xl font-medium">Text Styles</h3>
            <div className="p-6 bg-muted/20 rounded-xl space-y-4 border border-dashed">
              <p className="text-sm font-medium text-primary uppercase tracking-widest">Small Label</p>
              <h4 className="text-3xl font-bold tracking-tight">Heading H4 High Impact</h4>
              <p className="text-foreground">Dòng văn bản mặc định (Body Text).</p>
              <p className="text-muted-foreground text-sm">Dòng văn bản phụ (Muted Text) dành cho mô tả ngắn.</p>
              <div className="flex gap-2">
                 <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold uppercase">Ready</span>
                 <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Inputs & Forms */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-l-4 border-primary pl-4">Forms</h2>
        <Card>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email-showcase">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="email-showcase" placeholder="name@example.com" className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-showcase">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="password-showcase" type="password" value="secret" className="pl-10" disabled />
              </div>
              <p className="text-xs text-muted-foreground italic">Trạng thái input đang bị disabled.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-destructive">Username (Error State)</Label>
              <Input placeholder="admin" className="border-destructive focus-visible:ring-destructive" />
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Tên đăng nhập không tồn tại.
              </p>
            </div>
            <div className="flex items-end">
              <Button className="w-full">Xác nhận thông tin</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 4. Tabs & Tables */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-l-4 border-primary pl-4">Navigation & Data</h2>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="history">Lịch sử ca làm</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <Card>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Invoice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">INV001</TableCell>
                  <TableCell><span className="text-green-600 font-medium">Paid</span></TableCell>
                  <TableCell>Nguyen Van A</TableCell>
                  <TableCell className="text-right">450.000đ</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">INV002</TableCell>
                  <TableCell><span className="text-amber-600 font-medium">Pending</span></TableCell>
                  <TableCell>Tran Thi B</TableCell>
                  <TableCell className="text-right">1.200.000đ</TableCell>
                </TableRow>
              </TableBody>
            </Card>
          </TabsContent>
          <TabsContent value="history">
            <div className="p-8 text-center text-muted-foreground bg-muted/10 border rounded-xl border-dashed">
               Không có dữ liệu lịch sử nào được tìm thấy.
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* 5. Overlay Components */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-l-4 border-primary pl-4">Overlays & Toasts</h2>
        <div className="flex flex-wrap gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Mở Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xác nhận xóa tài khoản?</DialogTitle>
                <DialogDescription>
                  Hành động này không thể hoàn tác. Mọi dữ liệu của bạn sẽ bị xóa vĩnh viễn khỏi hệ thống.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Hủy bỏ</Button>
                <Button variant="destructive" className="gap-2"><Trash2 className="h-4 w-4" /> Xóa ngay</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Cài đặt (Sheet)</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Cài đặt người dùng</SheetTitle>
                <SheetDescription>
                  Cập nhật các tùy chọn hiển thị và thông báo tại đây.
                </SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-4">
                <Button variant="ghost" className="w-full justify-start gap-3"><Bell className="h-4 w-4" /> Thông báo</Button>
                <Button variant="ghost" className="w-full justify-start gap-3"><Settings className="h-4 w-4" /> Tài khoản</Button>
              </div>
            </SheetContent>
          </Sheet>

          <Button
            variant="secondary"
            onClick={() => toast.success("Thao tác thành công!", {
              description: "Dữ liệu đã được cập nhật vào hệ thống Synapse.",
              icon: <CheckCircle2 className="h-4 w-4 text-green-500" />
            })}
          >
            Bắn Success Toast
          </Button>

          <Button
            variant="outline"
            onClick={() => toast.info("Thông tin mới", {
              description: "Có một bản cập nhật phần mềm mới sẵn sàng.",
              icon: <Info className="h-4 w-4 text-blue-500" />
            })}
          >
            Bắn Info Toast
          </Button>
        </div>
      </section>

      <footer className="pt-8 border-t border-primary/10 text-center">
        <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
          Design with <span className="text-primary font-bold">Synapse Design System</span> © 2026
        </p>
      </footer>
    </div>
  );
}
