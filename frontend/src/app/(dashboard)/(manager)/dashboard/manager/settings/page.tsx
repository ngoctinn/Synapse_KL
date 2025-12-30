import { getOperationalSettingsAction } from "@/features/system-settings/actions";
import { OperationalSettings } from "@/features/system-settings/components/operational-settings";

// Chuyển về mô hình Async Server Component chuẩn của Next.js
// Next.js sẽ TỰ ĐỘNG kích hoạt file loading.tsx khi component này đang 'await' data
export default async function SettingsPage() {
  // Fetch dữ liệu từ server block render
  // Trong thời gian chờ này, loading.tsx sẽ được hiển thị
  const initialData = await getOperationalSettingsAction().catch(() => null);

  return (
    <div className="flex flex-col gap-8">
      <OperationalSettings initialData={initialData} />
    </div>
  )
}
