# UI COMPONENT AUDIT REPORT
## Synapse Spa Management System
**Date**: 2026-01-01
**Version**: v2025.12
**Scope**: `frontend/src/shared/ui` + `frontend/src/shared/components`

---

## 1. EXECUTIVE SUMMARY

### 1.1 Overall Assessment
Hệ thống UI components của Synapse dự án đạt **mức KHANG (Good)** với điểm tổng hợp ước tính **7.5/10**. Components tuân thủ tốt triết lý shadcn/ui, sử dụng đúng Radix UI primitives, và có foundation accessibility vững chắc. Tuy nhiên, có một số điểm cần cải thiện về tổ chức cấu trúc và giảm code duplication.

### 1.2 Key Metrics
| Tiêu chí | Điểm | Ghi chú |
|----------|------|---------|
| System Consistency | 8/10 | Styling nhất quán, một vài biến thể size |
| Cognitive Load | 7/10 | API đơn giản nhưng một số component phức tạp |
| Role Clarity | 7/10 | Có overlap giữa ui/ và components/ |
| Visual Hierarchy | 8/10 | Design tokens rõ ràng |
| Extensibility | 8/10 | Composable pattern tốt |
| shadcn/ui Alignment | 9/10 | Gần như chuẩn, ít custom modification |

---

## 2. STANDARDS REFERENCE

### 2.1 shadcn/ui Philosophy (Applied)
- **Open Code**: Components được copy vào project, không phải npm package
- **Composable**: Mỗi component chia sẻ interface chung, có thể compose
- **Non-Opinionated**: Không lock vào abstraction layer
- **Beautiful Defaults**: Style mặc định đẹp, hoạt động tốt cùng nhau
- **CSS Variables**: Theming thông qua CSS Variables

### 2.2 Nielsen's 10 Usability Heuristics
1. Visibility of system status
2. Match between system and real world
3. User control and freedom
4. Consistency and standards
5. Error prevention
6. Recognition rather than recall
7. Flexibility and efficiency of use
8. Aesthetic and minimalist design
9. Help users recognize errors
10. Help and documentation

### 2.3 WCAG 2.2 Key Requirements for Interactive Components
- **Target Size**: Minimum 24x24px (AA), 44x44px for touch
- **Focus Not Obscured**: Focus indicator phải luôn visible
- **Focus Appearance**: 2px perimeter hoặc 3:1 contrast ratio
- **Keyboard Navigation**: Tất cả functionality phải operable via keyboard
- **ARIA Attributes**: Proper roles, labels, và descriptions

---

## 3. DETAILED ANALYSIS

### 3.1 ĐIỂM PHÙ HỢP CHUẨN (Strengths)

#### A. Radix UI Foundation (Excellent)
```
✓ AlertDialog, Dialog, Sheet → @radix-ui/react-dialog
✓ Select, Popover, Tooltip → Proper Radix primitives
✓ Checkbox, RadioGroup, Switch → Native accessibility built-in
✓ Tabs, Collapsible, Accordion → Keyboard navigation included
```
**Đánh giá**: Việc sử dụng Radix UI làm foundation đảm bảo accessibility out-of-the-box (ARIA roles, keyboard navigation, focus management).

#### B. CSS Variables Theming (Good)
```css
/* Ví dụ từ button.tsx */
"bg-primary text-primary-foreground"
"focus-visible:ring-ring focus-visible:ring-2"
"aria-invalid:ring-destructive/20"
```
**Đánh giá**: Sử dụng đúng CSS Variables pattern, cho phép theming động và dark mode support.

#### C. Consistent Size System (Good)
```typescript
// Input sizes: sm(h-10), default(h-12), lg(h-14)
// Button sizes: sm(h-9), default(h-12), lg(h-14)
// Select sizes: sm(h-10), default(h-12), lg(h-14)
```
**Đánh giá**: Hệ thống size tương đối nhất quán, tuân thủ WCAG 2.2 minimum target size 24x24px.

#### D. Data Slots Pattern (Excellent)
```tsx
<Button data-slot="button" data-variant={variant} data-size={size}>
```
**Đánh giá**: Sử dụng `data-slot` pattern giúp dễ debug và style external.

#### E. Loading States (Good)
```tsx
// Button với loading prop
{loading && <Loader2 className="size-4 animate-spin" />}
disabled={disabled || loading}
```
**Đánh giá**: Button component hỗ trợ loading state, đúng chuẩn Nielsen #1 (Visibility of system status).

---

