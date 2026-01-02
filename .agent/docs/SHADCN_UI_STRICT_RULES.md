# SHADCN_UI_STRICT_RULES (v2025.01)

## Quy tắc bắt buộc khi sử dụng Shadcn/UI trong dự án Synapse

### 1. TUYỆT ĐỐI HẠN CHẾ OVERRIDE
- **KHÔNG** override style lên các component mặc định của Shadcn.
- Sử dụng component "as-is" (nguyên bản) nhiều nhất có thể.
- Chỉ thêm className khi thực sự cần thiết và không làm thay đổi bản chất component.

### 2. KHÔNG TỰ Ý TẠO VARIANTS MỚI
- **KHÔNG** tự ý tạo Variants mới cho component trừ khi:
  - Thực sự cần thiết cho nghiệp vụ đặc thù.
  - Có sự phê duyệt từ USER.
- Nếu cần variant mới, phải đề xuất và chờ phê duyệt trước khi implement.

### 3. CẤU TRÚC COMPONENT CHUẨN
Sử dụng đúng cấu trúc mặc định của thư viện:

```tsx
// Card
<Card>
  <CardHeader>
    <CardTitle>...</CardTitle>
    <CardDescription>...</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>...</CardFooter>
</Card>

// Tabs
<Tabs>
  <TabsList>
    <TabsTrigger>...</TabsTrigger>
  </TabsList>
  <TabsContent>...</TabsContent>
</Tabs>
```

### 4. GIỮ NGUYÊN SPACING MẶC ĐỊNH ("AIRY")
- Giữ padding/margin mặc định của thư viện.
- **KHÔNG** ép "Compact" bằng các thủ thuật CSS inline:
  - `p-0`, `m-0` (xóa padding/margin)
  - `border-none` (xóa border)
  - `shadow-none` (xóa shadow)
  - `bg-transparent` (xóa background)
- Nếu mặc định là rộng, hãy để nó rộng theo đúng thiết kế gốc của Shadcn.

### 5. LÝ DO
- Tránh nợ kỹ thuật (technical debt) từ các override rải rác.
- Đảm bảo tính nhất quán UI toàn dự án.
- Dễ dàng upgrade Shadcn trong tương lai.
- Giảm bug liên quan đến style conflict.

---
**Ngày tạo**: 2025-01-02
**Phê duyệt bởi**: USER
