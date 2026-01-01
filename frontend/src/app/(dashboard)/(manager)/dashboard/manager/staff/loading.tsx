import { Skeleton } from "@/shared/ui/skeleton";

export default function StaffLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
