import { OperationalSettingsView } from "@/features/settings"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cấu hình vận hành | Synapse Admin",
  description: "Quản lý giờ làm việc và ngày nghỉ",
}

export default function SettingsPage() {
  return <OperationalSettingsView />
}
