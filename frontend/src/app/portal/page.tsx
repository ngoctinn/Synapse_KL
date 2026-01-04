import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export default function PortalPage() {
  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-4 p-4 border">
        <h1>Khám Phá Trải Nghiệm Spa Cao Cấp</h1>
        <p>Chào mừng bạn đến với Synapse, nơi sự thư giãn gặp gỡ công nghệ.</p>
        <div className="flex gap-4">
          <Button>Đặt Lịch Ngay</Button>
          <Button variant="outline">Tìm Hiểu Thêm</Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2>Dịch Vụ Của Chúng Tôi</h2>
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader className="border-b p-4">
              <CardTitle>Massage Thụy Điển</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p>Thư giãn hoàn toàn cơ bắp với kỹ thuật massage truyền thống.</p>
              <Button variant="link" className="p-0">Chi tiết</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b p-4">
              <CardTitle>Chăm Sóc Da Mặt</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p>Liệu trình chuyên sâu giúp làn da rạng rỡ và khỏe mạnh.</p>
              <Button variant="link" className="p-0">Chi tiết</Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
