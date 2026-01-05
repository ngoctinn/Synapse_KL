import { UserCircle } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Khách hàng | Synapse Admin",
  description: "Quản lý thông tin khách hàng",
}

export default function CustomersPage() {
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Khách hàng</h2>
          <p className="text-muted-foreground">
            Quản lý thông tin và hồ sơ khách hàng.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed">
        <div className="flex flex-col items-center gap-2 text-center">
          <UserCircle className="h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Đang phát triển</h3>
          <p className="text-sm text-muted-foreground">
            Tính năng quản lý khách hàng sẽ sớm được triển khai.
          </p>
        </div>
      </div>
    </div>
  )
}
