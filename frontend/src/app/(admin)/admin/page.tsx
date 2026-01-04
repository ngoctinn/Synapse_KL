export default function AdminPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Tổng Quan Hệ Thống</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border p-4">
          <div>Doanh thu hôm nay</div>
        </div>
        <div className="border p-4">
          <div>Lượt đặt hẹn</div>
        </div>
        <div className="border p-4">
          <div>Nhân viên online</div>
        </div>
      </div>
    </div>
  )
}
