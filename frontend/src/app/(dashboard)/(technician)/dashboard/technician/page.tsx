export default function TechnicianDashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Bảng điều khiển Kỹ thuật</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Công việc hiện tại</div>
          <div className="text-2xl font-bold">Bảo trì hệ thống A</div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Task chờ xử lý</div>
          <div className="text-2xl font-bold">4</div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Vật tư sắp hết</div>
          <div className="text-2xl font-bold">2</div>
        </div>
      </div>
    </div>
  )
}
