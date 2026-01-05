import { notFound } from "next/navigation"

import { getResourceGroups } from "@/features/resources/api/actions"
import { getServiceDetail } from "@/features/services/api/actions"
import { getCategories } from "@/features/services/api/category-actions"
import { EditServiceSheet } from "@/features/services/ui"
import { getSkills } from "@/features/skills/api/actions"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Separator } from "@/shared/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price)
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} phút`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}p` : `${hours} giờ`
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  try {
    const [service, allSkills, categories, resourceGroupsResult] = await Promise.all([
      getServiceDetail(id),
      getSkills(),
      getCategories(),
      getResourceGroups(),
    ])

    if (!service) {
      notFound()
    }

    const resourceGroups = resourceGroupsResult.success ? resourceGroupsResult.data : []

    return (
      <div className="flex h-full flex-col space-y-6 p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/services">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{service.name}</h1>
                {service.isActive ? (
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                    Đang hoạt động
                  </Badge>
                ) : (
                  <Badge variant="secondary">Tạm ngưng</Badge>
                )}
              </div>
              {service.category && (
                <p className="text-sm text-muted-foreground">{service.category.name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <EditServiceSheet
              service={service}
              categories={categories}
              skills={allSkills}
              resourceGroups={resourceGroups}
            />
          </div>
        </div>

        <Separator />

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="general">Thông tin chung</TabsTrigger>
            <TabsTrigger value="requirements">Kỹ năng & Tài nguyên</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-none shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Chi tiết dịch vụ</CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Thời lượng</p>
                      <p className="font-medium">{formatDuration(service.duration)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Thời gian nghỉ</p>
                      <p className="font-medium">{formatDuration(service.bufferTime)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Giá</p>
                    <p className="text-xl font-bold">{formatPrice(service.price)}</p>
                  </div>
                  {service.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">Mô tả</p>
                      <p className="text-sm">{service.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Hình ảnh</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  {service.imageUrl ? (
                    <div className="aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                      Không có hình ảnh
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="requirements">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-none shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Kỹ năng yêu cầu</CardTitle>
                  <CardDescription>
                    Nhân viên cần có TẤT CẢ các kỹ năng này để thực hiện dịch vụ.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  {service.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {service.skills.map((skill) => (
                        <Badge key={skill.id} variant="secondary">
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Chưa cấu hình kỹ năng yêu cầu.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Tài nguyên cần sử dụng</CardTitle>
                  <CardDescription>
                    Thiết bị và phòng cần thiết để thực hiện dịch vụ.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  {service.resourceRequirements.length > 0 ? (
                    <div className="space-y-2">
                      {service.resourceRequirements.map((req, idx) => (
                        <div key={idx} className="flex items-center justify-between border p-3">
                          <div>
                            <span className="font-medium">{req.group.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              ({req.group.type})
                            </span>
                            {/* Hiển thị thêm thông tin timing nếu khác mặc định */}
                            {(req.startDelay > 0 || req.usageDuration !== null) && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {req.startDelay > 0 && <span>Bắt đầu sau {req.startDelay}p</span>}
                                {req.usageDuration !== null && <span> • Dùng {req.usageDuration}p</span>}
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            x{req.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Dịch vụ này không yêu cầu tài nguyên đặc biệt.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  } catch (error) {
    console.error("Error loading service detail:", error)
    notFound()
  }
}
