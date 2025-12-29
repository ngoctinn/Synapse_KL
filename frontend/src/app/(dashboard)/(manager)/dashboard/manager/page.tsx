
export default function ManagerDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Bảng điều khiển Quản lý</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="text-sm font-medium text-muted-foreground">Doanh thu tháng</div>
            <div className="text-2xl font-bold">128.000.000đ</div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="text-sm font-medium text-muted-foreground">Nhân viên đang trực</div>
            <div className="text-2xl font-bold">12</div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="text-sm font-medium text-muted-foreground">Lịch hẹn mới</div>
            <div className="text-2xl font-bold">+24</div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="text-sm font-medium text-muted-foreground">Tỉ lệ hoàn thành</div>
            <div className="text-2xl font-bold">95%</div>
          </div>
        </div>
      </div>
    </div>
  )
}
