
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';

export default function TechPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="font-medium text-sm text-gray-500">Lịch Sắp Tới</div>

      <Card>
        <CardContent className="p-4 flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="font-bold">10:00 Sáng</span>
            <Badge>Đã Xác Nhận</Badge>
          </div>
          <div>Khách: Alice Nguyen</div>
          <div className="text-sm text-gray-500">Massage Toàn Thân (60p)</div>
          <Button className="w-full mt-2" size="sm">Bắt Đầu</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex justify-between">
            <span className="font-bold">11:30 Sáng</span>
            <Badge variant="outline">Chờ Xử Lý</Badge>
          </div>
          <div>Khách: Bob Tran</div>
          <div className="text-sm text-gray-500">Chăm Sóc Da Mặt (45p)</div>
        </CardContent>
      </Card>
    </div>
  );
}
