"use client";

import type { Resource, ResourceGroup } from "../types";

interface ResourcesTabProps {
  groups: ResourceGroup[];
  resources: Resource[];
}

export function ResourcesTab({ groups, resources }: ResourcesTabProps) {
  const resourcesByGroup = groups.map((group) => ({
    ...group,
    resources: resources.filter((r) => r.group_id === group.id),
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Tài nguyên</h3>
          <p className="text-sm text-muted-foreground">
            Quản lý giường, thiết bị, phòng của Spa
          </p>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Chưa có nhóm tài nguyên nào. Thêm nhóm đầu tiên.
        </div>
      ) : (
        <div className="space-y-6">
          {resourcesByGroup.map((group) => (
            <div key={group.id} className="border rounded-lg">
              <div className="p-4 bg-muted/50 border-b flex justify-between items-center">
                <div>
                  <div className="font-medium">{group.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {group.type} - {group.resources.length} tài nguyên
                  </div>
                </div>
              </div>
              {group.resources.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Chưa có tài nguyên trong nhóm này
                </div>
              ) : (
                <div className="divide-y">
                  {group.resources.map((resource) => (
                    <div key={resource.id} className="p-4 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{resource.name}</div>
                        {resource.code && (
                          <code className="text-xs bg-muted px-1 rounded">
                            {resource.code}
                          </code>
                        )}
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          resource.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : resource.status === "MAINTENANCE"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {resource.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
