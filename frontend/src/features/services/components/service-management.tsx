import {
  getCategoriesAction,
  getResourceGroupsAction,
  getResourcesAction,
  getServicesAction,
  getSkillsAction,
} from "../actions";
import { ServicePageTabs } from "./service-page-tabs";

export async function ServiceManagement() {
  const [skills, categories, resourceGroups, resources, servicesResponse] =
    await Promise.all([
      getSkillsAction(),
      getCategoriesAction(),
      getResourceGroupsAction(),
      getResourcesAction(),
      getServicesAction(),
    ]);

  const groupsWithCount = resourceGroups.map((group) => {
    const groupResources = resources.filter((r) => r.group_id === group.id);
    return {
      ...group,
      resource_count: groupResources.length,
      active_count: groupResources.filter((r) => r.status === "ACTIVE").length,
    };
  });

  // No Card wrapper here - let the page layout handle container
  return (
    <ServicePageTabs
      skills={skills}
      categories={categories}
      resourceGroups={groupsWithCount}
      services={servicesResponse.data || []}
    />
  );
}
