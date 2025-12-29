---
trigger: always_on
glob: "frontend/**/*"
---
# Frontend Rules (Agent-Optimized)

## 1. Stack
- Next.js 16 (App Router), React 19, TS (Strict), Tailwind v4, Tanstack Query.
- UI: Shadcn/ui + Radix UI. Follow `.agent/rules/ui.md`.

## 2. Architecture (FSD)
- `app/`: Routes, Layouts (Thin).
- `features/`: Business logic, components, hooks.
- `shared/`: UI primitives, utils, API client.
- **FORBIDDEN**: `shared` -> `features`, `features` -> `features` (Cross-import).

## 3. Next.js 16 Patterns
- **MANDATORY**: Use Server Components by default.
- **ASYNC APIs**: MUST `await` `params`, `searchParams`, `cookies()`, `headers()`.
- **FILES**: Every route MUST have `loading.tsx` and `error.tsx`. Use `Suspense`.

## 4. Data Fetching & Forms
- **FETCH**: Prefer Server Components. NO client-side waterfalls.
- **MUTATION**: Use Server Actions + `useActionState`.
- **FORMS**: React Hook Form + Zod. Validate both sides.

## 5. Performance & Standards
- **ASSETS**: Use `next/image` and `next/font`.
- **TABLES**: Right-align numbers. Sticky headers. Loading skeletons.
- **SEO**: Use Metadata API. 1x `h1` per page.
- **STYLE**: NO inline styles. NO hardcoded colors. Use CSS variables.