export default function ReceptionistDashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Bảng điều khiển Lễ tân</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Khách đang đợi</div>
          <div className="text-2xl font-bold">5</div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Lịch hẹn hôm nay</div>
          <div className="text-2xl font-bold">18</div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Phòng trống</div>
          <div className="text-2xl font-bold">3</div>
        </div>
      </div>
    </div>
  )
}
