"use client";

import { getSkillsAction } from "@/features/services/actions";
import type { Skill } from "@/features/staff/types";
import { MultiSelect } from "@/shared/components/multi-select";
import { Skeleton } from "@/shared/ui/skeleton";
import { useEffect, useState } from "react";

interface SkillSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function SkillSelector({ value, onChange, disabled }: SkillSelectorProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const data = await getSkillsAction();
        setSkills(data);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Failed to fetch skills", error);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchSkills();
  }, []);

  if (isLoading) {
    return <Skeleton className="h-10 w-full rounded-xl" />;
  }

  const options = skills.map((s) => ({
    label: s.name,
    value: s.id,
  }));

  return (
    <MultiSelect
      options={options}
      selected={value}
      onChange={onChange}
      placeholder="Chọn kỹ năng chuyên môn..."
      className="rounded-xl border-muted-foreground/20"
      maxCount={3}
    />
  );
}
