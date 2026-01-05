"use client"

import { useFormContext } from "react-hook-form"
import { TimeSlotRow } from "./time-slot-row"

export function RegularHoursForm() {
    const { getValues, setValue } = useFormContext()

    const handleQuickCopy = (type: string) => {
        // WHY: Monday là index 1 (Source)
        const sourceSlots = getValues("days.1.slots")
        const sourceEnabled = getValues("days.1.isEnabled")

        // Define targets based on type
        // 0=Sun, 1=Mon, ..., 6=Sat
        let targetDays: number[] = []

        switch (type) {
            case "weekdays": // T3(2) -> T6(5)
                targetDays = [2, 3, 4, 5]
                break
            case "weekend": // T7(6), CN(0)
                targetDays = [6, 0]
                break
            case "all": // T3(2) -> T7(6) + CN(0)
                targetDays = [2, 3, 4, 5, 6, 0]
                break
        }

        targetDays.forEach(dayIndex => {
           setValue(`days.${dayIndex}.isEnabled`, sourceEnabled, { shouldDirty: true })
           setValue(`days.${dayIndex}.slots`, sourceSlots, { shouldDirty: true })
        })
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
                    onCopyToAll={dayIndex === 1 ? handleQuickCopy : undefined}
                />
            ))}
        </div>
    )
}
