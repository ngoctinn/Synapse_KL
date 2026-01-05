"use client"

import { Plus, Trash } from "lucide-react"
import { Control, useFieldArray } from "react-hook-form"

import { Button } from "@/shared/ui/button"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

import type { ResourceGroup } from "@/features/resources/model/schemas"
import { SERVICE_DURATION_OPTIONS } from "../config/constants"

interface ResourceRequirementsListProps {
  control: Control<any>
  resourceGroups: ResourceGroup[]
}

export function ResourceRequirementsList({
  control,
  resourceGroups,
}: ResourceRequirementsListProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "resourceRequirements",
  })

  return (
    <div className="space-y-4">
      {/* WHY: Header for the section */}
      <div className="space-y-1">
        <FormLabel>Tài nguyên yêu cầu</FormLabel>
        <p className="text-[0.8rem] text-muted-foreground">
          Thiết bị/phòng cần thiết. Mặc định dùng suốt thời gian dịch vụ.
        </p>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="grid gap-4 border p-4 relative rounded-md">
          <div className="space-y-4">
            <FormField
              control={control}
              name={`resourceRequirements.${index}.groupId`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Nhóm tài nguyên *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn nhóm" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {resourceGroups.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name} ({g.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-end gap-2">
              <FormField
                control={control}
                name={`resourceRequirements.${index}.quantity`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-xs">Số lượng *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                onClick={() => remove(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Advanced Timing */}
          <div className="space-y-4 pt-2 border-t border-dashed">
            <FormField
              control={control}
              name={`resourceRequirements.${index}.startDelay`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">
                    Bắt đầu sau
                  </FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={String(field.value ?? 0)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">Ngay lập tức (0p)</SelectItem>
                      {SERVICE_DURATION_OPTIONS.map((m) => (
                        <SelectItem key={m} value={String(m)}>
                          {m} phút
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`resourceRequirements.${index}.usageDuration`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">
                    Dùng trong
                  </FormLabel>
                  <Select
                    onValueChange={(v) =>
                      field.onChange(v === "null" ? null : Number(v))
                    }
                    value={String(field.value ?? "null")}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">Hết dịch vụ</SelectItem>
                      {SERVICE_DURATION_OPTIONS.map((m) => (
                        <SelectItem key={m} value={String(m)}>
                          {m} phút
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        className="w-full border-dashed"
        onClick={() =>
          append({
            groupId: "",
            quantity: 1,
            startDelay: 0,
            usageDuration: null,
          })
        }
      >
        <Plus className="mr-2 h-4 w-4" /> Thêm tài nguyên
      </Button>
    </div>
  )
}
