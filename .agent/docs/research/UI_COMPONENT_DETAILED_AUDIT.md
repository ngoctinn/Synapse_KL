# UI COMPONENT DETAILED AUDIT REPORT
## Synapse Spa Management System
**Date**: 2026-01-01
**Version**: v2025.12

---

## PART A: COLOR SYSTEM ANALYSIS

### A.1 Design Token Architecture

```
globals.css Structure:
├── :root (Light Mode)
│   ├── Neutrals Palette (neutral-0 → neutral-100)
│   ├── Primary Palette (Teal)
│   ├── Semantic Tokens
│   ├── Sidebar Tokens
│   ├── Chart Tokens
│   └── Alert Tokens
├── .dark (Dark Mode Overrides)
└── @theme inline (Tailwind Mappings)
```

### A.2 Neutrals Palette Review

| Token | HSL Value | Hex | Usage |
|-------|-----------|-----|-------|
| `neutral-100` | 199 42% 11% | #102027 | Foreground text (darkest) |
| `neutral-90` | 200 23% 18% | #263238 | - |
| `neutral-80` | 200 18% 26% | #37474F | Secondary foreground |
| `neutral-70` | 200 18% 33% | #455A64 | - |
| `neutral-60` | 200 18% 41% | #546E7A | Sidebar foreground |
| `neutral-50` | 199 18% 46% | #607D8B | - |
| `neutral-40` | 200 16% 54% | #78909C | - |
| `neutral-30` | 200 15% 62% | #90A4AE | Border inactive, checkbox |
| `neutral-20` | 200 15% 73% | #B0BEC5 | Disabled states, scrollbar |
| `neutral-10` | 199 13% 84% | #CFD8DC | Border, input border |
| `neutral-5` | 199 15% 92% | - | Lightest shade |
| `neutral-0` | 0 0% 100% | #FFFFFF | Card, popover background |

**Đánh giá**:
- Tốt: Có đủ 12 shades cho flexibility
- Tốt: Hue nhất quán (199-200) tạo harmonious tones
- Cảnh báo: `neutral-40` đến `neutral-70` ít được sử dụng trong components

### A.3 Primary Palette Review (Teal)

| Token | HSL Value | Purpose |
|-------|-----------|---------|
| `primary-base` | 187 100% 33% | Main brand color |
| `primary-light` | 187 50% 93% | Light teal backgrounds |
| `primary-dark` | 187 100% 25% | Hover/Active states |

**Đánh giá**:
- Tốt: Teal là unique, memorable brand color
- Tốt: Có light/dark variants
- Cảnh báo: `primary-dark` không được sử dụng trong bất kỳ component nào

### A.4 Semantic Tokens Review

| Token | Light Mode | Dark Mode | Usage in Components |
|-------|------------|-----------|---------------------|
| `background` | 180 20% 98% | 200 23% 8% | body background |
| `foreground` | neutral-100 | 199 15% 92% | text color |
| `card` | neutral-0 | 200 23% 12% | Card, Input bg |
| `popover` | neutral-0 | 200 23% 10% | Dropdown, Select |
| `primary` | 187 100% 33% | 187 100% 42% | Buttons, Links |
| `secondary` | 180 20% 98% | 200 23% 15% | TableHeader |
| `muted` | 180 20% 98% | 200 23% 15% | Disabled, placeholder |
| `accent` | 187 60% 95% | 200 23% 18% | Hover states |
| `destructive` | 0 100% 65% | 0 84% 60% | Delete, Error |
| `border` | neutral-10 | 200 23% 18% | All borders |
| `input` | neutral-10 | 200 23% 18% | Input borders |
| `ring` | primary-base | 187 100% 42% | Focus rings |

**Đánh giá**:
- Tốt: Complete semantic layer
- Tốt: Dark mode có proper contrast adjustments
- Issue: `secondary` và `muted` identical trong light mode (180 20% 98%)

### A.5 Alert Tokens Review

| Type | Background | Foreground | Border | WCAG Contrast |
|------|------------|------------|--------|---------------|
| Warning | 54 100% 89% | 32 100% 48% | 55 100% 73% | ~4.5:1 Pass |
| Success | 129 44% 94% | 125 46% 34% | 124 38% 64% | ~5:1 Pass |
| Info | 187 71% 93% | 186 100% 28% | 188 64% 59% | ~4.5:1 Pass |

