"use client";

import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";

export function CardSection() {
  return (
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
          <h3 className="text-xl font-medium">Typography Styles</h3>
          <div className="p-6 bg-muted/20 rounded-xl space-y-4 border border-dashed">
            <div>
              <p className="text-sm font-medium text-primary uppercase tracking-widest mb-1">Small Label</p>
              <h4 className="text-3xl font-bold tracking-tight">Heading H4 High Impact</h4>
            </div>
            <p className="text-foreground">
              Dòng văn bản mặc định (Body Text). Sử dụng font-inter cho độ đọc tốt nhất.
            </p>
            <p className="text-muted-foreground text-sm">
              Dòng văn bản phụ (Muted Text) dành cho mô tả ngắn hoặc thông tin không quan trọng.
            </p>
            <div className="flex gap-2 pt-2">
               <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold uppercase border border-primary/20">Ready</span>
               <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase border border-amber-500/20">Pending</span>
               <span className="px-2 py-0.5 rounded bg-destructive/10 text-destructive text-xs font-bold uppercase border border-destructive/20">Error</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
