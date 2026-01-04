
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';

export default function PortalPage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="text-center py-12 flex flex-col gap-4 items-center border rounded-lg bg-gray-50">
        <h1 className="text-3xl font-bold">Thư Giãn & Tái Tạo</h1>
        <p className="text-gray-600 max-w-md">Trải nghiệm spa cao cấp dành riêng cho bạn.</p>
        <Button size="lg">Đặt Lịch Hẹn</Button>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <Card>
           <CardContent className="p-6">
             <div className="font-bold text-lg mb-2">Trị Liệu Massage</div>
             <p className="text-sm text-gray-500 mb-4">Thư giãn sâu cơ bắp.</p>
             <Button variant="outline" className="w-full">Xem Chi Tiết</Button>
           </CardContent>
        </Card>
        <Card>
           <CardContent className="p-6">
             <div className="font-bold text-lg mb-2">Chăm Sóc Da Mặt</div>
             <p className="text-sm text-gray-500 mb-4">Cấp ẩm và phục hồi.</p>
             <Button variant="outline" className="w-full">Xem Chi Tiết</Button>
           </CardContent>
        </Card>
        <Card>
           <CardContent className="p-6">
             <div className="font-bold text-lg mb-2">Tẩy Tế Bào Chết</div>
             <p className="text-sm text-gray-500 mb-4">Làm sạch và sáng da.</p>
             <Button variant="outline" className="w-full">Xem Chi Tiết</Button>
           </CardContent>
        </Card>
      </section>
    </div>
  );
}
