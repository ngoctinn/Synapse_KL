"use client";

import { Table } from "@tanstack/react-table";
import { Filter } from "lucide-react";

import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { TableCell, TableRow } from "@/shared/ui/table";

interface FilterOption {
  label: string;
  value: string;
}

interface SmartColumnMeta {
  filterOptions?: FilterOption[];
}

interface DataTableFilterRowProps<TData> {
  table: Table<TData>;
}

export function DataTableFilterRow<TData>({
  table,
}: DataTableFilterRowProps<TData>) {
  // Lấy header group cuối cùng để căn chỉnh các ô filter khớp với cột
  const headerGroup =
    table.getHeaderGroups()[table.getHeaderGroups().length - 1];

  return (
    <TableRow
      data-slot="filter-row"
      className="hover:bg-transparent border-none bg-transparent transition-none"
    >
      {headerGroup.headers.map((header) => {
        const column = header.column;
        const meta = column.columnDef.meta as SmartColumnMeta;
        const filterOptions = meta?.filterOptions;

        // Không hiển thị filter cho cột checkbox/actions hoặc cột không hỗ trợ lọc
        if (
          header.id === "select" ||
          header.id === "actions" ||
          !column.getCanFilter()
        ) {
          return (
            <TableCell
              key={`filter-${header.id}`}
              className="py-2.5 h-12 bg-transparent border-b border-neutral-10/50"
            />
          );
        }

        return (
          <TableCell
            key={`filter-${header.id}`}
            className="py-2.5 h-12 px-4 bg-transparent border-b border-neutral-10/50 align-middle overflow-visible"
          >
            <div
              data-slot="filter-container"
              className="relative flex items-center w-full group"
            >
              <div className="flex-1">
                {filterOptions ? (
                  <Select
                    value={(column.getFilterValue() as string) ?? "all"}
                    onValueChange={(value: string) =>
                      column.setFilterValue(value === "all" ? undefined : value)
                    }
                  >
                    <SelectTrigger className="w-full h-8 text-xs bg-background border-border/60 rounded-md focus:ring-1 focus:ring-primary/20 hover:border-border pr-8">
                      <SelectValue placeholder="Chọn..." />
                    </SelectTrigger>
                    <SelectContent className="border-border/40">
                      <SelectItem value="all" className="text-xs">
                        Tất cả
                      </SelectItem>
                      {filterOptions.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          className="text-xs font-medium"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="Tìm kiếm..."
                    value={(column.getFilterValue() as string) ?? ""}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      column.setFilterValue(event.target.value)
                    }
                    className="w-full h-8 text-xs bg-background border-border/60 rounded-md focus-visible:ring-1 focus-visible:ring-primary/20 hover:border-border pr-8"
                  />
                )}
              </div>
              <div className="absolute right-2.5 pointer-events-none">
                <Filter className="h-4 w-4 text-neutral-30 group-focus-within:text-primary/60 transition-colors stroke-2" />
              </div>
            </div>
          </TableCell>
        );
      })}
    </TableRow>
  );
}