**Đánh giá**: Tốt - Tất cả alert colors đạt WCAG AA contrast ratio

### A.6 Missing/Unused Tokens

```
Có trong globals.css nhưng KHÔNG được dùng trong components:
- --primary-dark
- --neutral-40 đến --neutral-70 (rất ít usage)
- --chart-3, --chart-4, --chart-5 (chỉ định nghĩa, chưa dùng)

Được dùng trong components nhưng KHÔNG có trong globals.css:
- bg-white (hardcoded thay vì bg-card)
- text-emerald-*, text-amber-*, text-red-*, text-blue-* (Badge variants)
- text-rose-* (Badge soft-error variant)
```

---

## PART B: INDIVIDUAL COMPONENT AUDIT

### B.1 PRIMITIVES (ui/)

---

#### 1. alert-dialog.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 9/10 | Đúng semantic: `bg-background`, `bg-black/50` overlay |
| Accessibility | 10/10 | Radix primitive, ARIA complete |
| Consistency | 9/10 | Uses buttonVariants correctly |
| Size System | 9/10 | Proper responsive `sm:max-w-lg` |

**Issues**: None
**Status**: Production Ready

---

#### 2. avatar.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 8/10 | `bg-muted` fallback |
| Accessibility | 10/10 | Radix primitive |
| Consistency | 9/10 | Standard size `size-8` |
| Size System | 7/10 | Fixed size, không có variants |

**Issues**:
- Missing size variants (sm, md, lg)

**Recommendations**:
```tsx
// Thêm size variants
const avatarVariants = cva("...", {
  variants: {
    size: {
      sm: "size-6",
      default: "size-8",
      lg: "size-12",
      xl: "size-16"
    }
  }
})
```

---

#### 3. badge.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 6/10 | Hardcoded colors thay vì tokens |
| Accessibility | 8/10 | Proper focus states |
| Consistency | 7/10 | Custom variants không dùng design tokens |
| Size System | 9/10 | sm/default/lg variants |

**Issues**:
```tsx
// HIỆN TẠI - Hardcoded Tailwind colors
success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
```

**Recommendations**:
```tsx
// NÊN - Dùng alert tokens từ globals.css
success: "bg-[hsl(var(--alert-success))] text-[hsl(var(--alert-success-foreground))]"
warning: "bg-[hsl(var(--alert-warning))] text-[hsl(var(--alert-warning-foreground))]"
// Hoặc thêm badge tokens vào globals.css
```

---

#### 4. breadcrumb.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 9/10 | `text-muted-foreground`, `text-foreground` |
| Accessibility | 10/10 | `aria-label="breadcrumb"`, `aria-current="page"` |
| Consistency | 10/10 | Standard shadcn pattern |
| Size System | 8/10 | Fixed text-sm |

**Issues**: None
**Status**: Production Ready

---

#### 5. button.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 9/10 | Proper semantic tokens |
| Accessibility | 10/10 | Focus visible, disabled states, loading |
| Consistency | 10/10 | Excellent variant system |
| Size System | 9/10 | sm/default/lg + icon sizes |

**Analysis**:
```tsx
// Variants sử dụng đúng tokens:
default: "bg-primary text-primary-foreground"
destructive: "bg-destructive text-destructive-foreground"
outline: "border-primary/30 text-primary"
ghost: "text-primary hover:bg-primary/10"

// Custom variant tốt:
"outline-neutral": "border-input text-muted-foreground" // Cho secondary actions
```

**Issues**:
- `size="sm"` h-9 (36px) vs Input size="sm" h-10 (40px) - 4px mismatch

**Status**: Production Ready with minor height inconsistency

---

#### 6. calendar.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 8/10 | Proper tokens, complex state handling |
| Accessibility | 9/10 | Keyboard nav, focus management |
| Consistency | 8/10 | Uses buttonVariants |
| Size System | 8/10 | `--cell-size` CSS variable |

**Issues**:
- Phức tạp (225 lines) - hard to maintain
- Vietnamese locale hardcoded (`locale = vi`)

---

#### 7. card.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 10/10 | `bg-card text-card-foreground` perfect |
| Accessibility | 8/10 | Semantic structure ok |
| Consistency | 10/10 | Standard shadcn |
| Size System | 9/10 | Flexible padding system |

**Issues**: None
**Status**: Production Ready

---

