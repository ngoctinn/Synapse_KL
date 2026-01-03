# RESEARCH: HYBRID ARCHITECTURE (NEXT.JS + FASTAPI + SUPABASE)
**(Updated: 2026-01-03 - Adjusted based on KTHT Diagram)**

Dựa trên sơ đồ kiến trúc `KTHT (1).drawio`, mô hình chuẩn cho Synapse_KL là **Hybrid Architecture** kết hợp giữa Next.js (Presentation), FastAPI (Business Logic), và Supabase (Auth/Realtime).

## 1. MÔ HÌNH TỔNG QUAN

```mermaid
[Client UI] --(1) Supabase SDK--> [Supabase Auth/Realtime]
[Client UI] --(2) REST/Bearer--> [FastAPI Entrypoint]
[Next.js Server] --(3) REST/Bearer--> [FastAPI Entrypoint]
[FastAPI] --(4) SQLModel--> [PostgreSQL]
[FastAPI] --(5) Push Job--> [Redis Queue] -> [Solver Worker]
```

### Điểm khác biệt so với mô hình BFF thuần túy:
1.  **Auth Source**: Sử dụng **Supabase Auth** là nguồn sự thật (Single Source of Truth). Token là **JWT** (Bearer).
2.  **Direct Communication**: Client có thể gọi trực tiếp FastAPI (với Token) cho các tác vụ cần độ trễ thấp hoặc realtime feedback mà không nhất thiết phải qua Server Actions proxy (nhưng khuyên dùng Server Actions cho Mutations).
3.  **Realtime**: Client kết nối trực tiếp Supabase Realtime để nhận update (VD: Grid changes).

---

## 2. QUY TRÌNH AUTHENTICATION (SUPABASE BASED)

Chúng ta sử dụng thư viện `@supabase/ssr` để đồng bộ Cookies giữa Client và Next.js Server.

### 2.1. Login Flow
1.  User nhập user/pass tại Client.
2.  Client gọi `supabase.auth.signInWithPassword`.
3.  Supabase trả về Session (Access Token + Refresh Token).
4.  Cookies được set tự động bởi `@supabase/ssr` (share được cho Next.js Server).

### 2.2. Token Propagation
Để gọi FastAPI từ Next.js (Server Components/Actions), ta lấy token từ Cookie Supabase:

```typescript
// shared/lib/api-client.ts
import { createClient } from '@/shared/lib/supabase/server'

export async function getAuthHeaders() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  return {
    Authorization: `Bearer ${session?.access_token || ''}`,
    'Content-Type': 'application/json'
  }
}
```

## 3. DATA FETCHING STRATEGY

### 3.1. Server Fetching (Ưu tiên cho Initial Load / SEO)
Sử dụng trong `app/**/page.tsx` và `layout.tsx`.

```typescript
// app/schedule/page.tsx
export default async function SchedulePage() {
  const headers = await getAuthHeaders()
  // Gọi trực tiếp FastAPI từ Next Server
  const res = await fetch(`${API_URL}/services`, { headers })
  const data = await res.json()

  return <ScheduleGrid initialData={data} />
}
```

### 3.2. Client Fetching (Cho High-Interactivity / Grid)
Với `Scheduling Grid` phức tạp, có thể dùng **TanStack Query** gọi trực tiếp FastAPI từ Client (hoặc qua Server Action tùy perf). Nếu gọi trực tiếp, cần lấy token từ `supabase-js` client.

*   *Khuyến nghị*: Vẫn ưu tiên gọi qua **Server Actions** để ẩn logic endpoint và handle lỗi tập trung, trừ khi cần performance cực cao (bypass 1 hop Next.js).

### 3.3. Mutations (Ghi dữ liệu)
Sử dụng **Server Actions** là chuẩn nhất để đảm bảo Validation và Revalidation.

```typescript
// features/booking/actions.ts
'use server'
import { getAuthHeaders } from '@/shared/lib/api-client'

export async function createBooking(data: BookingSchema) {
  // 1. Validate Zod
  // 2. Get Header (Bearer Token)
  const headers = await getAuthHeaders()

  // 3. Call FastAPI
  const res = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers
  })

  // 4. Revalidate Path để Server Component load lại
  revalidatePath('/schedule')
}
```

---

## 4. REALTIME UPDATES (QUAN TRỌNG)

Sơ đồ KTHT chỉ rõ đường `Realtime Updates` nối PostgreSQL -> Next.js (Client).

1.  **Cấu hình Supabase**: Enable `Realtime` cho các bảng `bookings`, `shifts`.
2.  **Client Component**: Subscribe thay đổi.

```typescript
// features/schedule/hooks/use-realtime-schedule.ts
useEffect(() => {
  const channel = supabase
    .channel('schedule-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' },
      (payload) => {
        // Update Local State / Query Cache
        queryClient.invalidateQueries({ queryKey: ['bookings'] })
      }
    )
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [])
```

---

## 5. TỔNG KẾT
Kiến trúc đúng theo sơ đồ là:
1.  **Next.js Server**: Gọi FastAPI bằng Bearer Token (lấy từ Supabase Cookie).
2.  **FastAPI**: Xác thực JWT bằng `SUPABASE_JWT_SECRET`.
3.  **Realtime**: Client lắng nghe trực tiếp từ Supabase.
4.  **Database**: FastAPI toàn quyền ghi (qua SQLModel). Client chỉ đọc Realtime hoặc gọi API.
