"use client"

import * as UI from "@/shared/ui"
import { Calendar as CalendarIcon, Home, Loader2, Plus, Slash, User } from "lucide-react"
import * as React from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

export default function CompleteRawInventory() {
    const form = useForm({
        defaultValues: {
            username: "",
        },
    })
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', color: '#1a1a1a' }}>
            <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Full UI Component Audit</h1>
            <p style={{ color: '#666', marginBottom: '40px' }}>Toàn bộ 29 components trong <code>shared/ui</code> (không bỏ sót bất kỳ cái nào).</p>

            <hr style={{ border: 'none', borderTop: '2px solid #eee', marginBottom: '60px' }} />

            {/* 1. Avatar */}
            <Section title="1. Avatar">
                <UI.Avatar>
                    <UI.AvatarImage src="https://github.com/shadcn.png" />
                    <UI.AvatarFallback>CN</UI.AvatarFallback>
                </UI.Avatar>
            </Section>

            {/* 2. Badge */}
            <Section title="2. Badge">
                <div style={{ display: 'flex', gap: '8px' }}>
                    <UI.Badge>Default</UI.Badge>
                    <UI.Badge variant="secondary">Secondary</UI.Badge>
                    <UI.Badge variant="outline">Outline</UI.Badge>
                    <UI.Badge variant="destructive">Destructive</UI.Badge>
                </div>
            </Section>

            {/* 3. Breadcrumb */}
            <Section title="3. Breadcrumb">
                <UI.Breadcrumb>
                    <UI.BreadcrumbList>
                        <UI.BreadcrumbItem>
                            <UI.BreadcrumbLink href="/">Home</UI.BreadcrumbLink>
                        </UI.BreadcrumbItem>
                        <UI.BreadcrumbSeparator><Slash className="w-4 h-4" /></UI.BreadcrumbSeparator>
                        <UI.BreadcrumbItem>
                            <UI.BreadcrumbLink href="/components">Components</UI.BreadcrumbLink>
                        </UI.BreadcrumbItem>
                        <UI.BreadcrumbSeparator><Slash className="w-4 h-4" /></UI.BreadcrumbSeparator>
                        <UI.BreadcrumbItem>
                            <UI.BreadcrumbPage>Full Audit</UI.BreadcrumbPage>
                        </UI.BreadcrumbItem>
                    </UI.BreadcrumbList>
                </UI.Breadcrumb>
            </Section>

            {/* 4. Button */}
            <Section title="4. Button">
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <UI.Button>Default</UI.Button>
                    <UI.Button variant="secondary">Secondary</UI.Button>
                    <UI.Button variant="destructive">Destructive</UI.Button>
                    <UI.Button variant="outline">Outline</UI.Button>
                    <UI.Button variant="ghost">Ghost</UI.Button>
                    <UI.Button variant="link">Link</UI.Button>
                    <UI.Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading</UI.Button>
                </div>
            </Section>

            {/* 5. Calendar */}
            <Section title="5. Calendar">
                <div style={{ border: '1px solid #ddd', width: 'fit-content', borderRadius: '8px' }}>
                    <UI.Calendar mode="single" selected={mounted ? new Date() : undefined} className="rounded-md border" />
                </div>
            </Section>

            {/* 6. Card */}
            <Section title="6. Card">
                <UI.Card style={{ width: '350px' }}>
                    <UI.CardHeader>
                        <UI.CardTitle>Tiêu đề Card</UI.CardTitle>
                        <UI.CardDescription>Đây là mô tả chi tiết của card component.</UI.CardDescription>
                    </UI.CardHeader>
                    <UI.CardContent>Nội dung chính nằm ở đây.</UI.CardContent>
                    <UI.CardFooter>Phần chân trang của Card.</UI.CardFooter>
                </UI.Card>
            </Section>

            {/* 7. Chart */}
            <Section title="7. Chart">
                <p style={{ fontSize: '12px', color: '#888' }}>(Sử dụng Chart Container thô)</p>
                <UI.ChartContainer config={{}} className="h-[100px] w-[200px] border">
                    <div style={{ padding: '10px' }}>Chart Placeholder</div>
                </UI.ChartContainer>
            </Section>

            {/* 8. Checkbox */}
            <Section title="8. Checkbox">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UI.Checkbox id="terms" />
                    <UI.Label htmlFor="terms">Chấp nhận điều khoản</UI.Label>
                </div>
            </Section>

            {/* 9. Command */}
            <Section title="9. Command">
                <div style={{ border: '1px solid #ddd', borderRadius: '8px', maxWidth: '400px' }}>
                    <UI.Command>
                        <UI.CommandInput placeholder="Tìm kiếm lệnh..." />
                        <UI.CommandList>
                            <UI.CommandEmpty>Không tìm thấy kết quả.</UI.CommandEmpty>
                            <UI.CommandGroup heading="Gợi ý">
                                <UI.CommandItem><CalendarIcon className="mr-2 h-4 w-4" /> <span>Lịch</span></UI.CommandItem>
                                <UI.CommandItem><User className="mr-2 h-4 w-4" /> <span>Người dùng</span></UI.CommandItem>
                            </UI.CommandGroup>
                        </UI.CommandList>
                    </UI.Command>
                </div>
            </Section>

            {/* 10. Data Table Faceted Filter */}
            <Section title="10. Data Table Faceted Filter">
                <p style={{ fontSize: '12px', color: '#888' }}>(Dùng trong bảng dữ liệu phức tạp)</p>
                <UI.Popover>
                    <UI.PopoverTrigger asChild>
                        <UI.Button variant="outline" size="sm" className="h-8 border-dashed">
                            <Plus className="mr-2 h-4 w-4" /> Status
                        </UI.Button>
                    </UI.PopoverTrigger>
                </UI.Popover>
            </Section>

            {/* 11. DateTimePicker */}
            <Section title="11. DateTimePicker">
                <div style={{ maxWidth: '300px' }}>
                    {/* <UI.DateTimePicker /> - Component not yet exported */}
                    <p style={{ color: '#888', fontSize: '12px' }}>DateTimePicker component not available</p>
                </div>
            </Section>

            {/* 12. Dialog */}
            <Section title="12. Dialog">
                <UI.Dialog>
                    <UI.DialogTrigger asChild><UI.Button variant="outline">Mở Dialog</UI.Button></UI.DialogTrigger>
                    <UI.DialogContent>
                        <UI.DialogHeader>
                            <UI.DialogTitle>Xác nhận</UI.DialogTitle>
                            <UI.DialogDescription>Bạn có chắc chắn muốn thực hiện hành động này?</UI.DialogDescription>
                        </UI.DialogHeader>
                        <UI.DialogFooter><UI.Button>Đồng ý</UI.Button></UI.DialogFooter>
                    </UI.DialogContent>
                </UI.Dialog>
            </Section>

            {/* 13. Dropdown Menu */}
            <Section title="13. Dropdown Menu">
                <UI.DropdownMenu>
                    <UI.DropdownMenuTrigger asChild><UI.Button variant="outline">Mở Menu</UI.Button></UI.DropdownMenuTrigger>
                    <UI.DropdownMenuContent>
                        <UI.DropdownMenuLabel>Tài khoản</UI.DropdownMenuLabel>
                        <UI.DropdownMenuSeparator />
                        <UI.DropdownMenuItem>Cài đặt</UI.DropdownMenuItem>
                        <UI.DropdownMenuItem>Hỗ trợ</UI.DropdownMenuItem>
                    </UI.DropdownMenuContent>
                </UI.DropdownMenu>
            </Section>

            {/* 14. Form */}
            <Section title="14. Form">
                <p style={{ fontSize: '12px', color: '#888' }}>(Cấu trúc FormItem, FormLabel, FormMessage - Cần Form Context)</p>
                <div style={{ maxWidth: '300px', border: '1px solid #eee', padding: '15px' }}>
                    <UI.Form {...form}>
                        <UI.FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <UI.FormItem>
                                    <UI.FormLabel>Tên người dùng</UI.FormLabel>
                                    <UI.FormControl>
                                        <UI.Input placeholder="Nhập tên..." {...field} />
                                    </UI.FormControl>
                                    <UI.FormDescription>Đây là tên hiển thị công khai.</UI.FormDescription>
                                    <UI.FormMessage />
                                </UI.FormItem>
                            )}
                        />
                    </UI.Form>
                </div>
            </Section>

            {/* 15. Input */}
            <Section title="15. Input">
                <div style={{ maxWidth: '300px' }}>
                    <UI.Input type="email" placeholder="Email" />
                </div>
            </Section>

            {/* 16. Label */}
            <Section title="16. Label">
                <UI.Label>Nhãn văn bản (Label)</UI.Label>
            </Section>

            {/* 17. MultiSelect */}
            <Section title="17. MultiSelect">
                <div style={{ maxWidth: '400px' }}>
                    {/* <UI.MultiSelect ... /> - Component available in shared/components, not shared/ui */}
                    <p style={{ color: '#888', fontSize: '12px' }}>MultiSelect is in shared/components not shared/ui</p>
                </div>
            </Section>

            {/* 18. Popover */}
            <Section title="18. Popover">
                <UI.Popover>
                    <UI.PopoverTrigger asChild><UI.Button variant="outline">Mở Popover</UI.Button></UI.PopoverTrigger>
                    <UI.PopoverContent>Nội dung bật lên tại đây.</UI.PopoverContent>
                </UI.Popover>
            </Section>

            {/* 19. Scroll Area */}
            <Section title="19. Scroll Area">
                <UI.ScrollArea style={{ height: '100px', width: '200px', border: '1px solid #ddd', padding: '10px' }}>
                    Dòng 1<br/>Dòng 2<br/>Dòng 3<br/>Dòng 4<br/>Dòng 5<br/>Dòng 6<br/>Dòng 7
                </UI.ScrollArea>
            </Section>

            {/* 20. Select */}
            <Section title="20. Select">
                <UI.Select>
                    <UI.SelectTrigger style={{ width: '180px' }}>
                        <UI.SelectValue placeholder="Chọn vai trò" />
                    </UI.SelectTrigger>
                    <UI.SelectContent>
                        <UI.SelectItem value="admin">Quản trị viên</UI.SelectItem>
                        <UI.SelectItem value="staff">Nhân viên</UI.SelectItem>
                    </UI.SelectContent>
                </UI.Select>
            </Section>

            {/* 21. Separator */}
            <Section title="21. Separator">
                <div style={{ width: '200px' }}>
                    <span>Trên</span>
                    <UI.Separator style={{ margin: '10px 0' }} />
                    <span>Dưới</span>
                </div>
            </Section>

            {/* 22. Sheet */}
            <Section title="22. Sheet">
                <UI.Sheet>
                    <UI.SheetTrigger asChild><UI.Button variant="outline">Mở Sheet</UI.Button></UI.SheetTrigger>
                    <UI.SheetContent>
                        <UI.SheetHeader>
                            <UI.SheetTitle>Bảng bên</UI.SheetTitle>
                            <UI.SheetDescription>Nội dung trượt từ cạnh màn hình.</UI.SheetDescription>
                        </UI.SheetHeader>
                    </UI.SheetContent>
                </UI.Sheet>
            </Section>

            {/* 23. Sidebar */}
            <Section title="23. Sidebar">
                <p style={{ fontSize: '12px', color: '#888' }}>(Sử dụng Sidebar Menu Skeleton để kiểm tra UI thô)</p>
                <div style={{ width: '200px', border: '1px solid #eee', padding: '10px' }}>
                    <UI.SidebarMenuSkeleton />
                </div>
            </Section>

            {/* 24. Skeleton */}
            <Section title="24. Skeleton">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UI.Skeleton style={{ height: '40px', width: '40px', borderRadius: '50%' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <UI.Skeleton style={{ height: '12px', width: '150px' }} />
                        <UI.Skeleton style={{ height: '12px', width: '100px' }} />
                    </div>
                </div>
            </Section>

            {/* 25. Sonner */}
            <Section title="25. Sonner (Toast)">
                <UI.Toaster />
                <UI.Button variant="outline" onClick={() => toast("Đã kích hoạt thông báo!")}>
                    Click để Test Toast (Sonner)
                </UI.Button>
            </Section>

            {/* 26. Switch */}
            <Section title="26. Switch">
                <UI.Switch id="airplane-mode" />
            </Section>

            {/* 27. Table */}
            <Section title="27. Table">
                <UI.Table>
                    <UI.TableHeader>
                        <UI.TableRow>
                            <UI.TableHead>HĐ</UI.TableHead>
                            <UI.TableHead>Khách hàng</UI.TableHead>
                            <UI.TableHead className="text-right">Số tiền</UI.TableHead>
                        </UI.TableRow>
                    </UI.TableHeader>
                    <UI.TableBody>
                        <UI.TableRow>
                            <UI.TableCell className="font-medium">INV001</UI.TableCell>
                            <UI.TableCell>Nguyễn Văn A</UI.TableCell>
                            <UI.TableCell className="text-right">250.000₫</UI.TableCell>
                        </UI.TableRow>
                    </UI.TableBody>
                </UI.Table>
            </Section>

            {/* 28. Tabs */}
            <Section title="28. Tabs">
                <UI.Tabs defaultValue="account" style={{ width: '400px' }}>
                    <UI.TabsList>
                        <UI.TabsTrigger value="account">Tài khoản</UI.TabsTrigger>
                        <UI.TabsTrigger value="password">Bảo mật</UI.TabsTrigger>
                    </UI.TabsList>
                    <UI.TabsContent value="account">Chỉnh sửa thông tin tài khoản.</UI.TabsContent>
                    <UI.TabsContent value="password">Thay đổi mật khẩu đăng nhập.</UI.TabsContent>
                </UI.Tabs>
            </Section>

            {/* 29. Tooltip */}
            <Section title="29. Tooltip">
                <UI.TooltipProvider>
                    <UI.Tooltip>
                        <UI.TooltipTrigger asChild>
                            <UI.Button variant="outline" size="icon"><Home className="h-4 w-4" /></UI.Button>
                        </UI.TooltipTrigger>
                        <UI.TooltipContent><p>Quay lại trang chủ</p></UI.TooltipContent>
                    </UI.Tooltip>
                </UI.TooltipProvider>
            </Section>

        </div>
    )
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: '50px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#f9f9f9', padding: '12px 20px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>
                {title}
            </div>
            <div style={{ padding: '20px' }}>
                {children}
            </div>
        </div>
    )
}
