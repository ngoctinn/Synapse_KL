import { ServiceManagement } from "@/features/services/components/service-management";
import { ServiceManagementSkeleton } from "@/features/services/components/service-management-skeleton";
import { Suspense } from "react";

export const metadata = {
  title: "Quản lý Dịch vụ | Synapse",
  description: "Quản lý danh mục, kỹ năng, tài nguyên và dịch vụ Spa",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ServicesPage(props: PageProps) {
  const searchParams = await props.searchParams;
  return (
    <Suspense fallback={<ServiceManagementSkeleton />}>
      <ServiceManagement />
    </Suspense>
  );
}
