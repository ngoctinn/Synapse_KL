"use client";

import { Input } from "@/shared/ui/input";
import { useEffect, useState } from "react";
import type { ControllerRenderProps } from "react-hook-form";
import type { ServiceCreateForm } from "../../schemas";

interface PriceInputFieldProps {
  field: ControllerRenderProps<ServiceCreateForm, "price">; // Explicitly typed for the price field
}

export function PriceInputField({ field }: PriceInputFieldProps) {
  const [displayValue, setDisplayValue] = useState("");

  // Sync with form state (e.g. when suggestions are clicked or form resets)
  useEffect(() => {
    if (field.value === 0) {
      setDisplayValue("");
      return;
    }
    const formatted = field.value ? new Intl.NumberFormat("vi-VN").format(field.value) : "";

    // Helper to parse current display value to number for comparison
    const parseDisplay = (val: string) => {
      const clean = val.toLowerCase().replace(/[^0-9km.]/g, "");
      if (clean.endsWith("k")) return Math.round((parseFloat(clean) || 0) * 1000);
      if (clean.endsWith("m")) return Math.round((parseFloat(clean) || 0) * 1000000);
      return parseInt(clean.replace(/[^0-9]/g, ""), 10) || 0;
    };

    const currentNumeric = parseDisplay(displayValue);

    // Đồng bộ giá trị hiển thị với form state khi có sự thay đổi từ bên ngoài (reset form hoặc bấm nút gợi ý)
    if (currentNumeric !== field.value) {
      setDisplayValue(formatted);
      return;
    }

    // Tránh việc cập nhật lại khi người dùng đang gõ phím viết tắt (k, m) để không làm nhảy con trỏ chuột
    const isShorthand = displayValue.toLowerCase().includes('k') || displayValue.toLowerCase().includes('m');
    const hasDot = displayValue.includes('.');

    if (!isShorthand && !hasDot) {
      setDisplayValue(formatted);
    }
  }, [field.value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase();
    const clean = val.replace(/[^0-9km.]/g, "");

    setDisplayValue(clean);

    // Logic nghiệp vụ: Cho phép nhập nhanh các đơn vị nghìn (k) và triệu (m)
    if (clean.endsWith("k")) {
      const num = parseFloat(clean) || 0;
      field.onChange(Math.round(num * 1000));
    } else if (clean.endsWith("m")) {
      const num = parseFloat(clean) || 0;
      field.onChange(Math.round(num * 1000000));
    } else if (!clean.includes(".")) {
      // Trường hợp nhập số bình thường
      const numeric = parseInt(clean.replace(/[^0-9]/g, ""), 10) || 0;
      field.onChange(numeric);
    }
    // If it has a dot but NO shorthand yet (e.g. "1.2"), we wait until they type 'k/m'
  };

  const handleBlur = () => {
    // On blur, force standard format
    setDisplayValue(field.value ? new Intl.NumberFormat("vi-VN").format(field.value) : "");
  };

  return (
    <div className="relative">
      <Input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className="text-right font-mono pr-12 h-11 text-base bg-secondary/50 focus:bg-background transition-colors"
        placeholder="0"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none font-medium opacity-70">
        VNĐ
      </div>
    </div>
  );
}
