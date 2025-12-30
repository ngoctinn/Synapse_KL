"use client"

import { Button } from "@/shared/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import * as React from "react"
import { toast } from "sonner"
import { getOperationalSettingsAction, updateOperationalSettingsAction } from "../actions"
import { ExceptionDate, OperatingHour, OperationalSettings as OperationalSettingsType } from "../types"
import { ExceptionDatesManager } from "./exception-dates-manager"
import { OperatingHoursForm } from "./operating-hours-form"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog"

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

  const handleOperatingHoursChange = React.useCallback((hours: OperatingHour[]) => {
    setSettings(prev => {
      if (!prev) return null;
      if (JSON.stringify(prev.regular_operating_hours) === JSON.stringify(hours)) return prev;
      return { ...prev, regular_operating_hours: hours };
    });
  }, []);

  const handleExceptionDatesChange = React.useCallback((exceptionDates: ExceptionDate[]) => {
    setSettings(prev => {
      if (!prev) return null;
      if (JSON.stringify(prev.exception_dates) === JSON.stringify(exceptionDates)) return prev;
      return { ...prev, exception_dates: exceptionDates };
    });
  }, []);

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
    if (originalSettings) {
      setSettings(originalSettings);
    }
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
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4">
            <div className="hidden items-center gap-2 md:flex">
              <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              <p className="text-sm font-medium text-orange-600">Bạn có thay đổi chưa lưu</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={handleReset} disabled={isSaving}>
                Hủy
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={isSaving} className="shadow-md">
                    {isSaving ? "Đang lưu..." : "Lưu cài đặt"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận thay đổi?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Việc thay đổi giờ hoạt động có thể ảnh hưởng đến các lịch hẹn đã được đặt trước đó. Hệ thống sẽ áp dụng giờ mới cho tất cả các ngày liên quan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Kiểm tra lại</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSave}>
                      Tiếp tục lưu
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </div>

      <Tabs defaultValue="regular" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="regular">Giờ định kỳ</TabsTrigger>
          <TabsTrigger value="exceptions">Ngày ngoại lệ</TabsTrigger>
        </TabsList>

        <TabsContent value="regular" className="mt-6 space-y-4">
          <div>
            <h3 className="text-lg font-medium tracking-tight">Giờ làm việc hàng tuần</h3>
            <p className="text-muted-foreground text-sm">
              Thiết lập khung giờ mở cửa và đóng cửa mặc định cho từng ngày trong tuần.
            </p>
          </div>
          <div className="pt-2">
            <OperatingHoursForm
              data={settings?.regular_operating_hours}
              onChange={handleOperatingHoursChange}
            />
          </div>
        </TabsContent>

        <TabsContent value="exceptions" className="mt-6 space-y-4">
          <div>
             <h3 className="text-lg font-medium tracking-tight">Ngày nghỉ lễ & Ngoại lệ</h3>
             <p className="text-muted-foreground text-sm">
               Quản lý các ngày Spa đóng cửa hoặc thay đổi giờ làm việc (Tết, lễ hội, sửa chữa...).
             </p>
          </div>
          <div className="pt-2">
            <ExceptionDatesManager
              initialData={settings?.exception_dates}
              regularHours={settings?.regular_operating_hours}
              onChange={handleExceptionDatesChange}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
