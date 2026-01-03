import { Skeleton } from "@/shared/ui/skeleton"

export function OperationalSettingsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-start gap-4">
        <Skeleton className="h-8 w-8 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Main Content Card Skeleton */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-10 w-[400px] rounded-lg" />
          <div className="flex gap-2">
             <Skeleton className="h-10 w-20 rounded-md" />
             <Skeleton className="h-10 w-28 rounded-md" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-80" />
          </div>

          {/* List items skeleton */}
          <div className="space-y-4 pt-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b last:border-0">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-24 rounded-md" />
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-10 w-24 rounded-md" />
                </div>
                <div className="hidden sm:flex gap-1">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-16 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
