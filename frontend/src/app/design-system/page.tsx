"use client"

import { AlertCircle, Check, X } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { PageHeader } from "@/shared/components/page-header"
import { DataTable } from "@/shared/components/smart-data-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/shared/ui/card"
import { Checkbox } from "@/shared/ui/checkbox"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { MultiSelect } from "@/shared/ui/multi-select"
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group"
import { SearchInput } from "@/shared/ui/search-input"
import {
    Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue
} from "@/shared/ui/select"
import { Separator } from "@/shared/ui/separator"
import { Skeleton } from "@/shared/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip"

interface User {
  id: string
  name: string
  role: string
  status: "active" | "inactive" | "pending"
  email: string
  phone: string
  department: string
  joinDate: string
  salary: string
  address: string
}

// Tạo dữ liệu mẫu 50 người dùng với nhiều cột để demo scroll ngang
const FIRST_NAMES = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Đỗ", "Vũ", "Bùi", "Phan", "Đặng"]
const MIDDLE_NAMES = ["Văn", "Thị", "Hữu", "Minh", "Quốc", "Thanh", "Bảo", "Ngọc"]
const LAST_NAMES = ["An", "Bình", "Cường", "Dũng", "Em", "Phúc", "Gia", "Hùng", "Khang", "Long", "Minh", "Nam", "Phong", "Quân", "Sơn", "Tùng", "Uy", "Vinh", "Xuân", "Yến"]
const ROLES = ["Quản trị viên", "Kỹ thuật viên", "Lễ tân"]
const STATUSES: ("active" | "pending" | "inactive")[] = ["active", "pending", "inactive"]
const DEPARTMENTS = ["Massage", "Chăm sóc da", "Làm móng", "Tóc", "Makeup"]
const ADDRESSES = ["Q.1, TP.HCM", "Q.3, TP.HCM", "Q.7, TP.HCM", "Thủ Đức", "Bình Thạnh", "Tân Bình"]

