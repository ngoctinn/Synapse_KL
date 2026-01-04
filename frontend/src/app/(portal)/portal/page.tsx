export default function PortalPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Xin chào, Khách hàng</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border p-4 flex flex-col gap-2">
          <div className="font-bold">Đặt lịch mới</div>
          <button className="border p-2">Đặt ngay</button>
        </div>
        <div className="border p-4">
          <div className="font-bold">Lịch hẹn sắp tới</div>
          <div className="mt-2 text-sm text-gray-500">Chưa có lịch hẹn</div>
        </div>
      </div>
    </div>
  )
}
