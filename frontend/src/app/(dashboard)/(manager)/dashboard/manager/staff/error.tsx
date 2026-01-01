"use client";

import { Button } from "@/shared/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

interface StaffErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function StaffError({ error, reset }: StaffErrorProps) {
  useEffect(() => {
    // Log error to monitoring service in production
    console.error("Staff Page Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center p-12 gap-6 min-h-[400px]">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          Không thể tải dữ liệu nhân sự
        </h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Đã xảy ra lỗi khi tải thông tin nhân viên và lịch làm việc.
          Vui lòng thử lại hoặc liên hệ quản trị viên nếu lỗi vẫn tiếp tục.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/60 font-mono">
            Mã lỗi: {error.digest}
          </p>
        )}
      </div>

      <Button onClick={reset} variant="outline" className="gap-2">
        <RefreshCw className="w-4 h-4" />
        Thử lại
      </Button>
    </div>
  );
}
