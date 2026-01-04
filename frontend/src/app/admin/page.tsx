import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1>Tổng Quan</h1>

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="border-b p-4">
            <CardTitle>Doanh Thu</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div>128.000.000đ</div>
            <p>+20% so với tháng trước</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b p-4">
            <CardTitle>Lượt Booking</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div>+450</div>
            <p>+12% so với tháng trước</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b p-4">
            <CardTitle>Khách Hàng Mới</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div>+24</div>
            <p>+18% so với tuần trước</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b p-4">
            <CardTitle>Đánh Giá</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div>4.8/5.0</div>
            <p>98% hài lòng</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
