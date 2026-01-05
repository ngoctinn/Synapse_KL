import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Lịch làm việc | Synapse Admin",
  description: "Quản lý ca làm việc và phân công nhân viên",
}

import { ScheduleView } from "@/features/schedule/ui/schedule-view"

export default function SchedulePage() {
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <ScheduleView />
    </div>
  )
}

