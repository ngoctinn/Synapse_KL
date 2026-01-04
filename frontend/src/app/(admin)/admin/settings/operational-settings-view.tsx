"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm } from "react-hook-form"

import { Button } from "@/shared/ui/button"
import { Form } from "@/shared/ui/form"
import { Separator } from "@/shared/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"

import { toast } from "sonner"
import { ExceptionDateForm } from "./exception-form-sheet"
import { RegularHoursForm } from "./regular-hours-tab"
import { regularHoursFormSchema } from "./schemas"

// Default initial data structure
const defaultValues = {
    days: Array.from({ length: 7 }).map((_, i) => ({
        dayOfWeek: i,
        isEnabled: true,
        slots: [{ openTime: "08:00", closeTime: "20:00" }]
    })),
    exceptionDates: []
}

export function OperationalSettingsView() {
    const form = useForm({
        resolver: zodResolver(regularHoursFormSchema), // TODO: Combine validation schemas properly or separate forms
        defaultValues
    })

    const onSubmit = (data: any) => {
        console.log("Submitting settings:", data)
        toast.success("Đã lưu cấu hình (Simulated)")
        // TODO: Call Server Action to update backend
    }

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Cấu hình vận hành</h3>
                    <p className="text-sm text-muted-foreground">
                        Quản lý giờ mở cửa và ngày nghỉ lễ của hệ thống.
                    </p>
                </div>
                <Button onClick={form.handleSubmit(onSubmit)}>Lưu thay đổi</Button>
            </div>
            <Separator />

            <FormProvider {...form}>
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
            </FormProvider>
        </div>
    )
}
