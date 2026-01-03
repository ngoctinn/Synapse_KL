# RESEARCH: NEXT.JS 16 + SHADCN/UI + TAILWIND V4 BEST PRACTICES
**(Updated: 2026-01-03)**

Tài liệu này tổng hợp các thực hành tốt nhất (Best Practices) cho dự án Synapse_KL phiên bản frontend mới, dựa trên Next.js 16, React 19, và Shadcn UI với Tailwind CSS v4.

## 1. ARCHITECTURE: MODULAR (ADAPTED FSD)

Thay vì cấu trúc phẳng truyền thống, sử dụng kiến trúc **Modular** (lấy cảm hứng từ Feature-Sliced Design) để dễ mở rộng.

### 1.1. Folder Structure Recommendation
```
src/
├── app/                  # App Router (File-system routing)
│   ├── (auth)/           # Route groups (clean URLs)
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── layout.tsx    # Dashboard layout (Sidebar, Header)
│   │   ├── schedule/     # /schedule route
│   │   └── settings/     # /settings route
│   ├── api/              # Route Handlers (chỉ dùng cho Webhooks/External integration)
│   ├── globals.css       # Tailwind v4 entry point
│   └── layout.tsx        # Root layout
├── features/             # LOGIC NGHIỆP VỤ (Domain Driven)
│   ├── auth/
│   │   ├── actions.ts    # Server Actions
│   │   ├── components/   # Feature-specific components (LoginForm)
│   │   └── hooks/        # Feature-specific hooks
│   ├── schedule/
│   │   ├── components/
│   │   │   ├── schedule-grid.tsx
│   │   │   └── shift-card.tsx
│   │   └── utils.ts
│   └── staff/
├── shared/               # REUSABLE CODE (Dùng chung cho toàn app)
│   ├── ui/               # Shadcn components (Button, Card, Input...)
│   │   ├── button.tsx
│   │   └── index.ts      # Export barrel
│   ├── lib/              # Utilities (cn, fetcher, formatters)
│   ├── hooks/            # Generic hooks (use-debounce, use-click-outside)
│   └── types/            # Global types
└── middleware.ts         # Auth protection
```

### 1.2. Quy tắc Dependency
1.  **Shared** KHÔNG ĐƯỢC phụ thuộc vào **Features** hoặc **App**.
2.  **Features** có thể dùng **Shared**.
3.  **Features** KHÔNG ĐƯỢC import trực tiếp lẫn nhau (dùng Event Bus hoặc URL state để giao tiếp nếu cần, hoặc đẩy logic lên App/Shared).
4.  **App** import từ **Features** và **Shared** để dựng trang.

---

## 2. NEXT.JS 16 CORE PATTERNS

### 2.1. Async Request APIs (BẮT BUỘC)
Trong Next.js 15/16, các params truy cập dữ liệu request (`params`, `searchParams`, `cookies`, `headers`) đều là **Async**.

**SAI (Next.js 14 cũ):**
```tsx
// ❌ Sẽ gây lỗi runtime
export default function Page({ searchParams }) {
  const query = searchParams.q;
  ...
}
```

**ĐÚNG (Next.js 16):**
```tsx
// ✅ Bắt buộc await
export default async function Page({ searchParams }: { searchParams: Promise<any> }) {
  const { q } = await searchParams;
  ...
}
```

### 2.2. Server Actions & Forms (React 19)
Sử dụng `useActionState` thay vì `useFormState` (đã deprecated/renamed).

```tsx
'use client';
import { useActionState } from 'react';
import { updateProfile } from './actions';

export function ProfileForm() {
  // state: { message: string, errors?: {} }
  const [state, formAction, isPending] = useActionState(updateProfile, null);

  return (
    <form action={formAction}>
      <input name="name" />
      <button disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
      {state?.message && <p className="text-red-500">{state.message}</p>}
    </form>
  );
}
```

### 2.3. Data Fetching & Caching
*   **Mặc định**: Next.js fetch cache behavior thay đổi. Nên tường minh.
*   **Static**: `fetch('...', { cache: 'force-cache' })` (Mặc định cho static pages).
*   **Dynamic**: `fetch('...', { cache: 'no-store' })` (Luôn lấy mới - dùng cho Booking/Realtime).
*   **Revalidate**: `fetch('...', { next: { revalidate: 60 } })`.

---

## 3. SHADCN UI + TAILWIND V4

### 3.1. CSS-First Configuration (`globals.css`)
Tailwind v4 bỏ `tailwind.config.js` cho phần lớn cấu hình. Dùng `@theme` block.

```css
@import "tailwindcss";
@import "tw-animate-css"; /* Animation plugin tương thích */

@custom-variant dark (&:is(.dark *));

:root {
  /* Định nghĩa biến màu OKLCH cho gam màu rộng hơn */
  --background: oklch(1 0 0);
  --foreground: oklch(0.12 0 0);
  --primary: oklch(0.25 0.1 260); /* Ví dụ màu xanh Synapse */
  /* ... các biến shadcn khác ... */
}

.dark {
  --background: oklch(0.12 0 0);
  --foreground: oklch(0.98 0 0);
}

@theme {
  /* Map biến CSS vào Tailwind classes */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);

  /* Fonts */
  --font-sans: var(--font-inter), ui-sans-serif, system-ui;

  /* Keyframes & Animations (nếu custom) */
}
```

### 3.2. Component Rules
*   **Giữ nguyên bản**: Không sửa code trong `src/shared/ui` trừ khi fix bug critical.
*   **Không 'Compact' gượng ép**: Shadcn thiết kế 'airy' (thoáng). Không dùng `h-8` hay `text-xs` tràn lan để nén giao diện.
*   **Icons**: Sử dụng `lucide-react`. Chuẩn size `h-4 w-4` cho button icons.

---

## 4. STATE MANAGEMENT STRATEGY

### 4.1. Server State (Ưu tiên số 1)
*   **URL Search Params**: Nguồn sự thật (Source of Truth) cho Filters, Pagination, Search query.
    *   *Lợi ích*: Share được URL, bookmark được, Server Component truy cập được ngay để pre-render.
*   **TanStack Query**: Sử dụng cho data cần caching phía client, auto-refetch, hoặc `infinite scroll` phức tạp mà Server Actions khó xử lý mượt.

### 4.2. Client State (Hạn chế)
*   Chỉ dùng `useState`/`useReducer` cho UI ephemeral state (Is Sidebar Open?, Is Dropdown Visible?, Form inputs chưa submit).
*   **Zustand**: Chỉ dùng nếu cần global client state phức tạp (vd: Shopping Cart, Audio Player state). Với dự án này (Booking), URL params + React Query thường là đủ.

## 5. REFACTORING STEPS (Dự kiến)
1.  **Init New Project**: Tạo folder `src` mới với cấu trúc module.
2.  **Setup Tailwind 4**: Config `globals.css` chuẩn OKLCH.
3.  **Port Shared UI**: Copy shadcn components từ backup sang `shared/ui`, kiểm tra lỗi style với TW4.
4.  **Feature Migration**: Di chuyển từng tính năng (Auth -> Dashboard -> Schedule) và refactor sang Server Actions + Async Params.
