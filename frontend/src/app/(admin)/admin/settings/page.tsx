
import { Metadata } from "next"
import { OperationalSettingsView } from "./operational-settings-view"

export const metadata: Metadata = {
  title: "Cấu hình vận hành | Synapse Admin",
  description: "Quản lý giờ làm việc và ngày nghỉ",
}

export default function SettingsPage() {
  return <OperationalSettingsView />
}