const MOCK_USERS: User[] = Array.from({ length: 50 }, (_, i) => ({
  id: String(i + 1),
  name: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${MIDDLE_NAMES[i % MIDDLE_NAMES.length]} ${LAST_NAMES[i % LAST_NAMES.length]}`,
  role: ROLES[i % ROLES.length],
  status: STATUSES[i % STATUSES.length],
  email: `user${i + 1}@spa-synapse.vn`,
  phone: `090${1000000 + i}`,
  department: DEPARTMENTS[i % DEPARTMENTS.length],
  joinDate: `${String((i % 28) + 1).padStart(2, "0")}/${String((i % 12) + 1).padStart(2, "0")}/2024`,
  salary: `${15 + (i % 10)}`,
  address: ADDRESSES[i % ADDRESSES.length],
}))

export default function DesignSystemShowcase() {
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(5)
  const [selectedServices, setSelectedServices] = React.useState<string[]>(["massage", "facial"])

  // Options cho MultiSelect demo
  const serviceOptions = [
    { label: "Massage", value: "massage" },
    { label: "Facial", value: "facial" },
    { label: "Manicure", value: "manicure" },
    { label: "Pedicure", value: "pedicure" },
    { label: "Hair Treatment", value: "hair" },
  ]

  // Data cho trang hiện tại
  const paginatedData = MOCK_USERS.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <div className="container mx-auto space-y-10 py-10">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">System Design Showcase</h1>
        <p className="text-muted-foreground text-lg">
          Reference components aligned with Medical Dashboard Guidelines (v2025).
        </p>
        <Separator />
      </div>

      {/* 0. TYPOGRAPHY */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">0. Typography</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Headlines</CardTitle>
              <CardDescription>Font: Inter, Bold weight</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">H1 - 72px, Bold, -2% tracking</p>
                <h1 className="text-7xl font-bold tracking-tight">Synapse</h1>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">H2 - 64px, Bold</p>
                <h2 className="text-6xl font-bold">Dashboard</h2>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">H3 - 48px, Bold</p>
                <h3 className="text-5xl font-bold">Services</h3>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">H4 - 32px, Bold</p>
                <h4 className="text-3xl font-bold">Booking</h4>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Body & Text Styles</CardTitle>
              <CardDescription>Various text sizes and weights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">Subtitle - 24px, Semibold</p>
                <p className="text-2xl font-semibold">Subtitle Text</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">Body - 14px, Medium (150% line height)</p>
                <p className="text-sm font-medium leading-relaxed">Body text is used for paragraphs and main content. This is how regular text appears throughout the application.</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">Small - 12px, Regular</p>
                <p className="text-xs">Small text for captions and descriptions</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">Pre-title - 14px, Bold (uppercase)</p>
                <p className="text-sm font-bold uppercase tracking-wide">Pre-title Label</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 0.5 COLOR PALETTE */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">0.5 Color Palette</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Neutral Colors</CardTitle>
              <CardDescription>Text Primary scale from Neutral_100 to Neutral_0</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 [&>div]:border">
                <div className="size-10 rounded bg-[#102027]" title="Neutral_100" />
                <div className="size-10 rounded bg-[#263238]" title="Neutral_90" />
                <div className="size-10 rounded bg-[#37474F]" title="Neutral_80" />
                <div className="size-10 rounded bg-[#455A64]" title="Neutral_70" />
                <div className="size-10 rounded bg-[#546E7A]" title="Neutral_60" />
                <div className="size-10 rounded bg-[#607D8B]" title="Neutral_50" />
                <div className="size-10 rounded bg-[#78909C]" title="Neutral_40" />
                <div className="size-10 rounded bg-[#90A4AE]" title="Neutral_30" />
                <div className="size-10 rounded bg-[#B0BEC5]" title="Neutral_20" />
                <div className="size-10 rounded bg-[#CFD8DC]" title="Neutral_10" />
              </div>
              <div className="text-xs text-muted-foreground">
                100 → 10: #102027 → #CFD8DC
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Background Colors</CardTitle>
              <CardDescription>Interface Grey variants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-4">
                <div className="space-y-1 text-center">
                  <div className="size-16 rounded border bg-[#F2F8F9]" />
                  <p className="text-xs font-medium">Pale Grey</p>
                  <p className="text-xs text-muted-foreground">#F2F8F9</p>
                </div>
                <div className="space-y-1 text-center">
                  <div className="size-16 rounded border bg-[#F7FCFC]" />
                  <p className="text-xs font-medium">Neutral Grey</p>
                  <p className="text-xs text-muted-foreground">#F7FCFC</p>
                </div>
                <div className="space-y-1 text-center">
                  <div className="size-16 rounded border bg-[#F0F9F9]" />
                  <p className="text-xs font-medium">Hover Grey (Accent)</p>
                  <p className="text-xs text-muted-foreground">#F0F9F9</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Semantic Colors</CardTitle>
              <CardDescription>Primary, Destructive, Alert colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-4">
                <div className="space-y-1 text-center">
                  <div className="size-12 rounded bg-primary" title="#0097A7" />
                  <p className="text-xs font-medium">Primary</p>
                </div>
                <div className="space-y-1 text-center">
                  <div className="size-12 rounded bg-destructive" title="#DC2626" />
                  <p className="text-xs font-medium">Destructive</p>
                </div>
                <div className="space-y-1 text-center">
                  <div className="size-12 rounded bg-[#2E7D32]" />
                  <p className="text-xs font-medium">Success</p>
                </div>
                <div className="space-y-1 text-center">
                  <div className="size-12 rounded bg-[#F57F17]" />
                  <p className="text-xs font-medium">Warning</p>
                </div>
                <div className="space-y-1 text-center">
                  <div className="size-12 rounded bg-[#4DD0E1]" />
                  <p className="text-xs font-medium">Info</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 1. BUTTONS */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Buttons</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>Contained (Primary), Outlined, Texted (Ghost), Secondary, Destructive</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button>Contained</Button>
              <Button variant="outline">Outlined</Button>
              <Button variant="ghost">Texted</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Button States</CardTitle>
              <CardDescription>Enabled, Disabled, Processing (Loading)</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-4">
              <Button>Enabled</Button>
              <Button disabled>Disabled</Button>
              <Button loading>Processing</Button>
              <Button variant="outline" loading>Loading</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Button Sizes</CardTitle>
              <CardDescription>sm (h-9), default (h-12 / 48px), lg (h-14)</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small (h-9)</Button>
              <Button size="default">Default (h-12)</Button>
              <Button size="lg">Large (h-14)</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Icon Buttons</CardTitle>
              <CardDescription>icon-sm (size-9), icon (size-12), icon-lg (size-14)</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-4">
              <Button size="icon-sm" variant="outline"><Check className="size-4" /></Button>
              <Button size="icon"><Check className="size-4" /></Button>
              <Button size="icon-lg" variant="secondary"><Check className="size-5" /></Button>
              <Button size="icon" variant="ghost"><X className="size-4" /></Button>
              <Button size="icon" variant="destructive"><X className="size-4" /></Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 2. BADGES / CHIPS */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Chips & Badges</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Badge Variants</CardTitle>
              <CardDescription>9 variants với màu sắc khác nhau</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Badge variant="default">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="soft-error">Soft Error</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Badge Sizes</CardTitle>
              <CardDescription>sm, default, lg</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <Badge size="sm" variant="secondary">Small</Badge>
              <Badge size="default" variant="secondary">Default</Badge>
              <Badge size="lg" variant="secondary">Large</Badge>
              <Badge size="sm" variant="info">1:1</Badge>
              <Badge size="default" variant="outline">In Center</Badge>
              <Badge size="lg" variant="success">Personal training</Badge>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3. INPUTS & FORMS */}
        <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Inputs & Forms</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
            <CardHeader>
                <CardTitle>Input Sizes</CardTitle>
                <CardDescription>sm (h-10), default (h-12 / 48px), lg (h-14 / 56px)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="input-sm">Small Input (h-10)</Label>
                    <Input id="input-sm" size="sm" placeholder="Small input..." />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="input-default">Default Input (h-12) <span className="text-destructive">*</span></Label>
                    <Input id="input-default" placeholder="Default input..." />
                    <p className="text-muted-foreground text-xs">This is the description area</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="input-lg">Large Input (h-14)</Label>
                    <Input id="input-lg" size="lg" placeholder="Large input..." />
                </div>
            </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <CardTitle>Input States</CardTitle>
                <CardDescription>Static, Filled, Error, Disabled</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="input-filled">Filled</Label>
                    <Input id="input-filled" defaultValue="Nguyen Van A" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="input-error">Error State <span className="text-destructive">*</span></Label>
                    <Input id="input-error" placeholder="Invalid input..." aria-invalid={true} />
                    <p className="text-destructive text-xs">This is a message</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="input-disabled">Disabled</Label>
                    <Input id="input-disabled" placeholder="Cannot type..." disabled />
                </div>
            </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <CardTitle>Search Bar & Messages</CardTitle>
                <CardDescription>Default, Focused, Error, Success, Warning states</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Default Search</Label>
                    <SearchInput placeholder="Search..." />
                </div>
                <div className="space-y-2">
                    <Label>Error Search</Label>
                    <SearchInput placeholder="Search..." state="error" />
                    <p className="text-destructive text-xs">This is a message</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="secondary">Disable</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="error">Error</Badge>
                    <Badge variant="warning">Warning</Badge>
                </div>
            </CardContent>
            </Card>

            <Card>
             <CardHeader>
                <CardTitle>Select Sizes</CardTitle>
                <CardDescription>sm (h-10), default (h-12), lg (h-14)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Small Select (h-10)</Label>
                    <Select>
                        <SelectTrigger size="sm" className="w-full">
                            <SelectValue placeholder="Chọn..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="opt1">Option 1</SelectItem>
                            <SelectItem value="opt2">Option 2</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Default Select (h-12)</Label>
                    <Select>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn ca làm việc..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Thời gian</SelectLabel>
                                <SelectItem value="am">Ca sáng</SelectItem>
                                <SelectItem value="pm">Ca chiều</SelectItem>
                                <SelectItem value="night">Ca đêm</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Large Select (h-14)</Label>
                    <Select>
                        <SelectTrigger size="lg" className="w-full">
                            <SelectValue placeholder="Chọn..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="opt1">Option 1</SelectItem>
                            <SelectItem value="opt2">Option 2</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <CardTitle>Multi-Select</CardTitle>
                <CardDescription>Chọn nhiều mục với checkboxes và tags</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Dịch vụ (đã chọn: {selectedServices.length})</Label>
                    <MultiSelect
                      options={serviceOptions}
                      selected={selectedServices}
                      onChange={setSelectedServices}
                      placeholder="Chọn dịch vụ..."
                    />
                </div>
                <div className="space-y-2">
                    <Label>Empty Multi-Select</Label>
                    <MultiSelect
                      options={serviceOptions}
                      selected={[]}
                      onChange={() => {}}
                      placeholder="Chọn các mục..."
                    />
                </div>
            </CardContent>
            </Card>
        </div>
      </section>

      {/* 4. TABS */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Navigation Tabs</h2>
         <Card>
            <CardHeader>
                <CardTitle>Tab Bar (Segmented & Outline)</CardTitle>
                <CardDescription>High contrast active state for clear navigation.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="schedule" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                        <TabsTrigger value="schedule">Giờ định kỳ</TabsTrigger>
                        <TabsTrigger value="exception">Ngày ngoại lệ</TabsTrigger>
                    </TabsList>
                    <TabsContent value="schedule" className="mt-4 rounded-lg border border-dashed p-4">
                        Schedule Content...
                    </TabsContent>
                    <TabsContent value="exception" className="mt-4 rounded-lg border border-dashed p-4">
                         Exception Content...
                    </TabsContent>
                </Tabs>
            </CardContent>
          </Card>
      </section>

      {/* 5. MISC COMPONENTS */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Miscellaneous Components</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Checkbox & Radio</CardTitle>
              <CardDescription>Các trạng thái unselected, selected, indeterminate và disabled</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Checkbox</Label>
                <div className="flex items-center gap-2">
                  <Checkbox id="checkbox-1" />
                  <Label htmlFor="checkbox-1">Unselected</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="checkbox-2" checked />
                  <Label htmlFor="checkbox-2">Selected</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="checkbox-3" data-state="indeterminate" />
                  <Label htmlFor="checkbox-3">Indeterminate</Label>
                </div>
                <div className="flex items-center gap-2 opacity-50">
                  <Checkbox id="checkbox-4" disabled />
                  <Label htmlFor="checkbox-4">Inactive Unselected</Label>
                </div>
                <div className="flex items-center gap-2 opacity-50">
                  <Checkbox id="checkbox-5" disabled checked />
                  <Label htmlFor="checkbox-5">Inactive Selected</Label>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Radio Group</Label>
                <RadioGroup defaultValue="r1">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="r1" id="r1" />
                    <Label htmlFor="r1">Selected</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="r2" id="r2" />
                    <Label htmlFor="r2">Unselected</Label>
                  </div>
                  <div className="flex items-center gap-2 opacity-50">
                    <RadioGroupItem value="r3" id="r3" disabled />
                    <Label htmlFor="r3">Inactive Unselected</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Avatar</CardTitle>
              <CardDescription>Kích thước mặc định: size-8 (32px), có thể tùy chỉnh</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar className="size-10">
                <AvatarImage src="https://github.com/vercel.png" alt="Avatar" />
                <AvatarFallback>VC</AvatarFallback>
              </Avatar>
              <Avatar className="size-12">
                <AvatarFallback>AB</AvatarFallback>
              </Avatar>
              <Avatar className="size-14">
                <AvatarFallback>XY</AvatarFallback>
              </Avatar>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skeleton</CardTitle>
              <CardDescription>Loading placeholder với animation pulse</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="size-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tooltip</CardTitle>
              <CardDescription>Hiển thị thông tin khi hover</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover me</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Đây là tooltip content</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <AlertCircle className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Thông tin bổ sung</p>
                </TooltipContent>
              </Tooltip>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 6. DATA TABLE & HEADER */}
      <section className="space-y-6 pb-20">
        <h2 className="text-2xl font-semibold">6. Data Table & Header</h2>

        <Card>
          <CardContent className="pt-6 space-y-6">
            <PageHeader
              title="Quản lý Lịch hẹn"
              subtitle="Theo dõi và điều chỉnh lịch hẹn của khách hàng trong hệ thống."
              actionLabel="Tạo lịch mới"
              onActionClick={() => alert("Tạo mới")}
            />

            <DataTable<User>
              onSelectionChange={(rows) => console.log("Selected:", rows)}
              columns={[
                { key: "no", label: "No", width: "60px" },
                { key: "selection", label: "", width: "50px" },
                {
                  key: "name",
                  label: "Họ và tên",
                  sortable: true,
                  filterable: true,
                  width: "180px"
                },
                {
                  key: "phone",
                  label: "Số điện thoại",
                  sortable: true,
                  width: "140px"
                },
                {
                  key: "email",
                  label: "Email",
                  sortable: true,
                  filterable: true,
                  width: "200px"
                },
                {
                  key: "department",
                  label: "Bộ phận",
                  sortable: true,
                  filterable: true,
                  width: "140px"
                },
                {
                  key: "role",
                  label: "Vai trò",
                  sortable: true,
                  filterable: true,
                  width: "140px"
                },
                {
                  key: "joinDate",
                  label: "Ngày vào làm",
                  sortable: true,
                  width: "130px"
                },
                {
                  key: "salary",
                  label: "Lương (triệu)",
                  sortable: true,
                  width: "120px",
                  render: (val) => <span className="font-medium">{String(val)} tr</span>
                },
                {
                  key: "address",
                  label: "Địa chỉ",
                  sortable: true,
                  width: "150px"
                },
                {
                  key: "status",
                  label: "Trạng thái",
                  sortable: true,
                  width: "130px",
                  render: (val) => {
                    const statusMap = {
                      active: { label: "Hoạt động", variant: "success" as const },
                      pending: { label: "Chờ duyệt", variant: "warning" as const },
                      inactive: { label: "Tạm dừng", variant: "soft-error" as const },
                    }
                    const config = statusMap[val as keyof typeof statusMap] || statusMap.active
                    return <Badge variant={config.variant}>{config.label}</Badge>
                  }
                },
                { key: "actions", label: "", width: "80px" }
              ]}
              data={paginatedData}
              pagination={{
                currentPage,
                pageSize,
                totalItems: MOCK_USERS.length,
                onPageChange: setCurrentPage,
                pageSizeOptions: [5, 10, 20],
                onPageSizeChange: (size) => {
                  setPageSize(size)
                  setCurrentPage(1)
                }
              }}
            />
          </CardContent>
        </Card>
      </section>

      {/* 9. TOASTS */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">9. Toasts (Sonner)</h2>
        <Card>
          <CardHeader>
            <CardTitle>Toast Notifications</CardTitle>
            <CardDescription>
              Flexible and customizable toast notifications using `sonner`.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button
              variant="outline"
              onClick={() => toast("Hành động đã được ghi nhận")}
            >
              Default
            </Button>
            <Button
              variant="outline"
              className="text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
              onClick={() => toast.success("Cập nhật thành công!", {
                description: "Dữ liệu mới đã được đồng bộ hóa."
              })}
            >
              Success
            </Button>
            <Button
              variant="outline"
              className="text-red-700 border-red-200 bg-red-50 hover:bg-red-100"
              onClick={() => toast.error("Đã xảy ra lỗi", {
                description: "Không thể kết nối đến máy chủ. Vui lòng thử lại."
              })}
            >
              Error
            </Button>
            <Button
              variant="outline"
              className="text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100"
              onClick={() => toast.warning("Cảnh báo hệ thống", {
                description: "Phiên làm việc sắp hết hạn."
              })}
            >
              Warning
            </Button>
            <Button
              variant="outline"
              className="text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100"
              onClick={() => toast.info("Thông tin mới", {
                description: "Có bản cập nhật phần mềm."
              })}
            >
              Info
            </Button>
            <Button
              variant="outline"
              onClick={() => toast("Hoàn tác hành động", {
                action: {
                  label: "Hoàn tác",
                  onClick: () => console.log("Undo"),
                },
              })}
            >
              With Action
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
