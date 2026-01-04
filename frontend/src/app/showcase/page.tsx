"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/shared/ui/alert-dialog"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Separator } from "@/shared/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/ui/sheet"
import { Skeleton } from "@/shared/ui/skeleton"
import { Switch } from "@/shared/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { useState } from "react"

export default function ShowcasePage() {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="grid gap-4 p-4">
      <div className="border p-4">
        <h1 className="text-2xl font-bold">Shadcn/UI Components Showcase</h1>
        <p className="text-muted-foreground">Demo các component đã cài đặt</p>
      </div>

      <Tabs defaultValue="buttons">
        <TabsList>
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="data">Data Display</TabsTrigger>
          <TabsTrigger value="overlays">Overlays</TabsTrigger>
        </TabsList>

        <TabsContent value="buttons" className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Các variant của Button component</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button disabled>Disabled</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>Hiển thị trạng thái và labels</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms" className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Controls</CardTitle>
              <CardDescription>Input, Select, Switch components</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Tên</Label>
                <Input id="name" placeholder="Nhập tên của bạn" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Vai trò</Label>
                <Select>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Quản lý</SelectItem>
                    <SelectItem value="receptionist">Lễ tân</SelectItem>
                    <SelectItem value="technician">Kỹ thuật viên</SelectItem>
                    <SelectItem value="customer">Khách hàng</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Switch id="notifications" />
                <Label htmlFor="notifications">Nhận thông báo</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Table</CardTitle>
              <CardDescription>Hiển thị dữ liệu dạng bảng</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Nguyễn Văn A</TableCell>
                    <TableCell>Quản lý</TableCell>
                    <TableCell><Badge>Hoạt động</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Trần Thị B</TableCell>
                    <TableCell>Lễ tân</TableCell>
                    <TableCell><Badge variant="secondary">Nghỉ</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Lê Văn C</TableCell>
                    <TableCell>Kỹ thuật viên</TableCell>
                    <TableCell><Badge>Hoạt động</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skeleton Loading</CardTitle>
              <CardDescription>Placeholder khi đang tải dữ liệu</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overlays" className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Dialogs & Sheets</CardTitle>
              <CardDescription>Modal và side panel components</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Xóa dữ liệu</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa vĩnh viễn.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction>Xác nhận</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Sheet>
                <SheetTrigger asChild>
                  <Button>Mở Sheet</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Thông tin chi tiết</SheetTitle>
                    <SheetDescription>
                      Nội dung form hoặc thông tin sẽ hiển thị ở đây
                    </SheetDescription>
                  </SheetHeader>
                  <div className="grid gap-4 p-4">
                    <div className="grid gap-2">
                      <Label>Tên dịch vụ</Label>
                      <Input placeholder="Nhập tên dịch vụ" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Thời gian (phút)</Label>
                      <Input type="number" placeholder="60" />
                    </div>
                    <Button>Lưu</Button>
                  </div>
                </SheetContent>
              </Sheet>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Separator</CardTitle>
              <CardDescription>Đường phân cách nội dung</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>Phần 1</div>
              <Separator />
              <div>Phần 2</div>
              <Separator />
              <div>Phần 3</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
