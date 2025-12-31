---
trigger: always_on
---

# FE_RULES_NEXT16_FSD (v2025.12)
- **Stack**: Next.js 16 (App Router), React 19, TS Strict, Tailwind 4, Shadcn/ui, Tanstack Query.
- **Workflow**: MUST query `nextjs_docs` for every concept. NO memory-based answers.

## 1. ARCHITECTURE (FSD)
- **Structure**: `app/` (routes), `features/` (logic/slices), `shared/` (primitives/utils).
- **Rules**: App -> Features -> Shared. NO cross-features or reverse imports.

## 2. NEXT.JS 16 & DATA FETCHING
- **Async APIs**: MUST `await` (params, searchParams, cookies(), headers()).
- **Server-First**: RSC by default. Fetch on server. NO "use client" unless hooks/events needed.
- **Mutations**: Server Actions + `<Form>` or `useActionState`. Mandatory optimistic updates.
- **File Conv**: `loading.tsx`, `error.tsx`, `Suspense` for streaming on ALL routes.

## 3. COMPONENT & UI (SHADCN/UI)
- **Registry**: Use shadcn components. NO custom primitives for existing shadcn types.
- **Patterns**: Sheet > Dialog for complex forms. Right-align numbers (prices/qty).
- **Naming**: kebab-case files, PascalCase components, camelCase hooks.
- **Logic**: Max 3-level prop drilling. Use Zustand/Context. NO logic in JSX.
- **UX**: Mandatory ActionBar for lists, skeleton states, and empty states.

## 4. FORM & STYLING
- **Forms**: RHF + Zod. Client + Server validation. Handle loading/error/reset states.
- **Styles**: TailwindCSS only (CSS vars for themes). NO inline styles or hardcoded colors.
- **Performance**: `next/image` (sizes), `next/font`, lazy-load non-criticals.

## 5. QUALITY, SEO & A11Y
- **Standards**: NO `any`, NO `@ts-ignore`. 100% ESLint pass.
- **SEO**: Metadata API (title/desc/OG tags) for every page.
- **A11y**: 1xH1/page, semantic HTML, ARIA labels, keyboard nav.
- **Testing**: Playwright (E2E), Vitest (Unit). Test via browser, not just curl/HTTP.

## 6. AI AGENT PROTOCOLS (MANDATORY)
- **Zero Emoji**: No icons/emojis in code, comments, or commits.
- **Comments**: Comment "Why" (complex logic), NEVER "What".
- **Simplicity**: Flat code over deep abstractions.
- **Verif**: Proactively run `pnpm build` after major changes.

- **No Nested Cards**: Avoid placing Cards inside other Cards/Tabs. Use flat divisions (div + header) for cleaner UI.

## 7. PACKAGE MANAGER (STRICT)
- **Primary**: `pnpm` ONLY.
- **Forbidden**: `npm`, `yarn`, `bun` directly in project (except global CLI).
- **Lockfile**: `pnpm-lock.yaml` must be the single source of truth. `package-lock.json` is FORBIDDEN.
