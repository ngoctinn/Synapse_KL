# Typography Guidelines - Synapse KL

## Mục đích

Tài liệu này định nghĩa các quy tắc typography chuẩn cho SaaS Dashboard UI, đảm bảo tính nhất quán và dễ bảo trì trên toàn bộ ứng dụng.

---

## 1. Font Size Scale (Tailwind CSS)

| Class       | Size | Use Case                                             |
| ----------- | ---- | ---------------------------------------------------- |
| `text-xs`   | 12px | Caption, meta info, badge text, timestamps (MINIMUM) |
| `text-sm`   | 14px | Body text, form labels, descriptions                 |
| `text-base` | 16px | Card titles, emphasized body text                    |
| `text-lg`   | 18px | Section titles, dialog/sheet titles                  |
| `text-xl`   | 20px | Subsection headers (rare)                            |
| `text-2xl`  | 24px | Page titles                                          |

### ⚠️ FORBIDDEN

- **KHÔNG sử dụng arbitrary values**: `text-[9px]`, `text-[10px]`, `text-[11px]`
- Nếu cần text nhỏ, dùng `text-xs` (12px) làm minimum
- Text < 12px gây khó đọc và vi phạm accessibility guidelines

---

## 2. Font Weight Hierarchy

| Class           | Weight | Use Case                                            |
| --------------- | ------ | --------------------------------------------------- |
| `font-normal`   | 400    | Body text, descriptions, paragraphs                 |
| `font-medium`   | 500    | Form labels, interactive elements, subtle emphasis  |
| `font-semibold` | 600    | **PRIMARY cho SaaS** - Titles, headings, buttons    |
| `font-bold`     | 700    | **HIẾM KHI DÙNG** - Hero text, marketing pages only |

### ✅ Best Practice

```tsx
// ✅ ĐÚNG - Professional SaaS look
<h1 className="text-2xl font-semibold">Page Title</h1>
<CardTitle className="text-base font-semibold">Card Heading</CardTitle>

// ❌ SAI - Quá nặng, thiếu tinh tế
<h1 className="text-3xl font-bold">Page Title</h1>
```

---

## 3. Component Typography Standards

### Page-Level Components

| Component        | Text Size  | Font Weight     | Example                         |
| ---------------- | ---------- | --------------- | ------------------------------- |
| Page Title (h1)  | `text-2xl` | `font-semibold` | "Quản lý dịch vụ"               |
| Page Description | `text-sm`  | `font-normal`   | "Tạo và quản lý các dịch vụ..." |
| Section Header   | `text-lg`  | `font-semibold` | "Thông tin cơ bản"              |

### Card Components

| Element         | Text Size   | Font Weight     |
| --------------- | ----------- | --------------- |
| CardTitle       | `text-base` | `font-semibold` |
| CardDescription | `text-sm`   | `font-normal`   |
| Card Content    | `text-sm`   | `font-normal`   |

### Dialog/Sheet Components

| Element      | Text Size | Font Weight     |
| ------------ | --------- | --------------- |
| Dialog Title | `text-lg` | `font-semibold` |
| Sheet Title  | `text-lg` | `font-semibold` |
| Description  | `text-sm` | `font-normal`   |

### Form Components

| Element         | Text Size | Font Weight                         |
| --------------- | --------- | ----------------------------------- |
| FormLabel       | `text-sm` | `font-medium`                       |
| FormDescription | `text-xs` | `font-normal text-muted-foreground` |
| Input/Select    | `text-sm` | `font-normal`                       |
| Error Message   | `text-xs` | `font-normal text-destructive`      |

### Table Components

| Element        | Text Size | Font Weight                            |
| -------------- | --------- | -------------------------------------- |
| Table Header   | `text-xs` | `font-medium uppercase tracking-wider` |
| Table Cell     | `text-sm` | `font-normal`                          |
| Badge in Table | `text-xs` | `font-semibold`                        |

---

## 4. Semantic Heading Hierarchy (globals.css)

```css
/* Defined in globals.css */
h1 {
  @apply text-2xl font-semibold;
} /* Page titles */
h2 {
  @apply text-xl font-semibold;
} /* Major sections */
h3 {
  @apply text-lg font-semibold;
} /* Subsections */
h4 {
  @apply text-base font-semibold;
} /* Card/panel headers */
h5 {
  @apply text-sm font-semibold;
} /* Minor headers */
h6 {
  @apply text-sm font-medium;
} /* Smallest headers */
```

---

## 5. Responsive Typography

Tránh scale quá lớn giữa các breakpoints. Dashboard UI thường giữ cố định:

```tsx
// ✅ Dashboard - ít responsive scaling
<h1 className="text-2xl font-semibold">Dashboard Title</h1>

// ❌ Marketing pages style - quá nhiều scaling
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">Hero Title</h1>
```

---

## 6. Color & Contrast

### Text Colors

- **Primary text**: `text-foreground` (default)
- **Secondary text**: `text-muted-foreground`
- **Disabled text**: `text-muted-foreground/50`
- **Error text**: `text-destructive`
- **Success text**: `text-green-600`

### Minimum Contrast

- Đảm bảo contrast ratio ≥ 4.5:1 cho body text
- Không dùng màu nhạt cho text nhỏ (text-xs)

---

## 7. Quick Reference Card

```tsx
// Page Title
<h1 className="text-2xl font-semibold">...</h1>

// Section Title
<h2 className="text-lg font-semibold">...</h2>

// Card Title (using Shadcn component)
<CardTitle>...</CardTitle>  // Already styled: text-base font-semibold

// Sheet/Dialog Title (using Shadcn component)
<SheetTitle>...</SheetTitle>  // Already styled: text-lg font-semibold

// Form Label
<FormLabel className="text-sm font-medium">...</FormLabel>

// Helper Text / Caption
<p className="text-xs text-muted-foreground">...</p>

// Badge
<Badge className="text-xs font-semibold">...</Badge>

// Table Header
<TableHead className="text-xs font-medium uppercase tracking-wider">...</TableHead>
```

---

## 8. Migration Checklist

Khi review/fix typography issues:

- [ ] Thay thế tất cả `text-[9px]`, `text-[10px]`, `text-[11px]` → `text-xs`
- [ ] Thay thế `font-bold` → `font-semibold` (trừ hero sections)
- [ ] Page titles dùng `text-2xl font-semibold`
- [ ] Card titles dùng `text-base font-semibold`
- [ ] Dialog/Sheet titles dùng `text-lg font-semibold`
- [ ] Form labels dùng `text-sm font-medium`
- [ ] Descriptions/captions dùng `text-xs text-muted-foreground`

---

## 9. Related Files

- `src/shared/ui/card.tsx` - CardTitle component
- `src/shared/ui/sheet.tsx` - SheetTitle component
- `src/shared/components/page-header.tsx` - PageHeader component
- `src/app/globals.css` - Global heading styles

---

_Last updated: $(date) - Typography audit & standardization_
