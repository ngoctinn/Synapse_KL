import { ServiceManagementSkeleton } from "@/features/services/components/service-management-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-4 w-72 bg-muted animate-pulse rounded mt-2" />
      </div>
      <ServiceManagementSkeleton />
    </div>
  );
}
