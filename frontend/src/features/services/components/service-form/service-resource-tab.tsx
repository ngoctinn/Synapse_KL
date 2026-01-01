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
import { Input } from "@/shared/ui/input";
import { MultiSelect } from "@/shared/ui/multi-select";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { type ServiceCreateForm } from "../../schemas";
import type { ResourceGroup, ResourceGroupWithCount, Skill } from "../../types";
import { ServiceResourceTimeline } from "./service-resource-timeline";

interface ServiceResourceTabProps {
  skills: Skill[];
  resourceGroups: ResourceGroupWithCount[] | ResourceGroup[];
  onAddSkill: () => void;
}

export function ServiceResourceTab({ skills, resourceGroups, onAddSkill }: ServiceResourceTabProps) {
  const form = useFormContext<ServiceCreateForm>();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "resource_requirements",
  });

  const skillOptions = skills.map((s) => ({ label: s.name, value: s.id }));
  const duration = form.watch("duration") || 60;

  return (
    <div className="space-y-4 pt-1">
      {/* Skills Section */}
      <FormField
        control={form.control}
        name="skill_ids"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>Kỹ năng bắt buộc</FormLabel>
            <div className="flex gap-2">
              <div className="flex-1 min-w-0">
                <FormControl>
                  <MultiSelect
                    options={skillOptions}
                    onChange={field.onChange}
                    selected={field.value || []}
                    placeholder="Chọn kỹ năng..."
                  />
                </FormControl>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onAddSkill}
                className="shrink-0 h-11 w-11"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <FormLabel>Yêu cầu tài nguyên</FormLabel>
            <p className="text-[10px] text-muted-foreground italic">Xem timeline sử dụng bên dưới</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => append({ group_id: "", quantity: 1, start_delay: 0 })}
            className="h-8 text-primary hover:text-primary hover:bg-primary/10 -mr-2"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Thêm tài nguyên
          </Button>
        </div>

        <ServiceResourceTimeline />

        <div className="space-y-3">
          {fields.map((item, index) => (
            <div key={item.id} className="p-3 rounded-lg border bg-background space-y-3 relative group">
              <div className="flex items-center justify-between gap-2">
                <FormField
                  control={form.control}
                  name={`resource_requirements.${index}.group_id`}
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-0 mb-0">
                      <FormLabel className="text-[11px] font-normal text-muted-foreground">Loại tài nguyên</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Chọn nhóm..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {resourceGroups.map((g) => {
                             const countInfo = 'active_count' in g ? `(Trống: ${g.active_count})` : '';
                             return (
                              <SelectItem key={g.id} value={g.id}>
                                {g.name} {countInfo}
                              </SelectItem>
                             );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`resource_requirements.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem className="w-20 space-y-0 mb-0">
                      <FormLabel className="text-[11px] font-normal text-muted-foreground">Số lượng</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          className="h-9"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
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
                  className="h-9 w-9 mt-5 text-muted-foreground hover:text-destructive transition-colors"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Advanced Time Controls */}
              <div className="grid grid-cols-2 gap-3 pl-1 pt-1 border-t border-dashed">
                  <FormField
                    control={form.control}
                    name={`resource_requirements.${index}.start_delay`}
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                         <div className="flex justify-between items-center mb-1">
                           <FormLabel className="text-[10px] text-muted-foreground font-normal">Sử dụng sau (phút)</FormLabel>
                         </div>
                         <FormControl>
                            <DurationSelect
                              value={field.value || 0}
                              onValueChange={field.onChange}
                              max={duration}
                              step={5}
                              className="h-8 text-xs"
                              placeholder="Ngay lập tức"
                            />
                         </FormControl>
                         <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`resource_requirements.${index}.usage_duration`}
                    render={({ field }) => {
                       const startDelay = form.watch(`resource_requirements.${index}.start_delay`) || 0;
                       const maxDuration = duration - startDelay;
                       return (
                        <FormItem className="space-y-0">
                           <div className="flex justify-between items-center mb-1">
                             <FormLabel className="text-[10px] text-muted-foreground font-normal">Thời lượng dùng</FormLabel>
                           </div>
                           <FormControl>
                              <DurationSelect
                                value={field.value ?? undefined}
                                onValueChange={field.onChange}
                                max={maxDuration}
                                step={5}
                                className="h-8 text-xs"
                                placeholder={`Suốt liệu trình (${maxDuration}p)`}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                       );
                    }}
                  />
              </div>
            </div>
          ))}

          {fields.length === 0 && (
            <div className="text-center p-8 border-2 border-dashed rounded-lg bg-muted/10 text-muted-foreground">
              <p className="text-sm">Chưa có tài nguyên nào được gán.</p>
              <p className="text-xs opacity-70 mt-1">Dịch vụ này không yêu cầu phòng/giường/máy?</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
