
import { Button } from '@/shared/ui/button';

export default function DeskPage() {
  return (
    <div className="h-full w-full flex flex-col">
      <div className="border-b p-2 flex justify-between bg-muted/20">
        <div>Ngày: Hôm nay</div>
        <div>Xem: Ngày | Tuần</div>
      </div>

      <div className="flex-1 grid place-items-center">
         <div className="flex flex-col items-center gap-4">
            <div>Khu Vực Lịch Điều Phối</div>
            <Button>Mở Form Đặt Lịch</Button>
         </div>
      </div>
    </div>
  );
}
