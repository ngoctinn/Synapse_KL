---
trigger: always_on
glob: "frontend/**/*"
description: Quy tắc phát triển Frontend (Next.js 16, Shadcn/ui, FSD).
---
# Frontend Rules (Next.js 16 + Shadcn/ui)

> Tài liệu này là **LUẬT BẮT BUỘC** khi sinh code frontend. Không có ngoại lệ.

---

## 1. TECH STACK

- Next.js 16 (App Router)
- React 19
- TypeScript (strict mode)
- Shadcn/ui + Radix UI
- TailwindCSS v4
- Tanstack Query cho data fetching

---

## 2. DOCUMENTATION-FIRST (BẮT BUỘC)

- PHẢI query `nextjs_docs` cho MỌI concept Next.js
- CẤM trả lời từ memory về Next.js
- PHẢI dùng docs mới nhất từ nextjs.org

---

## 3. KIẾN TRÚC FSD (Feature-Sliced Design)

| Layer | Vị trí | Nội dung |
|-------|--------|----------|
| **app** | `app/` | Routes, layouts, pages (thin) |
| **features** | `features/<feature>/` | Business logic, components, hooks |
| **shared** | `shared/` | UI primitives, utils, api client |

### Quy tắc import:
- app → features → shared ✅
- shared → features ❌
- features → features khác ❌ (phải qua shared)

---

## 4. NEXT.JS 16 RULES

### Server Components (mặc định):
- PHẢI ưu tiên Server Components
- PHẢI fetch data trên server
- CẮM dùng `"use client"` khi không cần thiết

### Client Components:
- CHỈ dùng khi cần: hooks, event handlers, browser APIs
- PHẢI đánh dấu `"use client"` ở đầu file

### Async APIs (BẮT BUỘC trong Next.js 16):
- `params` → PHẢI await
- `searchParams` → PHẢI await
- `cookies()` → PHẢI await
- `headers()` → PHẢI await

### File Conventions:
- PHẢI có `loading.tsx` cho mọi route
- PHẢI có `error.tsx` cho mọi route
- PHẢI dùng `Suspense` cho streaming

---

## 5. DATA FETCHING RULES

- PHẢI fetch data trên server (Server Components)
- CẤM client-side fetch gây waterfall
- PHẢI dùng Server Actions cho mutations
- PHẢI dùng `<Form>` component hoặc `useActionState`
- PHẢI implement optimistic updates khi cần

---

## 6. SHADCN/UI RULES

- PHẢI dùng components từ shadcn registry
- CẤM tự implement primitives đã có trong shadcn
- PHẢI dùng `Sheet` thay `Dialog` cho forms phức tạp
- PHẢI follow shadcn patterns và prop structure
- PHẢI audit sau khi add component mới

---

## 7. COMPONENT RULES

### Structure:
- PHẢI tách components thành Server/Client rõ ràng
- PHẢI đặt business logic vào hooks hoặc services
- CẤM logic phức tạp trong JSX

### Props:
- CẤM prop drilling quá 3 levels
- PHẢI dùng Context hoặc Zustand khi cần
- PHẢI type props với TypeScript interfaces

### Naming:
- Components: PascalCase
- Hooks: camelCase bắt đầu bằng `use`
- Files: kebab-case

---

## 8. STYLING RULES

- PHẢI dùng TailwindCSS
- PHẢI dùng CSS variables cho theming
- CẤM inline styles
- CẤM hardcoded colors (dùng design tokens)
- PHẢI responsive-first approach

---

## 9. PERFORMANCE RULES

- PHẢI dùng `next/image` với proper sizes
- PHẢI dùng `next/font` cho fonts
- PHẢI lazy load non-critical components
- CẤM lạm dụng `useMemo`/`useCallback`
- PHẢI minimize client-side JavaScript

---

## 10. TABLE/LIST UI RULES

- PHẢI right-align số (giá, số lượng)
- PHẢI có ActionBar nhất quán cho primary actions
- PHẢI có empty state
- PHẢI có loading skeleton
- PHẢI có pagination cho lists lớn

---

## 11. FORM RULES

- PHẢI dùng React Hook Form + Zod
- PHẢI validate client-side VÀ server-side
- PHẢI show loading state khi submit
- PHẢI handle errors gracefully
- PHẢI reset form sau submit thành công

---

## 12. ACCESSIBILITY RULES

- PHẢI có proper heading hierarchy (1 h1/page)
- PHẢI có unique IDs cho interactive elements
- PHẢI có semantic HTML
- PHẢI có proper ARIA labels
- PHẢI keyboard navigable

---

## 13. SEO RULES

- PHẢI có proper `<title>` cho mọi page
- PHẢI có meta descriptions
- PHẢI dùng Metadata API của Next.js
- PHẢI có proper Open Graph tags

---

## 14. CODE STYLE RULES

- PHẢI dùng TypeScript strict mode
- CẤM `any` type
- CẤM `@ts-ignore`
- PHẢI pass ESLint
- CẮM unused imports/variables
- CẤM commented-out code

---

## 15. TESTING RULES

- PHẢI dùng Playwright cho E2E
- PHẢI dùng Vitest cho unit tests
- PHẢI test với browser automation (không chỉ curl)
- PHẢI verify runtime errors, không chỉ HTTP status

---

## 16. AI AGENT GUIDELINES (MANDATORY)

- **Zero Emoji Policy**: No emojis/icons in code, comments, or commit messages.
- **Commenting Philosophy**:
  - NEVER comment "What" the code does (e.g., `// set loading to false`).
  - ALWAYS comment "Why" for complex logic, workarounds, or business rules.
- **Minimalist Logic**: Prefer simple, flat code over deep abstractions that AI might struggle to maintain.
- **Verification**: Proactively run `npm run build` or tests after major changes.

---

*Cập nhật: December 2025*