### 3.2 ĐIỂM LỆCH CHUẨN / RỦI RO UX (Weaknesses)

#### A. CRITICAL: Overlap giữa `ui/` và `components/`

**Vấn đề**: Ranh giới không rõ ràng giữa hai thư mục
```
ui/multi-select.tsx       → Custom composite component (nên ở components/)
ui/data-table-faceted-filter.tsx → Business-specific (nên ở components/)
ui/search-input.tsx       → Custom composite (nên ở components/)
ui/date-time-picker.tsx   → Custom composite (nên ở components/)

components/smart-data-table.tsx → Đúng vị trí
components/duration-select.tsx  → Đúng vị trí
```

**Nguyên nhân**: Thiếu guideline rõ ràng về phân loại components
**Rủi ro UX**: Khó maintain, developers có thể tạo duplicate components

**Nielsen Heuristic Vi phạm**: #4 Consistency and standards

---

#### B. HIGH: SmartDataTable quá nhiều trách nhiệm

**Vấn đề**: Component 450 dòng, handle quá nhiều concerns:
- Selection state management
- Sorting logic
- Filtering logic
- Pagination logic
- Search input
- Empty state
- Sticky columns

**Nguyên nhân**: Monolithic design thay vì composable pattern
**Rủi ro UX**: Khó customize, cognitive load cao khi maintain

**shadcn/ui Philosophy Vi phạm**: Non-opinionated, Composable

**Đề xuất cấu trúc**:
```
DataTable (core rendering)
├── DataTableHeader
├── DataTableBody
├── DataTablePagination
├── DataTableToolbar (search, filters)
└── useDataTable (hook for state)
```

---

#### C. MEDIUM: Inconsistent Component API

**Vấn đề 1**: Size prop naming không thống nhất
```typescript
// Input: size="sm" | "default" | "lg"
// Button: size="sm" | "default" | "lg" | "icon" | "icon-sm" | "icon-lg"
// Badge: size="sm" | "default" | "lg"
// SelectTrigger: size="sm" | "default" | "lg" (ngoài props)
```

**Vấn đề 2**: Height không sync giữa related components
```typescript
// Form field scenario - height mismatch:
Input h-12 (default) + Button h-12 (default) ✓ Match
Input h-10 (sm) + Button h-9 (sm) ✗ Mismatch 1px
```

**Nielsen Heuristic Vi phạm**: #4 Consistency and standards

---

#### D. MEDIUM: DurationSelect và TimePickerDropdown overlap

**Vấn đề**: Hai components có chức năng tương tự
```typescript
// duration-select.tsx - Chọn duration (15, 30, 45, 60... phút)
// time-picker-dropdown.tsx - Chọn thời gian (08:00, 08:30, 09:00...)
```

**Nguyên nhân**: Được tạo cho use cases khác nhau nhưng có thể merge
**Rủi ro UX**: Confusion về khi nào dùng component nào

---

#### E. LOW: Missing Loading/Skeleton States ở một số component

**Vấn đề**: Không phải tất cả complex components có skeleton state
```
✓ Skeleton component tồn tại
✓ SidebarMenuSkeleton có
✗ SmartDataTable không có built-in loading state
✗ MultiSelect không có loading state
```

**Nielsen Heuristic Vi phạm**: #1 Visibility of system status

---

#### F. LOW: Vietnamese Text Hardcoded

**Vấn đề**: Text tiếng Việt hardcode trong components
```tsx
// multi-select.tsx
emptyText = "Không tìm thấy kết quả."
"+{selected.length - maxCount} mục khác"

// data-table-faceted-filter.tsx
"Không có kết quả."
"Xóa các bộ lọc"
```

**Nguyên nhân**: Thiếu i18n strategy
**Rủi ro UX**: Khó internationalize sau này

---

### 3.3 WCAG 2.2 COMPLIANCE CHECK

| Component | Target Size | Focus Visible | Keyboard Nav | ARIA |
|-----------|-------------|---------------|--------------|------|
| Button | ✓ h-9 min (36px) | ✓ ring-2 | ✓ native | ✓ |
| Checkbox | ✓ size-5 (20px) | ✓ ring-2 | ✓ Radix | ✓ |
| Switch | ✓ h-6 w-11 | ✓ ring-2 | ✓ Radix | ✓ |
| RadioGroup | ✓ size-5 | ✓ ring-2 | ✓ Radix | ✓ |
| Select | ✓ h-10 min | ✓ ring-2 | ✓ Radix | ✓ |
| Input | ✓ h-10 min | ✓ ring-2 | ✓ native | ✓ |
| MultiSelect | ✗ X button quá nhỏ | ✓ | Partial | ✓ |

