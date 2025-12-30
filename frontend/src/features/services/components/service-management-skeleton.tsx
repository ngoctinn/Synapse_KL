import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

export function ServiceManagementSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-10 w-full max-w-md" />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="skills">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="skills" disabled>Kỹ năng</TabsTrigger>
            <TabsTrigger value="categories" disabled>Danh mục</TabsTrigger>
            <TabsTrigger value="resources" disabled>Tài nguyên</TabsTrigger>
            <TabsTrigger value="services" disabled>Dịch vụ</TabsTrigger>
          </TabsList>
          <TabsContent value="skills" className="mt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-32" />
              </div>
              <div className="border rounded-lg">
                <div className="p-4 border-b">
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-4 border-b last:border-0">
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
