import { Card, CardContent } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
    getCategoriesAction,
    getResourceGroupsAction,
    getResourcesAction,
    getServicesAction,
    getSkillsAction,
} from "../actions";
import { CategoriesTab } from "./categories-tab";
import { ResourcesTab } from "./resources-tab";
import { ServicesTab } from "./services-tab";
import { SkillsTab } from "./skills-tab";

export async function ServiceManagement() {
  const [skills, categories, resourceGroups, resources, services] = await Promise.all([
    getSkillsAction(),
    getCategoriesAction(),
    getResourceGroupsAction(),
    getResourcesAction(),
    getServicesAction(),
  ]);

  const groupsWithCount = resourceGroups.map(group => ({
    ...group,
    resource_count: resources.filter(r => r.group_id === group.id).length
  }));

  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs defaultValue="services">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="skills">
              Kỹ năng ({skills.length})
            </TabsTrigger>
            <TabsTrigger value="categories">
              Danh mục ({categories.length})
            </TabsTrigger>
            <TabsTrigger value="resources">
              Tài nguyên ({resources.length})
            </TabsTrigger>
            <TabsTrigger value="services">
              Dịch vụ ({services.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="skills" className="mt-6" forceMount>
            <div className="data-[state=inactive]:hidden" data-state="active">
              <SkillsTab skills={skills} />
            </div>
          </TabsContent>

          <TabsContent value="categories" className="mt-6" forceMount>
            <div className="data-[state=inactive]:hidden" data-state="active">
              <CategoriesTab categories={categories} />
            </div>
          </TabsContent>

          <TabsContent value="resources" className="mt-6" forceMount>
            <div className="data-[state=inactive]:hidden" data-state="active">
              <ResourcesTab groups={groupsWithCount} />
            </div>
          </TabsContent>

          <TabsContent value="services" className="mt-6" forceMount>
            <div className="data-[state=inactive]:hidden" data-state="active">
              <ServicesTab
                services={services}
                categories={categories}
                skills={skills}
                resourceGroups={resourceGroups}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