**Cảnh báo**: MultiSelect badge X button có kích thước nhỏ (h-3.5 w-3.5 = 14px), không đạt 24x24px minimum.

---

## 4. PHƯƠNG ÁN CẢI THIỆN

### Phương án A: Minimal Refactor (Low Risk, Quick)
**Effort**: 1-2 ngày
**Focus**: Chỉnh sửa issues critical nhất

1. Move 4 files từ `ui/` sang `components/`:
   - `multi-select.tsx`
   - `data-table-faceted-filter.tsx`
   - `search-input.tsx`
   - `date-time-picker.tsx`

2. Fix MultiSelect X button target size:
   ```tsx
   // Thay h-3.5 w-3.5 → min-h-6 min-w-6 p-1
   ```

3. Thêm loading prop cho SmartDataTable

**Pros**: Ít rủi ro, nhanh implement
**Cons**: Không giải quyết gốc rễ SmartDataTable complexity

---

### Phương án B: Moderate Refactor (Medium Risk)
**Effort**: 3-5 ngày
**Focus**: Cải thiện cấu trúc + fix UX issues

Bao gồm Phương án A, cộng thêm:

1. **Decompose SmartDataTable** thành:
   ```
   components/data-table/
   ├── data-table.tsx (core)
   ├── data-table-header.tsx
   ├── data-table-pagination.tsx
   ├── data-table-toolbar.tsx
   ├── data-table-empty-state.tsx
   └── use-data-table.ts (hook)
   ```

2. **Unify size system**:
   - Tạo shared size tokens
   - Đảm bảo sm/default/lg heights match across components

3. **Extract hardcoded Vietnamese text** thành props với defaults

**Pros**: Cải thiện maintainability đáng kể
**Cons**: Cần update tất cả nơi dùng SmartDataTable

---

### Phương án C: Full Design System Audit (High Effort)
**Effort**: 1-2 tuần
**Focus**: Restructure hoàn toàn theo best practices 2025

1. Tạo documentation layer:
   ```
   shared/
   ├── ui/          → Chỉ chứa shadcn primitives (không modify)
   ├── components/  → Business components, composites
   ├── tokens/      → Design tokens (sizes, colors, spacing)
   └── patterns/    → Documented UI patterns
   ```

2. Implement Design Tokens System:
   ```ts
   // tokens/sizes.ts
   export const sizes = {
     sm: { height: 'h-9', px: 'px-3' },
     md: { height: 'h-12', px: 'px-4' },
     lg: { height: 'h-14', px: 'px-5' },
   }
   ```

3. Add Storybook hoặc component documentation

4. Implement i18n foundation

**Pros**: Long-term maintainability, scalability
**Cons**: High effort, scope creep risk

---

## 5. KHUYẾN NGHỊ

### Recommended: **Phương án B (Moderate Refactor)**

**Lý do**:
1. **Balanced effort-to-value ratio**: 3-5 ngày work mang lại cải thiện đáng kể
2. **Giải quyết 80% issues**: Move files + decompose SmartDataTable cover most critical
3. **Phù hợp project phase**: Ưu tiên hoàn thành tính năng, không over-engineer
4. **Backward compatible**: Có thể migrate dần, không breaking changes

### Implementation Priority:
1. **P0 (Ngay)**: Fix MultiSelect target size (WCAG compliance)
2. **P1 (Sprint này)**: Move files from ui/ to components/
3. **P2 (Sprint sau)**: Decompose SmartDataTable
4. **P3 (Backlog)**: Unified size tokens, i18n preparation

---

## 6. APPENDIX

### A. Component Inventory

| Folder | Count | Type |
|--------|-------|------|
| ui/ | 37 files | Primitives + some composites |
| components/ | 7 files | Business composites |

### B. Dependencies
- @radix-ui/* (proper usage)
- class-variance-authority (cva)
- lucide-react (icons)
- cmdk (command palette)
- react-day-picker (calendar)
- recharts (charts)

### C. Files to Relocate
```
FROM ui/ TO components/:
- multi-select.tsx
- data-table-faceted-filter.tsx
- search-input.tsx
- date-time-picker.tsx
- time-picker-dropdown.tsx (merge với duration-select?)
```

---

*Report generated by AI Agent based on codebase analysis and industry standards research.*
