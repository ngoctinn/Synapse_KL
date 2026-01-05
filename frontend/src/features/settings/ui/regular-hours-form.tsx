"use client"

import { useFormContext } from "react-hook-form"
import { TimeSlotRow } from "./time-slot-row"

export function RegularHoursForm() {
    const { getValues, setValue } = useFormContext()

    const copyMondayToAll = () => {
        // WHY: Monday là index 1 trong mảng 0-6 (0=Sun)
        const mondaySlots = getValues("days.1.slots")
        const mondayEnabled = getValues("days.1.isEnabled")

        // Apply to Tue(2) to Fri(5)
        for (let i = 2; i <= 5; i++) {
           setValue(`days.${i}.isEnabled`, mondayEnabled, { shouldDirty: true })
           setValue(`days.${i}.slots`, mondaySlots, { shouldDirty: true })
        }
    }

    return (
        <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
                Cấu hình giờ mở cửa mặc định cho từng ngày trong tuần.
            </div>
            {/* 0 = Sunday, 1 = Monday, ... */}
            {[1, 2, 3, 4, 5, 6, 0].map((dayIndex) => (
                <TimeSlotRow
                    key={dayIndex}
                    dayIndex={dayIndex}
                    onCopyToAll={dayIndex === 1 ? copyMondayToAll : undefined}
                />
            ))}
        </div>
    )
}
