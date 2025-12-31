"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { ResourceGroupWithCount, Service, ServiceCategory, Skill } from "../types";
import { CategoriesTab } from "./categories-tab";
import { ResourcesTab } from "./resources-tab";
import { ServicesTab } from "./services-tab";
import { SkillsTab } from "./skills-tab";

export interface ServicePageTabsProps {
  skills: Skill[];
  categories: ServiceCategory[];
  resourceGroups: ResourceGroupWithCount[];
  services: Service[];
}

export function ServicePageTabs({
  skills,
  categories,
  resourceGroups,
  services,
}: ServicePageTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Get active tab from URL or default to "services"
  const defaultTab = searchParams.get("view") || "services";
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Sync state with URL if it changes externally (e.g. back button)
  useEffect(() => {
    setActiveTab(searchParams.get("view") || "services");
  }, [searchParams]);

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
      // Update URL without full reload
      const params = new URLSearchParams(searchParams);
      params.set("view", value);
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="services">Dịch vụ</TabsTrigger>
            <TabsTrigger value="categories">Danh mục</TabsTrigger>
            <TabsTrigger value="resources">Tài nguyên</TabsTrigger>
            <TabsTrigger value="skills">Kỹ năng</TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-4">
          <TabsContent 
            value="services" 
            forceMount 
            className="m-0 border-none p-0 data-[state=inactive]:hidden"
          >
            <ServicesTab
              services={services}
              categories={categories}
              skills={skills}
              resourceGroups={resourceGroups}
            />
          </TabsContent>

          <TabsContent 
            value="categories" 
            forceMount 
            className="m-0 border-none p-0 data-[state=inactive]:hidden"
          >
            <CategoriesTab categories={categories} />
          </TabsContent>

          <TabsContent 
            value="resources" 
            forceMount 
            className="m-0 border-none p-0 data-[state=inactive]:hidden"
          >
            <ResourcesTab groups={resourceGroups} />
          </TabsContent>

          <TabsContent 
            value="skills" 
            forceMount 
            className="m-0 border-none p-0 data-[state=inactive]:hidden"
          >
            <SkillsTab skills={skills} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
