import {
  getCategoriesAction,
  getResourceGroupsAction,
  getResourcesAction,
  getServicesAction,
  getSkillsAction,
} from "../actions";
import { ServicePageTabs } from "./service-page-tabs";

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

  // No Card wrapper here - let the page layout handle container
  return (
    <ServicePageTabs
      skills={skills}
      categories={categories}
      resourceGroups={groupsWithCount}
      services={services}
    />
  );
}
