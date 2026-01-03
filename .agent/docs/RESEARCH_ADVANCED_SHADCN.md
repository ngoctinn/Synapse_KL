# RESEARCH: ADVANCED SHADCN/UI & NEXT.JS 16 PATTERNS
**(Updated: 2026-01-03)**

Tài liệu này bổ sung các Best Practices chuyên sâu về Shadcn/UI trong môi trường Next.js 16 (App Router), tập trung vào Form, DataTable và Dialog management.

## 1. FORM & SERVER ACTIONS (REACT 19 STANDARD)

### 1.1. Architecture: Controlled Form vs Server Actions
Kết hợp `react-hook-form` (Client Validation UX) với `Server Actions` (Security & Mutation).

*   **Client Side (Zod)**: Validate format (email, min/max) để phản hồi tức thì.
*   **Server Side (Zod)**: Re-validate payload trong Action để bảo mật.

### 1.2. The "Form Action" Pattern (Recommended)
Sử dụng `useActionState` (React 19) để bind Server Action vào Form `onsubmit`.

```tsx
// features/auth/login-form.tsx
'use client'
import { useActionState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginAction } from './actions'
import { loginSchema } from './schemas'

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  })

  // Trick: Form của RHF validate trước, nếu OK mới gọi formAction
  return (
    <Form {...form}>
      <form action={formAction} onSubmit={(evt) => {
        evt.preventDefault() // Chặn default
        form.handleSubmit(() => {
           // Nếu RHF validate OK -> Trigger server action thủ công
           // Hoặc dùng startTransition.
           // Tuy nhiên pattern chuẩn Shadcn là:
           // onSubmit={form.handleSubmit((data) => startTransition(() => action(data)))}
        })(evt)
      }}>
       ...
      </form>
    </Form>
  )
}
```
*Correction*: Với `useActionState`, cách tốt nhất là dùng `action={formAction}` trực tiếp trên form và để Server validate. Nếu cần Client validate, dùng `onSubmit` của RHF và gọi `startTransition` để wrap Server Action.

**Best Practice (Hybrid):**
```tsx
const onSubmit = (data: z.infer<typeof schema>) => {
  startTransition(async () => {
    const result = await loginAction(data)
    if (result?.error) {
      form.setError('root', { message: result.error })
    }
  })
}
```

## 2. DATA TABLE & URL STATE

DataTable (TanStack Table) nên là **Controlled Component** hoàn toàn được điều khiển bởi URL Search Params.

### 2.1. URL-Driven State (Source of Truth)
KHÔNG dùng state nội bộ (`useState`) cho Pagination/Sorting.

```tsx
// app/admin/users/page.tsx
export default async function UsersPage({ searchParams }: { searchParams: Promise<any> }) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const sort = params.sort || 'created_at.desc'

  const data = await getUsers({ page, sort }) // Fetch Server

  return <DataTable data={data} initialSort={sort} />
}
```

### 2.2. Reusable DataTable Component
Tách biệt `GenericDataTable` (chỉ render) và `FeatureDataTable` (chứa logic columns).

*   **Pagination**: Component phân trang phải là `Link` filters (dùng `?page=2`), không phải `button onClick`. Lý do: SEO & Shareable.
*   **Filtering**: Debounced Input update URL (`router.replace` + `shallow: true` (Next 13/14) hoặc `history.pushState` (Next 15+)).

## 3. DIALOG & SHEET MANAGEMENT

### 3.1. Responsive Dialog (Drawer on Mobile)
Sử dụng Pattern `useMediaQuery` để render `Sheet/Drawer` trên Mobile và `Dialog` trên Desktop.
Giúp UX tốt nhất cho cả 2 nền tảng.

```tsx
// shared/ui/responsive-modal.tsx
if (isDesktop) return <Dialog>...</Dialog>
return <Drawer>...</Drawer>
```

### 3.2. Parallel Routes for Modals (Advanced)
Để Modal có URL riêng (vd: `/schedule/edit/123` mở modal trên nền `/schedule`), sử dụng **Interception Routes** `(.)edit/[id]`.
*   *Lợi ích*: F5 vẫn giữ modal, Back button đóng modal.
*   *Áp dụng*: Booking Detail, Edit Profile.

## 4. COMPONENT COMPOSITION
Tránh "Prop Drilling". Sử dụng `Slot` (Radix UI) hoặc `Children` composition.

**Bad:**
```tsx
<CustomCard title="ABC" description="XYZ" footerButton={<Button>OK</Button>} />
```

**Good (Shadcn Style):**
```tsx
<Card>
  <CardHeader>
    <CardTitle>ABC</CardTitle>
    <CardDescription>XYZ</CardDescription>
  </CardHeader>
  <CardFooter>
    <Button>OK</Button>
  </CardFooter>
</Card>
```
Luôn ưu tiên Composition để linh hoạt styling.

## 5. TỔNG KẾT
1.  **Form**: Client Validation (RHF) + Server Binding (Action).
2.  **Table**: URL Search Params là Source of Truth.
3.  **Modals**: Responsive (Dialog/Drawer) hoặc URL-based (Parallel Routes).
4.  **Style**: Composition over Configuration.
