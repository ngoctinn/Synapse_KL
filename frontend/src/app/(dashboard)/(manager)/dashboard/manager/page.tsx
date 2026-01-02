import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Quản lý Dashboard',
  description: 'Bảng điều khiển dành cho Quản lý - Theo dõi doanh thu, nhân sự và lịch hẹn',
}

interface MetricCard {
  label: string
  value: string
}

const MOCK_METRICS: MetricCard[] = [
  { label: "Doanh thu tháng", value: "128.000.000đ" },
  { label: "Nhân viên đang trực", value: "12" },
  { label: "Lịch hẹn mới", value: "+24" },
  { label: "Tỉ lệ hoàn thành", value: "95%" },
]

import { SidebarTrigger } from "@/shared/ui/sidebar"

export default function ManagerDashboardPage(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4 px-1">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-2xl font-bold">Bảng điều khiển Quản lý</h1>
      </div>
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {MOCK_METRICS.map((metric) => (
            <div key={metric.label} className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="text-sm font-medium text-muted-foreground">{metric.label}</div>
              <div className="text-2xl font-bold">{metric.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
