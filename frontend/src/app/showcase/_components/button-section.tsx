"use client";

import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { ChevronRight, Loader2, Plus, Settings } from "lucide-react";

export function ButtonSection() {
  return (
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
            <CardTitle>Sizes & States</CardTitle>
            <CardDescription>Kích thước, trạng thái loading và tích hợp icon.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon"><Plus className="h-4 w-4" /></Button>
            <Button disabled>Disabled</Button>
            <Button className="gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading
            </Button>
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
  );
}
