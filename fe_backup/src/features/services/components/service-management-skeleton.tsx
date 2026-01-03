import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

export function ServiceManagementSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </CardHeader>
      <CardContent>
        {/* Tabs List Skeleton */}
        <div className="grid w-full grid-cols-4 gap-2 mb-8 bg-muted/10 p-1 rounded-lg">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
          ))}
        </div>

        {/* Action Bar Skeleton */}
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1">
             <Skeleton className="h-6 w-32" />
             <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>

        {/* DataTable Skeleton Structure */}
        <div className="rounded-lg border bg-card">
          {/* Header */}
          <div className="border-b px-4 py-3 flex items-center gap-4">
            <Skeleton className="h-5 w-8" />
            <Skeleton className="h-5 flex-1" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-12 ml-auto" />
          </div>

          {/* Rows */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-4 py-3 border-b last:border-0 flex items-center gap-4">
               <Skeleton className="h-5 w-5 rounded" />
               <div className="flex-1 space-y-2">
                 <Skeleton className="h-5 w-3/4" />
               </div>
               <Skeleton className="h-6 w-28 rounded-full" />
               <Skeleton className="h-5 w-20" />
               <Skeleton className="h-8 w-8 rounded ml-auto" />
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between py-4">
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" /> {/* Page size */}
            <Skeleton className="h-8 w-8" />   {/* Prev */}
            <Skeleton className="h-8 w-8" />   {/* Page 1 */}
            <Skeleton className="h-8 w-8" />   {/* Next */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