#### 8. chart.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 10/10 | Uses chart tokens correctly |
| Accessibility | 7/10 | SVG charts need ARIA labels |
| Consistency | 8/10 | Follows recharts patterns |
| Size System | 8/10 | Responsive container |

**Issues**:
- Chart accessibility could be improved with `role="img"` and descriptions

---

#### 9. checkbox.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 8/10 | Mix of tokens và neutral-* |
| Accessibility | 10/10 | Radix primitive, indeterminate support |
| Consistency | 8/10 | Custom colors thay vì pure tokens |
| Size System | 9/10 | size-5 (20px) - meets WCAG |

**Analysis**:
```tsx
// Sử dụng neutral trực tiếp (acceptable):
"border-neutral-30"  // Đúng, dùng token
"disabled:border-neutral-20"  // Đúng

// Potential issue:
"bg-card"  // Input background - tốt
```

**Status**: Production Ready

---

#### 10. collapsible.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | N/A | No styling, pure primitive |
| Accessibility | 10/10 | Radix primitive |
| Consistency | 10/10 | Unstyled as expected |
| Size System | N/A | No sizing |

**Status**: Production Ready

---

#### 11. command.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 9/10 | `bg-popover`, `text-muted-foreground` |
| Accessibility | 10/10 | Full keyboard nav via cmdk |
| Consistency | 9/10 | Proper shadcn integration |
| Size System | 8/10 | Fixed heights (h-9, h-12) |

**Status**: Production Ready

---

#### 12. data-table-faceted-filter.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 8/10 | Uses design tokens |
| Accessibility | 8/10 | Proper ARIA via Command |
| Consistency | 6/10 | **WRONG LOCATION** - business component |
| Size System | 7/10 | h-8 button, h-4 w-4 icons |

**Issues**:
- **CRITICAL**: Nên ở `components/` không phải `ui/`
- Hardcoded Vietnamese text: "đang chọn", "Không có kết quả"
- Checkbox custom styling thay vì dùng Checkbox component

**Recommendations**:
1. Move to `components/data-table-faceted-filter.tsx`
2. Extract Vietnamese text to props
3. Use Checkbox component instead of custom div

---

#### 13. date-range-picker.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 9/10 | Proper tokens |
| Accessibility | 9/10 | Via Calendar primitive |
| Consistency | 6/10 | **WRONG LOCATION** - composite |
| Size System | 8/10 | w-full, responsive |

**Issues**:
- **CRITICAL**: Nên ở `components/`
- Vietnamese text hardcoded: "Chọn khoảng ngày"

---

#### 14. date-time-picker.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 8/10 | Mostly tokens |
| Accessibility | 7/10 | Time slots keyboard nav could improve |
| Consistency | 5/10 | **WRONG LOCATION**, custom composite |
| Size System | 7/10 | h-[300px] hardcoded |

**Issues**:
- **CRITICAL**: Nên ở `components/`
- Hardcoded Vietnamese: "Chọn ngày và giờ", "Giờ hẹn"
- Time range hardcoded (8:00-21:00) - should be props
- `bg-muted/20` custom instead of token

---

#### 15. dialog.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 10/10 | Perfect token usage |
| Accessibility | 10/10 | Radix primitive |
| Consistency | 10/10 | Standard shadcn |
| Size System | 9/10 | Responsive max-w |

**Status**: Production Ready

---

#### 16. dropdown-menu.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 10/10 | All semantic tokens |
| Accessibility | 10/10 | Radix primitive |
| Consistency | 10/10 | Standard shadcn |
| Size System | 9/10 | py-2.5, proper touch targets |

**Status**: Production Ready

---

#### 17. form.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 9/10 | `text-destructive` for errors |
| Accessibility | 10/10 | ARIA describedby, invalid states |
| Consistency | 10/10 | Standard RHF integration |
| Size System | 8/10 | space-y-2 vertical rhythm |

**Status**: Production Ready

---

#### 18. input.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 10/10 | All tokens: `border-input`, `bg-card` |
| Accessibility | 10/10 | Focus visible, invalid states |
| Consistency | 10/10 | Proper size variants |
| Size System | 10/10 | sm(h-10)/default(h-12)/lg(h-14) |

**Status**: Production Ready

---

#### 19. label.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 8/10 | Inherits, disabled opacity |
| Accessibility | 10/10 | Radix primitive |
| Consistency | 10/10 | Standard |
| Size System | 8/10 | text-sm |

