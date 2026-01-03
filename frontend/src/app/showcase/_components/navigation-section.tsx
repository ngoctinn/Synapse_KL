"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

const data = [
  { id: "INV001", status: "Paid", person: "Nguyễn Văn A", amount: "450.000đ" },
  { id: "INV002", status: "Pending", person: "Trần Thị B", amount: "1.200.000đ" },
  { id: "INV003", status: "Unpaid", person: "Lê Văn C", amount: "300.000đ" },
  { id: "INV004", status: "Paid", person: "Phạm Minh D", amount: "800.000đ" },
];

export function NavigationSection() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold border-l-4 border-primary pl-4">Navigation & Data</h2>
      <div className="space-y-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="history">Lịch sử</TabsTrigger>
            <TabsTrigger value="settings">Cấu hình</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Danh sách hóa đơn</CardTitle>
                <CardDescription>Hiển thị các giao dịch gần đây của bạn.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Mã HD</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead className="text-right">Số tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>
                          <span className={`${
                            item.status === 'Paid' ? 'text-green-600' :
                            item.status === 'Pending' ? 'text-amber-600' : 'text-destructive'
                          } font-medium`}>
                            {item.status}
                          </span>
                        </TableCell>
                        <TableCell>{item.person}</TableCell>
                        <TableCell className="text-right">{item.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history">
            <div className="p-12 text-center text-muted-foreground bg-muted/10 border rounded-xl border-dashed">
              Chưa có lịch sử hoạt động được ghi lại.
            </div>
          </TabsContent>
          <TabsContent value="settings">
            <div className="p-12 text-center text-muted-foreground bg-muted/10 border rounded-xl border-dashed">
              Cài đặt hiển thị dữ liệu đang được cập nhật.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
