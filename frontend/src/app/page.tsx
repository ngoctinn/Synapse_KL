  import { Badge } from "@/shared/ui/badge";
  import { Button } from "@/shared/ui/button";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
  import { Input } from "@/shared/ui/input";
  import { Label } from "@/shared/ui/label";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

  export default function Home() {
    return (
      <main className="min-h-screen p-8 md:p-16 lg:p-24">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Synapse Spa Management
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">
            Chào mừng đến Synapse
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hệ thống quản lý và chăm sóc khách hàng spa hiện đại,
            được thiết kế để mang lại trải nghiệm thư giãn tuyệt vời.
          </p>
        </div>

        <section className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Xem trước Theme</CardTitle>
              <CardDescription>
                Bảng màu Synapse Spa - Lấy cảm hứng từ văn hóa Việt Nam
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="space-y-2">
                  <div className="h-16 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                    Primary
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Sage Green</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded-lg bg-secondary flex items-center justify-center text-secondary-foreground text-sm font-medium">
                    Secondary
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Warm Cream</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded-lg bg-accent flex items-center justify-center text-accent-foreground text-sm font-medium">
                    Accent
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Soft Gold</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm font-medium">
                    Muted
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Lavender</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded-lg bg-destructive flex items-center justify-center text-white text-sm font-medium">
                    Destructive
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Coral Red</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Các biến thể Button</h3>
                <div className="flex flex-wrap gap-3">
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thành phần UI</CardTitle>
              <CardDescription>
                Các thành phần UI được tối ưu cho spa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="services" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="services">Dịch vụ</TabsTrigger>
                  <TabsTrigger value="staff">Nhân viên</TabsTrigger>
                  <TabsTrigger value="appointments">Lịch hẹn</TabsTrigger>
                </TabsList>
                <TabsContent value="services" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 pt-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Massage Thư Giãn</CardTitle>
                        <CardDescription>60 phút • 500.000₫</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Badge>Phổ biến</Badge>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Chăm sóc Da Mặt</CardTitle>
                        <CardDescription>90 phút • 800.000₫</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="secondary">Cao cấp</Badge>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="staff" className="pt-4">
                  <p className="text-muted-foreground">Quản lý nhân viên spa...</p>
                </TabsContent>
                <TabsContent value="appointments" className="pt-4">
                  <p className="text-muted-foreground">Quản lý lịch hẹn...</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Biểu mẫu Demo</CardTitle>
              <CardDescription>
                Input và form components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input id="name" placeholder="Nguyễn Văn A" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input id="phone" placeholder="0901 234 567" />
                </div>
              </div>
              <Button className="w-full md:w-auto">
                Đặt lịch hẹn
              </Button>
            </CardContent>
          </Card>
        </section>

        <footer className="text-center mt-16 text-sm text-muted-foreground">
          <p>© 2025 Synapse Spa Management System</p>
          <p className="mt-1">Thiết kế tại Việt Nam</p>
        </footer>
      </main>
    );
  }
