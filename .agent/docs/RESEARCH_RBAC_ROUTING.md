# RESEARCH: PHÂN QUYỀN & CẤU TRÚC ROUTE CHO 4 NHÓM NGƯỜI DÙNG (NEXT.JS 16)
**(Updated: 2026-01-03)**

Tài liệu này đề xuất chiến lược Route & Authorization tối ưu cho 4 nhóm người dùng: **Manager, Receptionist, Technician, Customer**.

## 1. CHIẾN LƯỢC TỔNG QUAN

Chúng ta sẽ sử dụng kết hợp **Middleware** (để redirect nhanh) và **Route Groups** (để tách biệt Layout/UI).

### 1.1. 4 Nhóm Roles
1.  **MANAGER** (`admin`): Quản trị hệ thống, báo cáo, cấu hình. (Desktop).
2.  **RECEPTIONIST** (`desk`): Vận hành, Booking Grid, POS. (Desktop High-Density).
3.  **TECHNICIAN** (`tech`): Xem lịch, cập nhật trạng thái. (Mobile-First).
4.  **CUSTOMER** (`portal`): Đặt lịch, lịch sử. (Responsive).

### 1.2. Nguyên tắc "Portal Separation"
Thay vì gộp chung, hãy coi mỗi role là một "sub-app" riêng biệt với Layout và URL prefix khác nhau.
*   Manager -> `/admin`
*   Receptionist -> `/desk`
*   Technician -> `/tech`
*   Customer -> `/portal`

---

## 2. CẤU TRÚC THƯ MỤC (PROPOSED STRUCTURE)

Sử dụng **Route Groups** (thư mục trong `()`) để tách Layout mà không ảnh hưởng URL sâu bên trong, hoặc dùng thư mục thường để định hình URL prefix.

```
src/app/
├── (public)/             # Landing page, Marketing
│   ├── page.tsx          # /
│   └── layout.tsx        # Public Layout (Header/Footer nhẹ)
│
├── (auth)/               # Login/Register chung hoặc riêng
│   ├── login/            # /login
│   └── layout.tsx        # Auth Layout (Center box)
│
├── admin/                # ZONE: MANAGER
│   ├── layout.tsx        # AdminSidebar, Dashboard Shell
│   ├── page.tsx          # /admin (Dashboard)
│   ├── report/           # /admin/report
│   └── settings/         # /admin/settings
│
├── desk/                 # ZONE: RECEPTIONIST
│   ├── layout.tsx        # Full-width Layout (Booking Grid tối ưu)
│   ├── page.tsx          # /desk (Booking Grid chính)
│   └── customers/        # /desk/customers
│
├── tech/                 # ZONE: TECHNICIAN (Mobile First)
│   ├── layout.tsx        # Mobile Navigation Bar (Bottom Tab)
│   ├── page.tsx          # /tech (Lịch hôm nay)
│   └── history/          # /tech/history
│
└── portal/               # ZONE: CUSTOMER
    ├── layout.tsx        # Customer Header/Menu
    ├── page.tsx          # /portal (Home Dashboard)
    ├── booking/          # /portal/booking
    └── history/          # /portal/history
```

---

## 3. CƠ CHẾ BẢO VỆ (SECURITY LAYERS)

### 3.1. Layer 1: Middleware (`middleware.ts`)
Tầng bảo vệ đầu tiên. Kiểm tra Session Cookie và Redirect ngay lập tức nếu sai role.

```typescript
// middleware.ts (Pseudocode)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from '@/shared/auth'

const ROLE_PATHS = {
  manager: '/admin',
  receptionist: '/desk',
  technician: '/tech',
  customer: '/portal',
}

export async function middleware(req: NextRequest) {
  const session = await getSession(req)
  const path = req.nextUrl.pathname

  // 1. Chưa login -> Redirect về Login
  if (!session && isProtectedRoute(path)) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 2. Đã login nhưng vào sai khu vực (VD: Customer vào /admin)
  if (session) {
    const allowedPrefix = ROLE_PATHS[session.role] // vd: /portal

    // Nếu đang cố vào /admin mà role là customer -> Đá về /portal
    if (path.startsWith('/admin') && session.role !== 'manager') {
       return NextResponse.redirect(new URL(allowedPrefix, req.url))
    }
    // ... tuong tu cac role khac
  }

  return NextResponse.next()
}
```

### 3.2. Layer 2: Layout Guards (`layout.tsx`)
Tầng bảo vệ thứ hai (Server Components). Đảm bảo data không bao giờ render nếu bypass được middleware.

```typescript
// src/app/admin/layout.tsx
export default async function AdminLayout({ children }) {
  const session = await getSession()

  if (session?.role !== 'manager') {
    // Double check: Redirect hoặc báo lỗi 403
    redirect('/unauthorized')
  }

  return <AdminSidebar>{children}</AdminSidebar>
}
```

### 3.3. Layer 3: Data Access (DAL)
Trong các Server Actions hoặc API calls, luôn check role lần cuối trước khi query DB.

---

## 4. UI EXPERIENCE PER ROLE

| Role | Layout đặc trưng | Ưu tiên UX |
| :--- | :--- | :--- |
| **Manager** | Sidebar (Collapsible), Dense Data Tables | Analytics Charts, Settings Forms |
| **Receptionist** | Header Toolbar, Full-screen Grid | Tốc độ thao tác (Hotkeys), Drag & Drop |
| **Technician** | Bottom Tab Navigation (Mobile App style) | Nút bấm to, Swipe actions, Dark mode |
| **Customer** | Modern Card Layout, Visual rich | Ảnh đẹp, Bước đặt lịch đơn giản (Wizard) |

## 5. KẾ HOẠCH HÀNH ĐỘNG
1.  **Refactor Route**: Di chuyển các page hiện tại vào đúng thư mục (`admin/`, `desk/`...).
2.  **Setup Middleware**: Cấu hình matcher và logic redirect theo role.
3.  **Create Layouts**: Tạo 4 layout riêng biệt tối ưu cho từng đối tượng.
