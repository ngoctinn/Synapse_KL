# FE_RULES_NEXT16_HYBRID (v2025.12)
- **Source**: `MASTER_FRONTEND_RULES.md`.
- **Stack**: Next.js 16, React 19, Tailwind v4, Shadcn/ui, Supabase SSR.
- **Package Manager**: pnpm

## 1. ARCHITECTURE: MODULAR BFF
- **Structure**: `features/` (Logic) vs `shared/` (UI).
- **BFF Pattern**: Server Actions (Next.js) gọi API FastAPI (Backend).
- **Middleware**: Chỉ dùng để bảo vệ Route UI (Redirect 307). API Auth do FastAPI lo.

## 2. DATA FETCHING (SERVER ACTIONS)
- **Fetch Wrapper**: BẮT BUỘC dùng `fetchWithAuth()` để forward Cookies.
- **Validation**: Zod validate payload tại Server Action trước khi gọi API.
- **Action State**: Dùng `useActionState` (React 19) để handle form response.

## 3. UI/UX STANDARDS (SHADCN + TW4)
- **Styling**: Config màu/font trong `globals.css` (`@theme`). Không dùng `tailwind.config.js`.
- **Customization**:
  - Ưu tiên `className` override.
  - Sửa file gốc (`shared/ui`) CHỈ KHI thay đổi Design System (thêm Variant).
  - **Form Pattern**: Dùng `form.tsx` shadcn (`FormField`, `FormItem`, `FormControl`) + `zodResolver`.
- **Data Table**: State (Page/Sort) phải nằm trên URL (`searchParams`).

## 4. REALTIME STRATEGY
- **Client-Side Only**: Subscribe `supabase-js` ở `useEffect`.
- **Event**: Lắng nghe `postgres_changes` từ bảng `bookings`/`shifts`.
- **Action**: Invalidate Query Cache khi có sự kiện (tuyệt đối không mutate state thủ công).
