# PROJECT_UI_RULES_DEV.md

> Dự án: Synapse_KL
> Trạng thái: BẮT BUỘC ÁP DỤNG
> Phạm vi: DEV PHASE (Logic-first)

---

## 0. MỤC TIÊU

* Tối đa hóa tốc độ triển khai Business Logic
* Cố định UI semantics ngay từ đầu
* Loại bỏ hoàn toàn xao nhãng về UI/UX/Styling
* Tránh refactor UI làm ảnh hưởng logic về sau

---

## 1. NGÔN NGỮ & ĐẶT TÊN

* **UI Text**: 100% **Tiếng Việt**
* **Code Naming** (biến, hàm, class, file): 100% **Tiếng Anh**
* **Comment**:

  * Ngôn ngữ: **Tiếng Việt**
  * Chỉ giải thích **WHY** (Tại sao làm vậy)
  * KHÔNG giải thích **WHAT** (Code làm gì)

---

## 2. NGUYÊN TẮC: Context vs Focus

* **Ưu tiên dùng Sheet (Side panel)**:

  * Cho các thao tác Create / Edit nhanh.
  * Khi người dùng cần tham chiếu dữ liệu từ màn hình nền (giữ context).

* **Form có độ dài trung bình (scrolling chấp nhận được)**

* **Dùng Page riêng biệt**:

  * Khi Form quá phức tạp, nhiều cột, hoặc dạng Master-Detail.
  * Form có nhiều bước (Stepper/Wizard).
  * Cần không gian hiển thị tối đa để tập trung (Focus mode).

**TUYỆT ĐỐI KHÔNG**:

* Đặt Form trong Dialog thường (trừ trường hợp confirm có 1 input lý do).
* Dựng Form bằng div + state thủ công.

## 3. DIALOG RULE

* `Dialog` **KHÔNG dùng cho Form**
* CHỈ được phép dùng:

  * `AlertDialog` → Xác nhận hành động nguy hiểm (Delete, Reset, Irreversible)

---

## 4. COMPONENT SEMANTICS (SHADCN/UI)

* **BẮT BUỘC** dùng component chính danh của **shadcn/ui**
* Mỗi hành vi nghiệp vụ → đúng **01 loại component**

| Hành vi nghiệp vụ | Component bắt buộc              |
| ----------------- | ------------------------------- |
| Tạo / Sửa (CRUD)  | `Sheet` (Ưu tiên)                 |
| Nhập liệu         | `Input`, `Select` (qua Wrapper) |
| Xác nhận          | `AlertDialog`                   |
| Danh sách         | `Table`                         |
| Không có dữ liệu  | `EmptyState`                    |

**CẤM TUYỆT ĐỐI**

* Fake modal / fake form
* Workaround UI bằng `div`
* Dùng thẻ HTML trần (`input`, `select`) không wrapper

---

## 5. Form Pattern (React Hook Form + Shadcn)
**BẮT BUỘC**: Dùng `FormField` + `FormItem` + `FormControl` từ `@/shared/ui/form`.

### Pattern:
```tsx
import { useForm } from "react-hook-form"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/shared/ui/form"

const form = useForm<FormData>()

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="fieldName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Label</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

**CẤM**: Dùng `Controller` trực tiếp (trừ khi component không tương thích với FormField).

---

## 6. STYLING GUIDELINES (Shadcn/UI Best Practices)

### ✅ KHUYẾN KHÍCH

* **Shadcn Components**: Dùng `Card`, `Badge`, `Separator` theo thiết kế
* **Tailwind Utilities**: Layout (`flex`, `grid`), spacing (`gap-*`, `p-*`, `m-*`), colors (`text-*`, `bg-*`)
* **Responsive**: `sm:`, `md:`, `lg:` cho mobile-first design
* **States**: `hover:`, `focus:`, `data-[state]:` cho interactive elements
* **Semantic Classes**: `text-muted-foreground`, `text-destructive` (từ design tokens)

### ⚠️ TRÁNH

* **Inline Styles**: `style={{ ... }}` (dùng Tailwind thay thế)
* **Custom CSS Files**: Mỗi component 1 file CSS riêng (dùng `className`)
* **Override Base Styles**: Sửa trực tiếp `@/shared/ui/*` components (dùng `cn()` hoặc composition)
* **Magic Numbers**: `w-[237px]` (dùng design tokens: `w-full`, `w-1/2`)

### 🎯 MỤC TIÊU

* **Consistency**: UI nhất quán theo design system
* **Accessibility**: Màu sắc, contrast, keyboard navigation
* **Responsive**: Mobile-first, hoạt động tốt mọi màn hình
* **Maintainable**: Dễ đọc, dễ sửa, dễ scale

---

## 7. FORM BEST PRACTICES

### ✅ PATTERN CHUẨN

* **Form trong Sheet/Dialog**: Dùng cho create/edit actions
* **FormField + FormControl**: Bắt buộc cho tất cả inputs
* **Validation**: Zod schemas với error messages tiếng Việt
* **Loading States**: `isPending`, `isLoading` với visual feedback

### ⚠️ TRÁNH

* Form trực tiếp trong Page (dùng Sheet/Dialog)
* Uncontrolled inputs (phải dùng `react-hook-form`)
* Validation logic trong component (đặt trong schemas)

---

## 8. REVIEW CHECKLIST

PR cần đảm bảo:

* ✅ Component có mục đích nghiệp vụ rõ ràng
* ✅ Dùng Shadcn components đúng cách
* ✅ Responsive trên mobile/tablet/desktop
* ✅ Accessible (keyboard, screen reader)
* ✅ Error handling đầy đủ
* ✅ Loading states cho async operations

---

## 9. GHI CHÚ

* **Dev Phase**: Focus vào functionality, accessibility, consistency
* **Polish Phase**: Branding, animations, micro-interactions (sau khi core features stable)
