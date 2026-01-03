"use client";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ListFilter, Search } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  onFilterClick?: () => void;
  actionLabel?: string;
  onActionClick?: () => void;
  className?: string;
}

/**
 * Component Header chung cho các trang danh sách
 * Hỗ trợ tiêu đề, phụ đề, tìm kiếm, lọc và nút hành động chính.
 */
export function PageHeader({
  title,
  subtitle,
  searchPlaceholder = "Tìm kiếm...",
  onSearch,
  onFilterClick,
  actionLabel,
  onActionClick,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-8",
        className
      )}
    >
      {/* Khối Tiêu đề */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {/* Khối Hành động */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Thanh tìm kiếm */}
        <div className="relative w-full md:w-48 lg:w-56">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-9"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>

        {/* Nút Lọc (Chỉ hiển thị nếu có truyền handler) */}
        {onFilterClick && (
          <Button
            variant="outline"
            className="flex gap-2"
            onClick={onFilterClick}
          >
            <span>Lọc</span>
            <ListFilter className="h-4 w-4" />
          </Button>
        )}

        {/* Nút hành động chính */}
        {actionLabel && (
          <Button className="flex gap-2" onClick={onActionClick}>
            <span>{actionLabel}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
