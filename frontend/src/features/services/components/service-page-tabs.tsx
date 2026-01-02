"use client";

import { SidebarTrigger } from "@/shared/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
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
  const activeTab = searchParams.get("view") || "services";

  const handleTabChange = useCallback(
    (value: string) => {
      // Update URL without full reload
      const params = new URLSearchParams(searchParams);
      params.set("view", value);
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  return (
    <div className="space-y-4">
      {/* Unified Page Header */}
      <div className="flex items-center gap-4 px-1">
        <SidebarTrigger className="-ml-1" />
        <h1>Quản lý dịch vụ</h1>
      </div>


      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
            <TabsList>
              <TabsTrigger value="services">Dịch vụ</TabsTrigger>
              <TabsTrigger value="categories">Danh mục</TabsTrigger>
              <TabsTrigger value="resources">Tài nguyên</TabsTrigger>
              <TabsTrigger value="skills">Kỹ năng</TabsTrigger>
            </TabsList>

          <TabsContent
            value="services"
            forceMount
            className="data-[state=inactive]:hidden"
          >
            <ServicesTab
              services={services}
              categories={categories}
              skills={skills}
              resourceGroups={resourceGroups}
              variant="flat"
            />
          </TabsContent>

          <TabsContent
            value="categories"
            forceMount
            className="data-[state=inactive]:hidden"
          >
            <CategoriesTab categories={categories} variant="flat" />
          </TabsContent>

          <TabsContent
            value="resources"
            forceMount
            className="data-[state=inactive]:hidden"
          >
            <ResourcesTab groups={resourceGroups} variant="flat" />
          </TabsContent>

          <TabsContent
            value="skills"
            forceMount
            className="data-[state=inactive]:hidden"
          >
            <SkillsTab skills={skills} variant="flat" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