**Status**: Production Ready

---

#### 20. multi-select.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 7/10 | `bg-primary/10`, custom badge styling |
| Accessibility | 6/10 | X button too small (14px) |
| Consistency | 5/10 | **WRONG LOCATION** - composite |
| Size System | 6/10 | X button violates WCAG 24px |

**CRITICAL Issues**:
```tsx
// X button chỉ 14px - WCAG violation
<X className="h-3.5 w-3.5" /> // 14px < 24px minimum

// Nên:
<X className="h-4 w-4" /> // 16px minimum, better: h-5 w-5
// Hoặc thêm padding để touch target >= 24px
```

**Other Issues**:
- Nên ở `components/`
- Hardcoded Vietnamese text
- Custom badge styling thay vì dùng Badge component

---

#### 21. popover.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 10/10 | `bg-popover text-popover-foreground` |
| Accessibility | 10/10 | Radix primitive |
| Consistency | 10/10 | Standard |
| Size System | 8/10 | w-72 default |

**Status**: Production Ready

---

#### 22. radio-group.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 8/10 | Mix tokens và neutral-* |
| Accessibility | 10/10 | Radix primitive |
| Consistency | 8/10 | Custom styling |
| Size System | 9/10 | size-5 (20px) |

**Issue**:
```tsx
// Hardcoded color
"bg-white" // Nên là bg-card hoặc bg-background
```

---

#### 23. scroll-area.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 9/10 | `bg-border` for thumb |
| Accessibility | 9/10 | Radix primitive, tab index |
| Consistency | 10/10 | Standard |
| Size System | 8/10 | w-2.5 scrollbar |

**Status**: Production Ready

---

#### 24. search-input.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 8/10 | Custom state colors |
| Accessibility | 8/10 | aria-label on clear |
| Consistency | 5/10 | **WRONG LOCATION** - composite |
| Size System | 9/10 | sm/default/lg |

**Issues**:
- Nên ở `components/`
- Custom `success` và `warning` states dùng alert tokens
- `alert-success-border` defined but not standard Tailwind

---

#### 25. select.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 10/10 | Perfect token usage |
| Accessibility | 10/10 | Radix primitive |
| Consistency | 10/10 | Standard shadcn |
| Size System | 10/10 | sm/default/lg với heights |

**Status**: Production Ready

---

#### 26. separator.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 10/10 | `bg-border` |
| Accessibility | 10/10 | Radix primitive, decorative |
| Consistency | 10/10 | Standard |
| Size System | 10/10 | h-px/w-px |

**Status**: Production Ready

---

#### 27. sheet.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 9/10 | `bg-background`, `bg-black/80` |
| Accessibility | 10/10 | Radix Dialog primitive |
| Consistency | 10/10 | Standard shadcn |
| Size System | 9/10 | w-3/4 responsive, sm:max-w-sm |

**Status**: Production Ready

---

#### 28. sidebar.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 10/10 | Full sidebar token system |
| Accessibility | 9/10 | Keyboard shortcut, tooltips |
| Consistency | 10/10 | Comprehensive system |
| Size System | 10/10 | CSS variables for widths |

**Note**: Largest component (728 lines) nhưng justified vì là complete sidebar system

**Status**: Production Ready

---

#### 29. skeleton.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 9/10 | `bg-accent` for pulse |
| Accessibility | 8/10 | No ARIA (ok for decorative) |
| Consistency | 10/10 | Simple, correct |
| Size System | 8/10 | Flexible via className |

**Status**: Production Ready

---

#### 30. sonner.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 10/10 | Uses alert tokens correctly! |
| Accessibility | 8/10 | Relies on sonner library |
| Consistency | 10/10 | Proper theme integration |
| Size System | 8/10 | Default sonner sizing |

**Status**: Production Ready

---

#### 31. switch.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 7/10 | Hardcoded `bg-white` |
| Accessibility | 10/10 | Radix primitive |
| Consistency | 7/10 | Custom colors |
| Size System | 9/10 | h-6 w-11, proper touch |

**Issues**:
```tsx
// Hardcoded white
"bg-white" // x3 occurrences - nên là bg-card

// Custom disabled
"disabled:data-[state=checked]:bg-primary/20" // OK, intentional
```

---

