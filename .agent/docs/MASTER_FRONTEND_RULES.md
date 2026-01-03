# SYNAPSE FRONTEND MASTER RULES (v2025.01)
> **Source of Truth**: Tổng hợp từ 7 tài liệu nghiên cứu kiến trúc Next.js 16 Hybrid.
> **BẮT BUỘC**: Agent phải đọc kỹ file này trước khi thực hiện bất kỳ thay đổi nào.

## 1. ARCHITECTURE: HYBRID BFF PATTERN

Chúng ta sử dụng mô hình **Next.js làm BFF (Backend for Frontend)** cho FastAPI.

### 1.1. Data Flow (Luồng dữ liệu)
*   **Write (Mutation)**: `Client UI` -> `Server Action (Next.js)` -> `FastAPI` (Validation & Logic) -> `DB`.
*   **Read (Initial)**: `Server Component (Next.js)` -> `FastAPI` (Direct Fetch) -> `Render UI`.
*   **Read (Realtime)**: `DB` -> `Supabase Realtime` -> `Client UI` (Socket).
*   **Auth**: `Supabase Auth` (JWT) là Source of Truth. Next.js chuyển tiếp Token sang FastAPI.

### 1.2. Tech Stack Mandates
*   **Framework**: Next.js 16 (App Router) + React 19.
*   **Styling**: Tailwind CSS v4 (CSS-First, `@theme` configuration).
*   **UI Library**: Shadcn/ui (Radix Primitives).
*   **Auth**: `@supabase/ssr` (Cookie-based Session).
*   **Query**: TanStack Query (chỉ dùng cho client-side polling/interaction phức tạp).

---

## 2. PROJECT STRUCTURE (MODULAR FSD)

Tuân thủ kiến trúc **Modular**, không dùng cấu trúc phẳng.

```
src/
├── app/                  # Router & Layouts (Portal Separation)
│   ├── (auth)/           # Login/Register
│   ├── admin/            # Manager Dashboard
│   ├── desk/             # Receptionist Grid
│   ├── tech/             # Technician (Mobile-first)
│   └── portal/           # Customer Booking
├── features/             # LOGIC NGHIỆP VỤ (Feature-Sliced)
│   ├── [feature-name]/   # vd: schedule, staff, booking
│   │   ├── actions.ts    # Server Actions (Mutations)
│   │   ├── components/   # UI Components riêng của feature
│   │   └── hooks/        # Hooks riêng
├── shared/               # REUSABLE (Dùng chung)
│   ├── ui/               # Shadcn Components (Giữ nguyên bản)
│   ├── lib/              # Utilities (fetcher, constants)
│   └── hooks/            # Generic hooks
└── middleware.ts         # RBAC Protection
```

### Quy tắc Dependencies:
1.  **Shared** KHÔNG phụ thuộc **Features**.
2.  **Features** KHÔNG import trực tiếp lẫn nhau (dùng Shared hoặc URL State).

---

## 3. ROUTING & RBAC STRATEGY

### 3.1. Portal Separation
Chia route theo Role để tối ưu UX riêng biệt:
*   `/admin`: Manager (Desktop-first).
*   `/desk`: Receptionist (Full-screen Grid, Hotkeys).
*   `/tech`: Technician (Mobile-first).
*   `/portal`: Customer (Mobile-first).

### 3.2. Security Layers
1.  **Middleware**: Redirect ngay lập tức nếu sai Role (vd: Customer vào `/admin`).
2.  **Layout Guards**: Server Component check role lần 2 để ngăn render nội dung.
3.  **FastAPI Guard**: Validate Bearer Token ở mọi request từ Next.js.

---

## 4. CODING PATTERNS (BEST PRACTICES)

### 4.1. Server Actions & BFF
*   **Luôn dùng Wrapper**: `fetchWithAuth(url, options)` để tự động đính kèm Token từ Cookie.
*   **Validation**: Server Actions phải validate input bằng **Zod** trước khi gọi FastAPI.
*   **Return Type**: Trả về struct chuẩn `{ success, message, fieldErrors }`.
*   **React 19**: Sử dụng `useActionState` để bind Action vào Form.

### 4.2. UI & Shadcn Customization
*   **Level 1 (90%)**: Dùng `className` để override style cục bộ.
*   **Level 2**: Tạo Wrapper Component nếu tái sử dụng nhiều.
*   **Level 3**: Chỉ sửa file trong `shared/ui` khi cần đổi Design System toàn cục (thêm Variant/Size bằng `cva`).
*   **Forbidden**: KHÔNG sửa logic nội tại (behavior) của Shadcn components.

### 4.3. Data Table & State
*   **URL First**: Phân trang, Filtering, Sorting **PHẢI** lưu trên URL (`?page=1&sort=desc`).
*   **Async Params**: Trong Next.js 16, luôn `await params` và `await searchParams`.

### 4.4. Realtime (CDC)
*   **Nguyên tắc**: Không bao giờ trust client event.
*   **Mô hình**: Client subscribe `supabase-js` channel để nghe thay đổi từ DB (do FastAPI ghi vào).
*   **Consistency**: Chỉ update UI khi nhận được tín hiệu từ Supabase Realtime (đảm bảo Data Consistency).

---

> **GHI CHÚ**: Tài liệu này thay thế mọi quy tắc Frontend cũ.
