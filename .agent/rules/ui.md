---
trigger: always_on
glob: "frontend/src/shared/ui/**/*"
---
# UI & A11y Rules (Agent-Optimized)

## 1. Sizing (WCAG Standards)
- **MANDATORY**: Min interactive target **24x24px**.
- **TOUCH/MOBILE**: Min interactive target **44x44px**.
- **FORBIDDEN**: Reducing `h-*`, `w-*`, `min-h-*`, `min-w-*` below primitive defaults.

## 2. Forbidden Overrides (Core Logic)
- **A11y/Focus**: `focus:*`, `focus-visible:*`, `outline-*`, `ring-*`.
- **States**: `data-[state=...]`, `hover:*`, `active:*`, `disabled:*`.
- **Internal Layout**: `flex`, `inline-flex`, `items-*`, `justify-*`, `gap-*`.
- **Overlay Position**: `absolute`, `fixed`, `top-*`, `left-*`, `z-*`.
  - *Note*: Use Radix props (`offset`, `align`, `side`) for positioning instead.
- **A11y Helpers**: Do not remove `sr-only` or `aria-*` attributes.

## 3. Allowed Changes (Presentation)
- **Visuals**: `bg-*`, `text-*`, `border-*`, `shadow-*`.
  - *Requirement*: Maintain WCAG 2.1 AA contrast ratios.
- **Outer Spacing**: `m-*` (margin) only.
- **Radius**: Custom `rounded-*` is allowed if consistent.

## 4. Implementation Pattern
- **Priority**: Custom classes MUST be at the end of `cn(...)`.
- **Pattern**: `cn("default-classes", className)`
- **Check**: Audit `asChild` usage for className collision.