#### 32. table.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 8/10 | `bg-secondary`, `bg-white` hardcoded |
| Accessibility | 8/10 | Semantic table elements |
| Consistency | 8/10 | Standard structure |
| Size System | 9/10 | h-12 header, p-4 cells |

**Issues**:
```tsx
// Hardcoded white
TableBody: "bg-white" // Nên là bg-card
```

---

#### 33. tabs.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 9/10 | Proper token usage |
| Accessibility | 10/10 | Radix primitive |
| Consistency | 9/10 | Standard |
| Size System | 8/10 | h-11 list |

**Status**: Production Ready

---

#### 34. textarea.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 10/10 | Same as Input |
| Accessibility | 9/10 | Proper focus, invalid |
| Consistency | 10/10 | Matches Input styling |
| Size System | 8/10 | min-h-[80px] |

**Status**: Production Ready

---

#### 35. time-picker-dropdown.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 9/10 | Via Select component |
| Accessibility | 9/10 | Via Select |
| Consistency | 5/10 | **WRONG LOCATION**, overlap with DurationSelect |
| Size System | 7/10 | h-10, w-[120px] fixed |

**Issues**:
- Nên ở `components/`
- Overlap functionality với `duration-select.tsx`
- Consider merging into one TimeSelect with configurable format

---

#### 36. tooltip.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 9/10 | `bg-foreground text-background` inverse |
| Accessibility | 10/10 | Radix primitive |
| Consistency | 10/10 | Standard |
| Size System | 8/10 | px-3 py-1.5, text-xs |

**Status**: Production Ready

---

### B.2 COMPOSITES (components/)

---

#### 37. app-sidebar.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 9/10 | Proper sidebar tokens |
| Accessibility | 8/10 | Keyboard nav via SidebarMenuButton |
| Consistency | 9/10 | Uses sidebar primitives |
| Size System | 8/10 | h-12 menu items |

**Issues**:
- Dev role switcher should be hidden in production
- Hardcoded icon color `#A0A0A0` (nên dùng token)

```tsx
// Hardcoded hex - BAD
"text-[#A0A0A0]"

// Nên:
"text-sidebar-foreground"
```

---

#### 38. bottom-nav.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 9/10 | `text-muted-foreground`, `text-primary` |
| Accessibility | 7/10 | Missing ARIA labels on nav items |
| Consistency | 9/10 | Simple, clean |
| Size System | 9/10 | h-16 proper touch targets |

**Recommendations**:
```tsx
// Thêm aria-label
<nav aria-label="Main navigation" className="...">
```

---

#### 39. dashboard-header-title.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 10/10 | `text-foreground` |
| Accessibility | 9/10 | h1 tag correct |
| Consistency | 10/10 | Simple |
| Size System | 8/10 | text-lg |

**Status**: Production Ready

---

#### 40. duration-select.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 9/10 | Via Select component |
| Accessibility | 9/10 | Via Select |
| Consistency | 8/10 | Clean wrapper |
| Size System | 8/10 | h-11 (44px) - good touch target |

**Issues**:
- Overlap với `time-picker-dropdown.tsx`
- Hardcoded Vietnamese: "Không có", "giờ", "phút"

---

#### 41. page-header.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 9/10 | Proper tokens |
| Accessibility | 9/10 | h1 semantic |
| Consistency | 9/10 | Reusable pattern |
| Size System | 8/10 | Responsive layout |

**Status**: Production Ready

---

#### 42. role-guard.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | N/A | No styling |
| Accessibility | N/A | Logic only |
| Consistency | 10/10 | Clean utility |
| Size System | N/A | N/A |

**Status**: Production Ready

---

#### 43. smart-data-table.tsx
| Aspect | Rating | Details |
|--------|--------|---------|
| Color Usage | 7/10 | Some custom colors |
| Accessibility | 6/10 | Missing ARIA for sorting |
| Consistency | 5/10 | Monolithic, violates composition |
| Size System | 7/10 | Mixed heights |

**CRITICAL Issues**:
```tsx
// 450 lines - TOO LARGE
// Should be decomposed into:
// - DataTable (core)
// - DataTableToolbar (search)
// - DataTablePagination
// - DataTableFilters
// - useDataTable (state hook)

// Hardcoded input class instead of using Input component
<input className="..." />  // Line 171-173

// Missing ARIA for sortable columns
<Button onClick={handleSort}>  // Needs aria-sort

// Hardcoded Vietnamese text
"Tìm kiếm nhanh..."
"Chọn..."
"Tất cả"
"Hiển thị"
"kết quả"
```

