# SHADCN UI CONSISTENCY PROTOCOL (v2025.01)
> **Goal**: Đạt độ nhất quán (Consistency) tuyệt đối trong UI, tránh "Magic Values" (giá trị cảm tính) trong Tailwind.

## 1. NGUYÊN TẮC: "DESIGN TOKENS AS TRUTH"

Thay vì dùng class màu lẻ tẻ (`bg-blue-500`, `text-gray-200`), chúng ta sử dụng **Semantic Tokens** đã được định nghĩa trong `globals.css` (theo chuẩn Shadcn).

### 1.1. Color Semantics (Ý nghĩa màu sắc)
| Token Name | Ý nghĩa | Ví dụ sử dụng/Tránh dùng |
| :--- | :--- | :--- |
| `primary` | Hành động chính, Brand Color | Nút "Lưu", "Đặt lịch" / ❌ Không dùng cho text p thường |
| `secondary` | Hành động phụ, Nền nhẹ | Badge, Nút "Hủy" / ❌ Không dùng cho Border chính |
| `muted` | Thông tin phụ, nền lót | Text "chi tiết...", Nền thẻ con / ❌ Không dùng cho tiêu đề |
| `accent` | Điểm nhấn tương tác | Hover state, Selected Item |
| `destructive`| Hành động nguy hiểm | Nút "Xóa", Báo lỗi |
| `border` | Đường viền mặc định | Input, Card Divider |

### 1.2. Spacing System (Hệ thống khoảng cách)
Tuân thủ thang đo `rem` của Tailwind, nhưng giới hạn tập con để đồng bộ:
*   **Padding/Margin nhỏ**: `0.5` (2px), `1` (4px), `2` (8px).
*   **Component Padding**: `4` (16px), `6` (24px) -> Chuẩn cho Card/Modal.
*   **Section Gap**: `8` (32px), `12` (48px).

---

## 2. COMPONENT CONSTRUCTION RULES

### 2.1. Rule "No Magic Numbers"
*   ❌ Sai: `w-[350px]`, `mt-[17px]`, `text-[#3b82f6]`.
*   ✅ Đúng: `w-80` (hoặc `w-full max-w-sm`), `mt-4`, `text-primary`.

### 2.2. Composition Pattern (Tái sử dụng)
Khi cần một biến thể component (VD: Card đặc biệt cho Booking), **KHÔNG** viết lại từ `div`. Hãy dùng `cva` (Class Variance Authority) hoặc Wrapper.

```typescript
// features/booking/components/booking-card.tsx
import { Card, CardHeader, CardContent } from "@/shared/ui/card"

export function BookingCard({ status, children }) {
  // Dùng semantic colors thay vì hardcode
  const statusColor = status === 'confirmed' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground';

  return (
    <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all">
       {/* ... */}
    </Card>
  )
}
```

### 2.3. Typography Scale
Sử dụng class chuẩn của Tailwind thay vì `text-[15px]`.
*   **H1**: `text-4xl font-bold tracking-tight`.
*   **H2**: `text-2xl font-semibold tracking-tight`.
*   **Body**: `text-base` (mặc định), `text-sm` (phụ), `text-xs` (meta).

---

## 3. GLOBAL VS LOCAL
*   **Global (`globals.css`)**: Chỉ chứa biến CSS (`--primary`, `--radius`). Không chứa class utility custom (`.btn-primary` -> ❌).
*   **Local (Component)**: Chứa logic ghép class (`className="flex gap-2..."`).

---

## 4. AGENT CHECKLIST (TRƯỚC KHI OUTPUT CODE)
1.  [ ] Tôi có đang dùng mã màu Hex (`#...`) không? -> Nếu có, đổi sang `bg-primary`, `text-muted-foreground`...
2.  [ ] Tôi có đang dùng padding lẻ (`p-[13px]`) không? -> Đổi về `p-3` hoặc `p-4`.
3.  [ ] Component này có dùng lại primitive của Shadcn (Button, Input) hay tôi đang tự style `button` HTML? -> Phải dùng Shadcn.
