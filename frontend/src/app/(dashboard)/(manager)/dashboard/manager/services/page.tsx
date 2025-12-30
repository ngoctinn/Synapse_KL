import { ServiceManagement } from "@/features/services/components/service-management";
import { ServiceManagementSkeleton } from "@/features/services/components/service-management-skeleton";
import { Suspense } from "react";

export const metadata = {
  title: "Quản lý Dịch vụ | Synapse",
  description: "Quản lý danh mục, kỹ năng, tài nguyên và dịch vụ Spa",
};

export default function ServicesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Quản lý Dịch vụ</h1>
        <p className="text-muted-foreground">
          Quản lý kỹ năng, danh mục, tài nguyên và dịch vụ của Spa
        </p>
      </div>

      <Suspense fallback={<ServiceManagementSkeleton />}>
        <ServiceManagement />
      </Suspense>
    </div>
  );
}
