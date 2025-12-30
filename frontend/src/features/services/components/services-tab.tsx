"use client";

import type { ResourceGroup, Service, ServiceCategory, Skill } from "../types";

interface ServicesTabProps {
  services: Service[];
  categories: ServiceCategory[];
  skills: Skill[];
  resourceGroups: ResourceGroup[];
}

export function ServicesTab({
  services,
  categories,
  skills,
  resourceGroups,
}: ServicesTabProps) {
  const getCategoryName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name || "Chưa phân loại";

  const formatPrice = (price: string) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
      Number(price)
    );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Dịch vụ</h3>
          <p className="text-sm text-muted-foreground">
            Quản lý các dịch vụ Spa cung cấp cho khách hàng
          </p>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Chưa có dịch vụ nào. Thêm dịch vụ đầu tiên.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Dịch vụ</th>
                <th className="text-left p-3 font-medium">Danh mục</th>
                <th className="text-right p-3 font-medium">Thời gian</th>
                <th className="text-right p-3 font-medium">Giá</th>
                <th className="text-center p-3 font-medium">Trạng thái</th>
                <th className="text-right p-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-b last:border-0">
                  <td className="p-3">
                    <div className="font-medium">{service.name}</div>
                    {service.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {service.description}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {getCategoryName(service.category_id)}
                  </td>
                  <td className="p-3 text-right">
                    {service.duration} phút
                  </td>
                  <td className="p-3 text-right font-medium">
                    {formatPrice(service.price)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        service.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {service.is_active ? "Hoạt động" : "Tạm ngưng"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {/* Actions sẽ thêm sau */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
