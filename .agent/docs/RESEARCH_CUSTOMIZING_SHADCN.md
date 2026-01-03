# NGHIÊN CỨU: CUSTOMIZING SHADCN/UI (THE RIGHT WAY)
**(Updated: 2026-01-03)**

Bạn hoàn toàn CÓ THỂ custom shadcn/ui. Câu nói "Don't modify" nên hiểu là **"Đừng sửa code nếu không cần thiết"** (để giữ khả năng maintain).

Dưới đây là 3 cấp độ customization, từ nhẹ đến nặng:

## LEVEL 1: OVERRIDE BẰNG `className` (Khuyên dùng 90%)
Shadcncomponents được thiết kế để nhận prop `className` và merge nó với tailwind-merge.

**Khi nào dùng:** Sửa padding, margin, màu sắc cho một trường hợp cụ thể.

```tsx
// ❌ Đừng sửa file button.tsx chỉ để thêm margin
// ✅ Hãy dùng className trực tiếp
<Button className="mt-4 bg-red-500 hover:bg-red-600">Delete</Button>
```

## LEVEL 2: COMPONENT COMPOSITION (Khuyên dùng)
Tự tạo component mới bao bọc (wrap) shadcn component. Phương pháp này giữ component gốc sạch sẽ.

**Khi nào dùng:** Khi bạn muốn tái sử dụng một kiểu style đặc biệt cho nhiều nơi.

```tsx
// features/auth/components/google-login-button.tsx
import { Button } from "@/shared/ui/button"

export function GoogleLoginButton() {
  return (
    <Button variant="outline" className="w-full gap-2 font-bold">
      <Icons.google className="h-4 w-4" />
      Sign in with Google
    </Button>
  )
}
```

## LEVEL 3: SỬA FILE GỐC (`shared/ui/...`)
Shadcn không phải là thư viện npm đóng gói. Code là của bạn. Bạn **ĐƯỢC PHÉP** sửa file gốc để cấu hình Design System toàn cục.

**Khi nào dùng:**
1.  **Thêm Variant mới**: Ví dụ thêm size `xl` hoặc variant `ghost-danger` cho Button.
2.  **Sửa Base Style**: Ví dụ muốn tất cả Input đều có `rounded-full` thay vì `rounded-md`.

### Cách làm đúng (Sử dụng `cva`):

```tsx
// shared/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center...", // Base styles
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground...",
        // ✅ THÊM CUSTOM VARIANT CỦA BẠN:
        danger: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        default: "h-10 px-4 py-2",
        // ✅ THÊM CUSTOM SIZE:
        xl: "h-14 px-8 text-lg",
      },
    },
    defaultVariants: { ... }
  }
)
```

## TỔNG KẾT: QUY TẮC "THÔNG MINH"
1.  **Ưu tiên 1**: Dùng `className` cho thay đổi nhỏ, cục bộ.
2.  **Ưu tiên 2**: Dùng Composition (Wrapper Component) cho các pattern tái sử dụng.
3.  **Ưu tiên 3**: Chỉ sửa file trong `shared/ui` khi muốn thay đổi **Hệ thống Design** (thêm variants, đổi base style toàn app).

**Điều cấm kỵ:** Sửa logic xử lý (ví dụ: sửa cách `Calendar` tính ngày) - việc này sẽ khiến bạn khó update code mới từ shadcn sau này.
