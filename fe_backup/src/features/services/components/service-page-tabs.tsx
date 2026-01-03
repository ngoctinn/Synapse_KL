"use client";

import { SidebarTrigger } from "@/shared/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type {
  ResourceGroupWithCount,
  Service,
  ServiceCategory,
  Skill,
} from "../types";
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
  const searchParams = useSearchParams();
  
  // Lấy tab từ URL lúc mount, sau đó dùng local state để tránh re-fetch server component
  const initialTab = searchParams.get("view") || "services";
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div className="space-y-6">
      {/* Unified Page Header */}
      <div className="flex items-center gap-4 px-1">
        <SidebarTrigger className="-ml-1" />
        <h1>Quản lý dịch vụ</h1>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full space-y-6"
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
          className="data-[state=inactive]:hidden mt-0"
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
          className="data-[state=inactive]:hidden mt-0"
        >
          <CategoriesTab categories={categories} />
        </TabsContent>

        <TabsContent
          value="resources"
          forceMount
          className="data-[state=inactive]:hidden mt-0"
        >
          <ResourcesTab groups={resourceGroups} />
        </TabsContent>

        <TabsContent
          value="skills"
          forceMount
          className="data-[state=inactive]:hidden mt-0"
        >
          <SkillsTab skills={skills} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
