import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import StaffLoading from "./loading";

// Lazy load components to optimize initial load
const StaffTable = dynamic(() => import("@/features/staff/components/staff-table").then(mod => mod.StaffTable), {
  loading: () => <StaffLoading />
});

const ShiftList = dynamic(() => import("@/features/staff/components/shift-list").then(mod => mod.ShiftList), {
  loading: () => <StaffLoading />
});

const SchedulingGrid = dynamic(() => import("@/features/staff/components/scheduling-grid").then(mod => mod.SchedulingGrid), {
  loading: () => <StaffLoading />
});

export default function StaffPage() {
  return (
    <div className="space-y-6">
      {/* Page Header aligned with ServicePageTabs standard */}
      <div className="flex flex-col gap-1 px-1">
        <h1 className="text-2xl font-semibold tracking-tight">Nhân sự & Lập lịch</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý đội ngũ nhân viên và phân công ca làm việc.
        </p>
      </div>

      <Tabs defaultValue="technicians" className="w-full">
        <div className="px-1">
          <TabsList>
            <TabsTrigger value="technicians">Nhân viên</TabsTrigger>
            <TabsTrigger value="shifts">Phòng/Ca</TabsTrigger>
            <TabsTrigger value="schedule">Lịch biểu</TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-4">
          <TabsContent value="technicians" forceMount={true} className="data-[state=inactive]:hidden focus-visible:outline-none">
            <Suspense fallback={<StaffLoading />}>
              <StaffTable />
            </Suspense>
          </TabsContent>

          <TabsContent value="shifts" forceMount={true} className="data-[state=inactive]:hidden focus-visible:outline-none">
            <Suspense fallback={<StaffLoading />}>
              <ShiftList />
            </Suspense>
          </TabsContent>

          <TabsContent value="schedule" forceMount={true} className="data-[state=inactive]:hidden focus-visible:outline-none">
            <Suspense fallback={<StaffLoading />}>
              <SchedulingGrid />
            </Suspense>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
