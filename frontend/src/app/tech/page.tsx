
import { Card, CardContent } from '@/shared/ui/card';

export default function TechPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between border-b">
        <h2>Lịch Hôm Nay</h2>
        <div>04/01/2026</div>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between">
              <div>09:00 - 10:30</div>
              <div>ĐANG CHỜ</div>
            </div>
            <div>Khách: Nguyễn Văn A</div>
            <p>Dịch vụ: Massage Thụy Điển</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between">
              <div>11:00 - 12:00</div>
              <div>ĐANG THỰC HIỆN</div>
            </div>
            <div>Khách: Lê Thị B</div>
            <p>Dịch vụ: Chăm Sóc Da Mặt</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