---

## PART C: SUMMARY MATRIX

### C.1 Components Needing Relocation

| File | From | To | Priority |
|------|------|-----|----------|
| multi-select.tsx | ui/ | components/ | P1 |
| data-table-faceted-filter.tsx | ui/ | components/ | P1 |
| search-input.tsx | ui/ | components/ | P1 |
| date-time-picker.tsx | ui/ | components/ | P1 |
| date-range-picker.tsx | ui/ | components/ | P2 |
| time-picker-dropdown.tsx | ui/ | components/ | P2 |

### C.2 Components with Hardcoded Colors

| Component | Issue | Fix |
|-----------|-------|-----|
| badge.tsx | Tailwind colors instead of tokens | Use alert tokens |
| radio-group.tsx | `bg-white` | Use `bg-card` |
| switch.tsx | `bg-white` x3 | Use `bg-card` |
| table.tsx | `bg-white` | Use `bg-card` |
| app-sidebar.tsx | `#A0A0A0` | Use token |

### C.3 Accessibility Issues

| Component | Issue | Severity | Fix |
|-----------|-------|----------|-----|
| multi-select.tsx | X button 14px | HIGH | Min 24px target |
| smart-data-table.tsx | Missing aria-sort | MEDIUM | Add ARIA |
| bottom-nav.tsx | Missing nav label | LOW | Add aria-label |
| chart.tsx | Missing chart descriptions | LOW | Add role="img" |

### C.4 Overall Scores by Component

| Component | Color | A11y | Consistency | Size | Avg |
|-----------|-------|------|-------------|------|-----|
| button.tsx | 9 | 10 | 10 | 9 | **9.5** |
| dialog.tsx | 10 | 10 | 10 | 9 | **9.75** |
| select.tsx | 10 | 10 | 10 | 10 | **10** |
| input.tsx | 10 | 10 | 10 | 10 | **10** |
| multi-select.tsx | 7 | 6 | 5 | 6 | **6** |
| smart-data-table.tsx | 7 | 6 | 5 | 7 | **6.25** |
| badge.tsx | 6 | 8 | 7 | 9 | **7.5** |

---

## PART D: ACTION ITEMS

### Immediate (P0)
1. [x] ~~Fix MultiSelect X button target size to 24px minimum~~ ✅ DONE

### This Sprint (P1)
2. [x] ~~Move 6 files from ui/ to components/~~ ✅ DONE
   - multi-select.tsx
   - data-table-faceted-filter.tsx
   - search-input.tsx
   - date-time-picker.tsx
   - date-range-picker.tsx
   - time-picker-dropdown.tsx
3. [x] ~~Replace hardcoded `bg-white` with `bg-card` (4 files)~~ ✅ DONE
   - radio-group.tsx
   - switch.tsx
   - table.tsx
4. [x] ~~Replace #A0A0A0 with sidebar token in app-sidebar~~ ✅ DONE

### This Sprint (P2)
5. [x] ~~Refactor Badge to use alert tokens~~ ✅ DONE
6. [x] ~~Decompose SmartDataTable into composable parts~~ ✅ DONE
   - Created `data-table/` folder with:
     - `use-pagination.ts` - Pagination state hook
     - `use-selection.ts` - Row selection hook
     - `use-sorting.ts` - Sorting state hook
     - `data-table-pagination.tsx` - Pagination component
     - `data-table-toolbar.tsx` - Search toolbar component
     - `data-table-empty-state.tsx` - Empty state component
     - `data-table-text.ts` - i18n-ready text constants
7. [x] ~~Add aria-sort to sortable table headers~~ ✅ DONE
8. [x] ~~Add aria-label to bottom-nav~~ ✅ DONE
9. [x] ~~Add Avatar size variants~~ ✅ DONE

### Backlog (P3) - ALL COMPLETED
10. [x] ~~Create i18n foundation for Vietnamese text~~ ✅ DONE
    - Created `data-table-text.ts` with centralized text constants
11. [x] ~~Add unused neutral-* tokens to components where appropriate~~ ✅ DONE
12. [x] ~~Document component guidelines for ui/ vs components/~~ ✅ DONE
    - Created `.agent/docs/UI_COMPONENTS_GUIDELINES.md`

---

*Detailed audit completed. Total components analyzed: 43*
