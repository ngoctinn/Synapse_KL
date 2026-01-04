import { Button } from '@/shared/ui/button';

export default function DeskPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <h2>Lưới Lập Lịch (Grid)</h2>
        <div>04/01/2026</div>
      </div>

      <div className="border p-4">
        <p>Không gian dành cho Scheduling Grid (Dự kiến: Timeline-based)</p>
        <div className="flex gap-4 mt-4">
          <Button variant="outline">Xem theo Nhân Viên</Button>
          <Button variant="outline">Xem theo Phòng</Button>
        </div>
      </div>
    </div>
  );
}
