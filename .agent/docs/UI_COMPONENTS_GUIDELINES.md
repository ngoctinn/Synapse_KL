# UI Components Guidelines

## Directory Structure

```
frontend/src/shared/
├── ui/           # Primitives (shadcn/ui)
└── components/   # Composites (business-specific)
```

---

## ui/ Directory

### What goes here?
- **shadcn/ui primitives**: Direct copies from shadcn registry
- **Radix UI wrappers**: Components that wrap @radix-ui/* packages
- **Unstyled or minimally styled**: Focuses on behavior, not business logic
- **Generic reusable**: Can be used across any project

### Examples
```
button.tsx     # Button with variants
input.tsx      # Text input field
select.tsx     # Dropdown select
dialog.tsx     # Modal dialog
checkbox.tsx   # Checkbox control
```

### Rules
1. **NO business logic** - Pure UI components only
2. **NO hardcoded Vietnamese text** - Use props with defaults
3. **NO API calls** - Stateless presentation
4. **Follow shadcn patterns** - Use `cn()`, `cva()`, `data-slot`
5. **Export via barrel** - Add to `ui/index.ts`

---

## components/ Directory

### What goes here?
- **Composite components**: Built from multiple primitives
- **Business-specific**: Tailored for Synapse domain
- **Stateful**: May include local state, hooks
- **Feature helpers**: Reused across features

### Examples
```
smart-data-table.tsx    # Table with sorting, filtering, pagination
multi-select.tsx        # Multi-select with badges
date-time-picker.tsx    # Date + time selection combo
search-input.tsx        # Input with search icon and clear button
page-header.tsx         # Standard page header layout
app-sidebar.tsx         # Application sidebar navigation
```

### Rules
1. **Compose from ui/ primitives** - Don't reinvent
2. **Can have business logic** - Domain-specific behavior OK
3. **Can have Vietnamese text** - Use constants for i18n readiness
4. **More opinionated** - Pre-configured for Synapse use cases
5. **Export via barrel** - Add to `components/index.ts` if reusable

---

## Decision Flowchart

```
Is it a shadcn/ui primitive or Radix wrapper?
├── YES → ui/
└── NO ↓

Does it combine multiple primitives?
├── YES → components/
└── NO ↓

Does it have Synapse-specific business logic?
├── YES → components/
└── NO ↓

Is it stateless and generic?
├── YES → ui/
└── NO → components/
```

---

## Naming Conventions

| Type | Location | Naming |
|------|----------|--------|
| Primitives | ui/ | `button.tsx`, `input.tsx` |
| Composites | components/ | `smart-data-table.tsx`, `date-time-picker.tsx` |
| Hooks | components/[feature]/ | `use-pagination.ts`, `use-selection.ts` |
| Constants | components/[feature]/ | `data-table-text.ts` |

---

## Import Patterns

### Primitives (ui/)
```tsx
// Via barrel export
import { Button, Input, Select } from "@/shared/ui"

// Direct import (avoid)
import { Button } from "@/shared/ui/button"
```

### Composites (components/)
```tsx
// Direct import (preferred for clarity)
import { MultiSelect } from "@/shared/components/multi-select"
import { DataTable } from "@/shared/components/smart-data-table"

// Hooks
import { usePagination, useSelection } from "@/shared/components/data-table"
```

---

## Checklist Before Creating a Component

- [ ] Does a similar component already exist?
- [ ] Is it truly reusable or feature-specific?
- [ ] If feature-specific, put in `features/[feature]/components/`
- [ ] If shared, decide ui/ vs components/ using flowchart
- [ ] Use design tokens from `globals.css`
- [ ] No hardcoded colors (`bg-white` ❌, `bg-card` ✅)
- [ ] WCAG 2.2 compliance (24px min target, ARIA labels)
- [ ] Export via appropriate barrel file

---

## Color Token Rules

### ✅ Correct
```tsx
className="bg-card text-card-foreground"
className="bg-background text-foreground"
className="border-border bg-muted"
className="text-[hsl(var(--alert-success-foreground))]"
```

### ❌ Incorrect
```tsx
className="bg-white"           // Use bg-card
className="text-[#A0A0A0]"     // Use text-muted-foreground
className="bg-emerald-100"     // Use alert tokens
```

---

## Migration Notes

### Recently Moved to components/
- `multi-select.tsx` (was ui/)
- `search-input.tsx` (was ui/)
- `date-time-picker.tsx` (was ui/)
- `date-range-picker.tsx` (was ui/)
- `time-picker-dropdown.tsx` (was ui/)
- `data-table-faceted-filter.tsx` (was ui/)

These were moved because they are **composite components** built from multiple primitives, not primitives themselves.
