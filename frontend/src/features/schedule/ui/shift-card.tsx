import { cn } from "@/shared/lib/utils"
import { X } from "lucide-react"
import { StaffSchedule } from "../model/schemas"

interface ShiftCardProps {
  schedule: StaffSchedule
  onClick?: () => void
  onDelete?: (e: React.MouseEvent) => void
}

/**
 * WHY: Hiển thị một ca làm việc cụ thể trong Grid.
 * Dùng màu sắc để phân biệt giữa các loại ca (Sáng/Chiều/Tối).
 */
export function ShiftCard({ schedule, onClick, onDelete }: ShiftCardProps) {
  const { shift } = schedule
  if (!shift) return null

  // WHY: Chuyển đổi mã màu hex sang giá trị CSS hoặc dùng inline style
  const bgColor = shift.color_code || "#3b82f6" // Default blue-500

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex flex-col gap-1 rounded-md border p-2 text-xs transition-all hover:ring-2 hover:ring-primary cursor-pointer pr-5",
        "bg-opacity-10 border-opacity-30"
      )}
      style={{
        backgroundColor: `${bgColor}20`, // 20 - alpha (12%)
        borderColor: bgColor,
        borderLeftWidth: "4px"
      }}
    >
      <div className="font-bold truncate" style={{ color: bgColor }}>
        {shift.name}
      </div>
      <div className="text-muted-foreground">
        {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
      </div>

      {/* Delete Button */}
      {onDelete && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onDelete(e);
          }}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded-sm hover:bg-destructive/10 hover:text-destructive transition-opacity"
          title="Xóa ca này"
        >
          <X className="h-3 w-3" />
        </div>
      )}
    </div>
  )
}
