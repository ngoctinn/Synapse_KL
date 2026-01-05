"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { Form } from "@/shared/ui/form"
import { Separator } from "@/shared/ui/separator"
import { Skeleton } from "@/shared/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { UnsavedChangesBar } from "@/shared/ui/unsaved-changes-bar"

import { toast } from "sonner"
import { getOperationalSettings, updateOperationalSettings } from "../api/actions"
import { operationalSettingsFormSchema, type OperationalSettingsFormValues } from "../model/schemas"
import { ExceptionDateForm } from "./exception-form-sheet"
import { RegularHoursForm } from "./regular-hours-form"

const defaultValues = {
    days: Array.from({ length: 7 }).map((_, i) => ({
        dayOfWeek: i,
        isEnabled: true,
        slots: [{ openTime: "08:00", closeTime: "20:00" }]
    })),
    exceptionDates: [] as Array<{
        date: Date
        reason?: string
        isClosed: boolean
        openTime?: string
        closeTime?: string
    }>
}

export function OperationalSettingsView() {
    const [isPending, startTransition] = useTransition()
    const [isLoading, setIsLoading] = useState(true)

    const form = useForm({
        resolver: zodResolver(operationalSettingsFormSchema),
        defaultValues,
        mode: "onChange"
    })

    const { isDirty } = form.formState

    // WHY: Load dữ liệu từ API khi component mount
    useEffect(() => {
        async function loadSettings() {
            const result = await getOperationalSettings()
            if (result.success) {
                form.reset(result.data)
            } else {
                toast.error(`Lỗi tải dữ liệu: ${result.error}`)
            }
            setIsLoading(false)
        }
        loadSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onSubmit = (data: OperationalSettingsFormValues) => {
        startTransition(async () => {
            const result = await updateOperationalSettings(data)
            if (result.success) {
                toast.success("Đã lưu cấu hình thành công")
                form.reset(result.data)
            } else {
                let errorMsg = result.error
                try {
                    // WHY: Backend trả về JSON string cho lỗi 422, parse để lấy message dễ đọc
                    const parsed = JSON.parse(result.error)
                    if (Array.isArray(parsed) && parsed[0]?.msg) {
                        errorMsg = parsed[0].msg.replace("Value error, ", "")
                    } else if (parsed.detail) {
                        errorMsg = parsed.detail
                    }
                } catch {
                    // Keep original string if not JSON
                }
                toast.error(`Lỗi: ${errorMsg}`)
            }
        })
    }

    const onInvalid = (errors: any) => {
        console.error("Validation errors:", JSON.stringify(errors, null, 2))

        // Flatten errors to find the first message
        const firstErrorKey = Object.keys(errors)[0]
        const firstErrorMsg = errors[firstErrorKey]?.message || "Vui lòng kiểm tra lại dữ liệu nhập"

        toast.error(`Có lỗi validation: ${firstErrorMsg}`, {
            description: "Xem chi tiết trong Console (F12) nếu cần thiết."
        })
    }

    const handleDiscard = () => {
        form.reset()
        toast.info("Đã hoàn tác các thay đổi")
    }

    const handleSave = () => {
        form.handleSubmit(onSubmit, onInvalid)()
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-72" />
                    </div>
                </div>
                <Skeleton className="h-px w-full" />
                <div className="space-y-4">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col space-y-6 pb-20">
            <div>
                <h3 className="text-lg font-medium">Cấu hình vận hành</h3>
                <p className="text-sm text-muted-foreground">
                    Quản lý giờ mở cửa và ngày nghỉ lễ của hệ thống.
                </p>
            </div>
            <Separator />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Tabs defaultValue="regular" className="w-full">
                        <TabsList>
                            <TabsTrigger value="regular">Giờ làm việc thường</TabsTrigger>
                            <TabsTrigger value="exceptions">Ngày nghỉ & Ngoại lệ</TabsTrigger>
                        </TabsList>
                        <TabsContent value="regular" className="mt-4">
                            <RegularHoursForm />
                        </TabsContent>
                        <TabsContent value="exceptions" className="mt-4">
                            <ExceptionDateForm />
                        </TabsContent>
                    </Tabs>
                </form>
            </Form>

            <UnsavedChangesBar
                isDirty={isDirty}
                isPending={isPending}
                onSave={handleSave}
                onDiscard={handleDiscard}
            />
        </div>
    )
}
