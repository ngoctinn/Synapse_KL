import {
  getSchedulesAction,
  getShiftsAction,
  getStaffAction,
} from "@/features/staff/actions";
import { SidebarTrigger } from "@/shared/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { endOfWeek, format, startOfWeek } from "date-fns";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import StaffLoading from "./loading";

// Lazy load components to optimize initial load
const StaffTable = dynamic(
  () =>
    import("@/features/staff/components/staff-table").then(
      (mod) => mod.StaffTable
    ),
  {
    loading: () => <StaffLoading />,
  }
);

const ShiftList = dynamic(
  () =>
    import("@/features/staff/components/shift-list").then(
      (mod) => mod.ShiftList
    ),
  {
    loading: () => <StaffLoading />,
  }
);

const SchedulingGrid = dynamic(
  () =>
    import("@/features/staff/components/scheduling-grid").then(
      (mod) => mod.SchedulingGrid
    ),
  {
    loading: () => <StaffLoading />,
  }
);

// Next.js 16/15 props for Page
interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StaffPage({ searchParams }: PageProps) {
  // 1. Resolve params
  const params = await searchParams;
  const dateParam = typeof params.date === "string" ? params.date : undefined;

  // 2. Calculate Date Range
  const currentDate = dateParam ? new Date(dateParam) : new Date();

  // Safety check for invalid date
  const safeDate = isNaN(currentDate.getTime()) ? new Date() : currentDate;

  const start = startOfWeek(safeDate, { weekStartsOn: 1 });
  const end = endOfWeek(safeDate, { weekStartsOn: 1 });

  // 3. Parallel Data Fetching
  const [staff, shifts, schedules] = await Promise.all([
    getStaffAction(),
    getShiftsAction(),
    getSchedulesAction(format(start, "yyyy-MM-dd"), format(end, "yyyy-MM-dd")),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 px-1">
        <SidebarTrigger className="-ml-1" />
        <h1>Quản lý nhân sự</h1>
      </div>

      <Tabs defaultValue="technicians" className="w-full max-w-full space-y-6">
        <TabsList>
          <TabsTrigger value="technicians">Nhân viên</TabsTrigger>
          <TabsTrigger value="shifts">Phòng/Ca</TabsTrigger>
          <TabsTrigger value="schedule">Lịch biểu</TabsTrigger>
        </TabsList>

        <TabsContent
          value="technicians"
          forceMount={true}
          className="data-[state=inactive]:hidden focus-visible:outline-none mt-0"
        >
          <Suspense fallback={<StaffLoading />}>
            <StaffTable data={staff} />
          </Suspense>
        </TabsContent>

        <TabsContent
          value="shifts"
          forceMount={true}
          className="data-[state=inactive]:hidden focus-visible:outline-none mt-0"
        >
          <Suspense fallback={<StaffLoading />}>
            <ShiftList shifts={shifts} />
          </Suspense>
        </TabsContent>

        <TabsContent
          value="schedule"
          forceMount={true}
          className="data-[state=inactive]:hidden focus-visible:outline-none mt-0"
        >
          <Suspense fallback={<StaffLoading />}>
            <SchedulingGrid
              staff={staff.filter((s) => s.is_active)}
              shifts={shifts}
              schedules={schedules}
              currentDate={safeDate}
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
