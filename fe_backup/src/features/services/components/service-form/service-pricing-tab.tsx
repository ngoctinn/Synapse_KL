"use client";

import { DurationSelect } from "@/shared/components/duration-select";
import { Button } from "@/shared/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { useFormContext } from "react-hook-form";
import { type ServiceCreateForm } from "../../schemas";
import { PriceInputField } from "./price-input-field";

export function ServicePricingTab() {
  const form = useFormContext<ServiceCreateForm>();

  return (
    <div className="space-y-4 pt-1">
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>Đơn giá cơ bản</FormLabel>
            <FormControl>
              <div className="space-y-2">
                <PriceInputField field={field} />
                {field.value > 0 && (
                  <div className="flex gap-2">
                    {[500000, 1000000, 2000000].map((p) => (
                      <Button
                        key={p}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="font-medium text-muted-foreground hover:text-primary"
                        onClick={() => field.onChange(p)}
                      >
                        {new Intl.NumberFormat("vi-VN", {
                          notation: "compact",
                        }).format(p)}
                      </Button>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-alert-warning-foreground hover:bg-alert-warning/10 font-normal"
                      onClick={() => field.onChange(0)}
                    >
                      Xóa trắng
                    </Button>
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Thực hiện</FormLabel>
              <FormControl>
                <DurationSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  step={15}
                  max={240}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="buffer_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nghỉ / Dọn</FormLabel>
              <FormControl>
                <DurationSelect
                  value={field.value || 0}
                  onValueChange={field.onChange}
                  step={5}
                  max={60}
                  placeholder="Không nghỉ"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
