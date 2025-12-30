"use client";

import type { ServiceCategory } from "../types";

interface CategoriesTabProps {
  categories: ServiceCategory[];
}

export function CategoriesTab({ categories }: CategoriesTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Danh mục dịch vụ</h3>
          <p className="text-sm text-muted-foreground">
            Kéo thả để sắp xếp thứ tự hiển thị
          </p>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Chưa có danh mục nào. Thêm danh mục đầu tiên.
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <div className="font-medium">{category.name}</div>
                {category.description && (
                  <div className="text-sm text-muted-foreground">
                    {category.description}
                  </div>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                #{category.sort_order}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
