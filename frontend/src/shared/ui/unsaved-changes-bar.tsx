"use client"

import { RotateCcw, Save } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { Button } from "./button"

export interface UnsavedChangesBarProps {
    /** Trạng thái có thay đổi chưa lưu */
    isDirty: boolean
    /** Đang trong quá trình lưu */
    isPending?: boolean
    /** Callback khi nhấn Lưu */
    onSave: () => void
    /** Callback khi nhấn Hoàn tác */
    onDiscard: () => void
    /** Text hiển thị */
    message?: string
    /** Custom className */
    className?: string
}

// WHY: Component reusable cho mọi form cần tracking dirty state
export function UnsavedChangesBar({
    isDirty,
    isPending = false,
    onSave,
    onDiscard,
    message = "Có thay đổi chưa lưu",
    className,
}: UnsavedChangesBarProps) {
    return (
        <div
            role="alert"
            aria-live="polite"
            className={cn(
                "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
                "flex items-center gap-3 px-4 py-3 rounded-full",
                "border bg-background shadow-lg",
                "transition-all duration-300 ease-in-out",
                isDirty
                    ? "translate-y-0 opacity-100 scale-100"
                    : "translate-y-4 opacity-0 scale-95 pointer-events-none",
                className
            )}
        >
            <span className="text-sm text-muted-foreground whitespace-nowrap">
                {message}
            </span>
            <div className="h-4 w-px bg-border" />
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onDiscard}
                disabled={isPending}
            >
                <RotateCcw className="mr-1 h-4 w-4" />
                Hoàn tác
            </Button>
            <Button
                type="button"
                size="sm"
                onClick={onSave}
                disabled={isPending}
            >
                <Save className="mr-1 h-4 w-4" />
                {isPending ? "Đang lưu..." : "Lưu"}
            </Button>
        </div>
    )
}
