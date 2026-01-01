"use client"

import { useFormGuard } from "@/shared/hooks/use-form-guard"
import { Button } from "@/shared/ui/button"
import { SidebarTrigger } from "@/shared/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import * as React from "react"
import { toast } from "sonner"
import { getOperationalSettingsAction, updateOperationalSettingsAction } from "../actions"
import { ExceptionDate, OperatingHour, OperationalSettings as OperationalSettingsType } from "../types"
import { OperationalSettingsSkeleton } from "./operational-settings-skeleton"

// Lazy load Tab contents với loading skeleton riêng
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

interface OperationalSettingsProps {
  initialData?: OperationalSettingsType | null
}

export function OperationalSettings({ initialData }: OperationalSettingsProps) {
  const [settings, setSettings] = React.useState<OperationalSettingsType | null>(initialData || null);
  const [originalSettings, setOriginalSettings] = React.useState<OperationalSettingsType | null>(initialData || null);
  const [isLoading, setIsLoading] = React.useState(!initialData);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (initialData) return;

    getOperationalSettingsAction()
      .then((data) => {
        setSettings(data);
        setOriginalSettings(data);
      })
      .finally(() => setIsLoading(false));
  }, [initialData]);

  const isDirty = React.useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(originalSettings);
  }, [settings, originalSettings]);

  // Browser Guard (Reuse hook just for browser protection)
  useFormGuard({ isDirty });

  const handleOperatingHoursChange = React.useCallback((hours: OperatingHour[]) => {
    setSettings(prev => {
      if (!prev) return null;
      // Chỉ cập nhật nếu mảng dữ liệu thực sự khác biệt (so sánh nông từng cặp)
      const isSame = prev.regular_operating_hours.length === hours.length &&
                   prev.regular_operating_hours.every((h, i) =>
                     h.day_of_week === hours[i].day_of_week &&
                     h.open_time === hours[i].open_time &&
                     h.close_time === hours[i].close_time &&
                     h.is_closed === hours[i].is_closed
                   );

      if (isSame) return prev;
      return { ...prev, regular_operating_hours: hours };
    });
  }, []);

  const handleExceptionDatesChange = React.useCallback((exceptionDates: ExceptionDate[]) => {
    setSettings(prev => {
      if (!prev) return null;
      return { ...prev, exception_dates: exceptionDates };
    });
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const response = await updateOperationalSettingsAction(settings);
      if (response.success) {
        // Cập nhật cả original và settings hiện tại để đồng bộ hoàn toàn với server
        setOriginalSettings(response.data);
        setSettings(response.data);
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
    return <OperationalSettingsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <SidebarTrigger className="-ml-2 mt-0.5" />
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Cấu hình vận hành</h2>
          <p className="text-sm text-muted-foreground">
            Quản lý giờ làm việc và các ngày nghỉ lễ của Spa.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <Tabs defaultValue="regular" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="regular">Giờ định kỳ</TabsTrigger>
              <TabsTrigger value="exceptions">Ngày ngoại lệ</TabsTrigger>
            </TabsList>

            {isDirty && (
              <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4">
                <div className="hidden items-center gap-2 md:flex">
                  <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                  <p className="text-sm font-medium text-orange-600">Bạn có thay đổi chưa lưu</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleReset} disabled={isSaving}>
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

          <TabsContent value="regular" forceMount={true} className="mt-6 space-y-4 data-[state=inactive]:hidden">
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

          <TabsContent value="exceptions" forceMount={true} className="mt-6 space-y-4 data-[state=inactive]:hidden">
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
    </div>
  )
}
