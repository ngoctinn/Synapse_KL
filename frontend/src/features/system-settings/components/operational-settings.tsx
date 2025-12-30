"use client"

import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import * as React from "react"
import { toast } from "sonner"
import { getOperationalSettingsAction, updateOperationalSettingsAction } from "../actions"
import { ExceptionDate, OperatingHour, OperationalSettings as OperationalSettingsType } from "../types"
import { ExceptionDatesManager } from "./exception-dates-manager"
import { OperatingHoursForm } from "./operating-hours-form"

export function OperationalSettings() {
  const [settings, setSettings] = React.useState<OperationalSettingsType | null>(null);
  const [originalSettings, setOriginalSettings] = React.useState<OperationalSettingsType | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    getOperationalSettingsAction()
      .then((data) => {
        setSettings(data);
        setOriginalSettings(data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const isDirty = React.useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(originalSettings);
  }, [settings, originalSettings]);

  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleOperatingHoursChange = (hours: OperatingHour[]) => {
    if (!settings) return;
    setSettings({
      ...settings,
      regular_operating_hours: hours
    });
  };

  const handleExceptionDatesChange = (exceptionDates: ExceptionDate[]) => {
    if (!settings) return;
    setSettings({
      ...settings,
      exception_dates: exceptionDates
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const response = await updateOperationalSettingsAction(settings);
      if (response.success) {
        setOriginalSettings(response.data);
        toast.success("Đã lưu tất cả thay đổi cấu hình");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi lưu cài đặt");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(originalSettings);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Đang tải cấu hình...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cấu hình vận hành</h2>
          <p className="text-muted-foreground">
            Quản lý giờ làm việc và các ngày nghỉ lễ của Spa.
          </p>
        </div>
        {isDirty && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
            <Button variant="ghost" onClick={handleReset} disabled={isSaving}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="regular" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="regular">Giờ định kỳ</TabsTrigger>
          <TabsTrigger value="exceptions">Ngày ngoại lệ</TabsTrigger>
        </TabsList>

        <TabsContent value="regular" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Giờ làm việc hàng tuần</CardTitle>
              <CardDescription>
                Thiết lập khung giờ mở cửa và đóng cửa mặc định cho từng ngày trong tuần.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OperatingHoursForm
                data={settings?.regular_operating_hours}
                onChange={handleOperatingHoursChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exceptions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Ngày nghỉ lễ & Ngoại lệ</CardTitle>
              <CardDescription>
                Quản lý các ngày Spa đóng cửa hoặc thay đổi giờ làm việc (Tết, lễ hội, sửa chữa...).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ExceptionDatesManager
                initialData={settings?.exception_dates}
                regularHours={settings?.regular_operating_hours}
                onChange={handleExceptionDatesChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
