"use client";

import { cn } from "@/shared/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import * as React from "react";

interface DurationSelectProps {
  value?: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function formatDuration(minutes: number): string {
  if (minutes === 0) return "Không có";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours} giờ${mins > 0 ? ` ${mins} phút` : ""}`;
  }
  return `${mins} phút`;
}

export function DurationSelect({
  value,
  onValueChange,
  min = 0,
  max = 240, // Default 4 hours
  step = 15,
  placeholder = "Chọn thời gian...",
  className,
  disabled,
}: DurationSelectProps) {
  const options = React.useMemo(() => {
    const opts = [];
    for (let i = min; i <= max; i += step) {
      opts.push({
        label: formatDuration(i),
        value: i.toString(),
      });
    }
    return opts;
  }, [min, max, step]);

  return (
    <Select
      value={value?.toString()}
      onValueChange={(val) => onValueChange(Number(val))}
      disabled={disabled}
    >
      <SelectTrigger className={cn("w-full justify-start font-normal h-11", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
