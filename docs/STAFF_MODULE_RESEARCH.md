# NGHIÊN CỨU STAFF MODULE - SUPABASE BEST PRACTICES

> **Research Date:** 2026-01-03
> **Status:** ✅ Completed - Chưa implement
> **Sources:** Supabase Official Docs, Context7 Code Examples

---

## I. KIẾN TRÚC CHUẨN SUPABASE USER MANAGEMENT

### 1.1. Schema Design Pattern

**✅ PATTERN CHUẨN từ Supabase Official Docs:**

```sql
-- 1. Bảng auth.users (Supabase quản lý tự động)
-- Không tạo thủ công, Supabase Auth tự động handle

-- 2. Bảng public.profiles (Sync với auth.users via Trigger)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,                    -- Sync từ auth.users
    full_name TEXT,
    phone_number TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'customer',  -- Hoặc dùng ENUM
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bảng staff_profiles (Thông tin chi tiết nhân viên)
CREATE TABLE public.staff_profiles (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'Kỹ thuật viên',
    bio TEXT,
    color_code TEXT DEFAULT '#6366F1'
);
```

**🔑 KEY INSIGHTS:**
- ❌ **KHÔNG** tạo bảng `users` riêng - Supabase Auth đã có `auth.users`
- ✅ Tạo `public.profiles` để sync metadata từ `auth.users`
- ✅ Foreign Key: `profiles.id` → `auth.users(id)` với `ON DELETE CASCADE`
- ✅ `staff_profiles` chỉ lưu thông tin RIÊNG của staff, không duplicate data

---

### 1.2. Automatic Profile Creation (Database Trigger)

**✅ SUPABASE OFFICIAL PATTERN:**

```sql
-- Function xử lý tạo profile tự động
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    -- Insert profile với metadata từ auth.users
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
    );
    RETURN NEW;
END;
$$;

-- Trigger tự động chạy khi user mới được tạo
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

**🔑 KEY INSIGHTS:**
- ✅ `SECURITY DEFINER` để function chạy với quyền postgres role
- ✅ `SET search_path = ''` để tránh schema injection attacks
- ✅ Lấy metadata từ `raw_user_meta_data` (JSON) thay vì hardcode
- ✅ `ON DELETE CASCADE` để auto cleanup khi user bị xóa

---

## II. SUPABASE AUTH ADMIN API - INVITE FLOW

### 2.1. Backend Endpoint Pattern

**✅ PYTHON IMPLEMENTATION (FastAPI + Supabase Admin SDK):**

```python
from supabase import create_client, Client
from fastapi import APIRouter, HTTPException, Depends
from pydantic import EmailStr

router = APIRouter(prefix="/staff", tags=["Staff"])

# Khởi tạo Supabase Admin Client
def get_supabase_admin() -> Client:
    """Supabase client với service_role key (có admin privileges)"""
    return create_client(
        supabase_url=settings.SUPABASE_URL,
        supabase_key=settings.SUPABASE_SERVICE_ROLE_KEY  # ⚠️ SECRET - Server only!
    )

@router.post("/invite")
async def invite_staff(
    email: EmailStr,
    full_name: str,
    title: str = "Kỹ thuật viên",
    role: str = "technician",
    supabase: Client = Depends(get_supabase_admin)
):
    """
    Mời nhân viên mới qua email.

    Flow:
    1. Gọi Supabase Auth API: inviteUserByEmail()
    2. Supabase tạo user trong auth.users với status INVITED
    3. Supabase gửi email với magic link
    4. User click link → set password → trigger tạo profile
    """
    try:
        # Call Supabase Admin API
        response = supabase.auth.admin.invite_user_by_email(
            email=email,
            options={
                "data": {
                    "full_name": full_name,
                    "role": role,
                    "title": title
                },
                "redirect_to": f"{settings.FRONTEND_URL}/auth/callback"
            }
        )

        if response.user:
            return {
                "success": True,
                "message": f"Đã gửi thư mời đến {email}",
                "user_id": str(response.user.id)
            }
        else:
            raise HTTPException(status_code=400, detail="Không thể mời user")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**🔑 KEY INSIGHTS:**
- ✅ Dùng `service_role_key` (ADMIN key) - **KHÔNG BAO GIỜ** expose ra client
- ✅ `options.data` lưu metadata vào `raw_user_meta_data`
- ✅ `redirect_to` để điều hướng user sau khi accept invite
- ⚠️ **PKCE NOT SUPPORTED** trong invite flow (theo docs)

---

### 2.2. Frontend Flow

**❌ WRONG (Current Implementation):**
```tsx
// ❌ Frontend tự tạo staff_profile với user_id hardcoded
const createStaff = async (data) => {
    await fetch('/api/staff', {
        body: JSON.stringify({
            user_id: "00000000-...",  // ❌ NULL UUID WTF?!
            full_name: data.full_name
        })
    });
};
```

**✅ CORRECT (Supabase Pattern):**
```tsx
// ✅ Frontend chỉ gửi email + metadata, backend handle invite
const inviteStaff = async (data: StaffInviteForm) => {
    const response = await fetch('/api/staff/invite', {
        method: 'POST',
        body: JSON.stringify({
            email: data.email,           // ✅ EMAIL là key!
            full_name: data.full_name,
            title: data.title,
            role: 'technician'
        })
    });

    if (response.ok) {
        toast.success(`Đã gửi thư mời đến ${data.email}`);
        // ✅ KHÔNG tạo staff_profile ngay - chờ user accept invite
    }
};
```

**🔑 KEY INSIGHTS:**
- ✅ Frontend KHÔNG cần biết `user_id`
- ✅ Backend tự động tạo user trong `auth.users`
- ✅ Trigger tự động tạo `profiles` + `staff_profiles`
- ✅ User nhận email → click link → set password → DONE

---

## III. RBAC VỚI CUSTOM CLAIMS

### 3.1. Custom Access Token Hook (Auth Hook)

**✅ SUPABASE OFFICIAL PATTERN:**

```sql
-- 1. Tạo ENUM cho roles
CREATE TYPE public.app_role AS ENUM ('manager', 'receptionist', 'technician', 'customer');

-- 2. Bảng user_roles để map user → role
CREATE TABLE public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'customer'
);

-- 3. Auth Hook Function - Inject role vào JWT
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    claims jsonb;
    user_role public.app_role;
BEGIN
    -- Fetch role từ user_roles table
    SELECT role INTO user_role
    FROM public.user_roles
    WHERE user_id = (event->>'user_id')::uuid;

    claims := event->'claims';

    IF user_role IS NOT NULL THEN
        -- Inject custom claim 'user_role' vào JWT
        claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    ELSE
        claims := jsonb_set(claims, '{user_role}', '"customer"');
    END IF;

    -- Return modified event
    event := jsonb_set(event, '{claims}', claims);
    RETURN event;
END;
$$;

-- 4. Grant permissions cho Auth Hook
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
GRANT ALL ON TABLE public.user_roles TO supabase_auth_admin;

-- 5. RLS Policy cho Auth Admin
CREATE POLICY "Auth admin can read user roles"
ON public.user_roles
AS PERMISSIVE FOR SELECT
TO supabase_auth_admin
USING (true);
```

**🔑 KEY INSIGHTS:**
- ✅ Auth Hook chạy TRƯỚC KHI issue JWT token
- ✅ Custom claim `user_role` được inject vào JWT payload
- ✅ Frontend/Backend đều có thể đọc role từ JWT
- ✅ `supabase_auth_admin` role cần access vào `user_roles` table

---

### 3.2. RLS Policies với Custom Claims

**✅ AUTHORIZATION HELPER FUNCTION:**

```sql
-- Function check permission dựa trên role
CREATE OR REPLACE FUNCTION public.authorize(requested_permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Lấy role từ JWT custom claim
    user_role := (auth.jwt() ->> 'user_role');

    -- Logic phân quyền
    CASE requested_permission
        WHEN 'manage_staff' THEN
            RETURN user_role IN ('manager');
        WHEN 'view_schedules' THEN
            RETURN user_role IN ('manager', 'receptionist', 'technician');
        WHEN 'create_booking' THEN
            RETURN user_role IN ('manager', 'receptionist');
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '';
```

**✅ RLS POLICY EXAMPLES:**

```sql
-- 1. Staff chỉ xem được schedule của mình
CREATE POLICY "Staff can view own schedules"
ON staff_schedules
FOR SELECT
TO authenticated
USING (
    staff_id = auth.uid() OR
    public.authorize('view_schedules')  -- Manager/Receptionist xem hết
);

-- 2. Chỉ Manager mới tạo/sửa/xóa staff
CREATE POLICY "Only managers can manage staff"
ON staff_profiles
FOR ALL
TO authenticated
USING (public.authorize('manage_staff'))
WITH CHECK (public.authorize('manage_staff'));

-- 3. Customer chỉ đọc services
CREATE POLICY "Customers can view services"
ON services
FOR SELECT
TO authenticated
USING (is_active = TRUE);
```

**🔑 KEY INSIGHTS:**
- ✅ `auth.jwt()` để đọc custom claims từ JWT
- ✅ `auth.uid()` để lấy user ID hiện tại
- ✅ Always specify `TO authenticated` để optimize performance
- ✅ `SECURITY DEFINER` cho helper functions

---

## IV. SO SÁNH IMPLEMENTATION HIỆN TẠI VS BEST PRACTICES

### 4.1. Database Schema

| Aspect | ❌ Current | ✅ Should Be |
|--------|-----------|-------------|
| User Storage | `staff_profiles.user_id` (orphan) | `profiles.id` FK to `auth.users` |
| Email Field | ❌ Không có | ✅ `profiles.email` |
| Role Field | ❌ Không có | ✅ `profiles.role` ENUM |
| Avatar | ❌ Không có | ✅ `profiles.avatar_url` |
| Duplicate Data | ✅ `staff_profiles.full_name` | ❌ Remove (đã có trong profiles) |
| Auto Sync | ❌ Manual | ✅ Database Trigger |

---

### 4.2. Invite Flow

| Step | ❌ Current | ✅ Should Be |
|------|-----------|-------------|
| 1. Admin Input | Form với user_id, full_name | Form với **email**, full_name |
| 2. Backend Call | `POST /staff` tạo staff_profile | `POST /staff/invite` gọi Supabase Admin API |
| 3. User Creation | ❌ Frontend tạo với NULL UUID | ✅ `inviteUserByEmail()` tạo user |
| 4. Email Send | ❌ Không có | ✅ Supabase tự động gửi |
| 5. Profile Creation | ❌ Manual sau khi có user_id | ✅ Auto via trigger |

---

### 4.3. RBAC Implementation

| Feature | ❌ Current | ✅ Should Be |
|---------|-----------|-------------|
| Role Storage | ❌ Không có | `user_roles` table |
| JWT Claims | ❌ Default only | Custom `user_role` claim via Auth Hook |
| Permission Check | ❌ Hardcode trong code | `authorize()` function + RLS |
| RLS Policies | ❌ Chưa có | ✅ Full policies cho mọi table |

---

## V. MIGRATION PLAN

### Phase 1: Database Schema (CRITICAL)

```sql
-- 1. Tạo ENUMs
CREATE TYPE app_role AS ENUM ('manager', 'receptionist', 'technician', 'customer');
CREATE TYPE schedule_status AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED');

-- 2. Tạo bảng profiles (sync với auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone_number TEXT,
    avatar_url TEXT,
    role app_role NOT NULL DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Refactor staff_profiles
ALTER TABLE staff_profiles DROP COLUMN full_name;  -- Duplicate
ALTER TABLE staff_profiles DROP COLUMN is_active;  -- Duplicate
ALTER TABLE staff_profiles ADD CONSTRAINT fk_staff_profile_user
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 4. Tạo trigger auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$ ... $$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Migrate existing data
INSERT INTO public.profiles (id, full_name, role)
SELECT user_id, full_name, 'technician'::app_role
FROM staff_profiles
ON CONFLICT (id) DO NOTHING;
```

---

### Phase 2: Backend Integration

```python
# 1. Install Supabase Python SDK
# pip install supabase

# 2. Tạo staff/invite endpoint
# (Xem Section II.1)

# 3. Setup Supabase Admin Client
# (Xem Section II.1)

# 4. Remove old create_staff endpoint hoặc deprecate
```

---

### Phase 3: Frontend Refactor

```typescript
// 1. Update types
interface StaffInviteInput {
    email: string;           // ✅ Add
    full_name: string;
    title?: string;
    role: 'manager' | 'receptionist' | 'technician';
}

// 2. Update actions
export async function inviteStaffAction(data: StaffInviteInput) {
    const res = await fetch(`${API_BASE}/staff/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
}

// 3. Update form
// Remove user_id field
// Add email field (required, validation)
```

---

### Phase 4: Auth Hook + RBAC

```sql
-- 1. Create user_roles table
-- 2. Implement custom_access_token_hook
-- 3. Configure in Supabase Dashboard: Auth > Hooks
-- 4. Create RLS policies for all tables
-- (Xem Section III)
```

---

## VI. SECURITY CONSIDERATIONS

### 6.1. Service Role Key Protection

⚠️ **CRITICAL:**
- `service_role_key` có **FULL ADMIN ACCESS** vào Supabase
- **NEVER** expose ra client (env variables, code, logs)
- Chỉ dùng trong server-side code
- Rotate key định kỳ

```python
# ✅ CORRECT - Server-side only
settings = Settings(
    SUPABASE_SERVICE_ROLE_KEY=os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # From .env
)

# ❌ WRONG - Never commit to Git
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOi..."  # ❌❌❌
```

---

### 6.2. RLS Policy Best Practices

```sql
-- ✅ ALWAYS specify target role
CREATE POLICY "policy_name" ON table_name
FOR SELECT
TO authenticated  -- ← Specify role!
USING (...);

-- ❌ SLOW - Policy chạy cho mọi role
CREATE POLICY "policy_name" ON table_name
USING (...);

-- ✅ Use auth.uid() in subquery for performance
USING ((SELECT auth.uid()) = user_id);

-- ❌ Direct comparison can be slower
USING (auth.uid() = user_id);
```

---

### 6.3. Email Template Customization

**Supabase Dashboard → Auth → Email Templates:**

```html
<!-- Invite Email Template -->
<h2>Chào mừng {{ .Name }} đến với Synapse Spa!</h2>
<p>Bạn đã được mời tham gia hệ thống với vai trò <strong>{{ .role }}</strong>.</p>
<p>Click vào link dưới để thiết lập mật khẩu:</p>
<a href="{{ .ConfirmationURL }}">Kích hoạt tài khoản</a>
```

---

## VII. TESTING CHECKLIST

### Backend Tests
- [ ] `POST /staff/invite` với email hợp lệ → 201 + email sent
- [ ] `POST /staff/invite` với email duplicate → 400 error
- [ ] `POST /staff/invite` với invalid email → 422 validation error
- [ ] `POST /staff/invite` without service_role_key → 403 forbidden

### Database Tests
- [ ] Insert vào `auth.users` → trigger tạo `profiles`
- [ ] Delete `auth.users` → cascade delete `profiles` + `staff_profiles`
- [ ] Auth Hook inject `user_role` vào JWT
- [ ] RLS policies block unauthorized access

### Frontend Tests
- [ ] Form validation: email required, format valid
- [ ] Success flow: invite → toast → redirect to list
- [ ] Error handling: duplicate email, network error
- [ ] Loading states: button disabled during submit

---

## VIII. REFERENCES

### Official Documentation
- [Supabase Auth Admin API](https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail)
- [Custom Claims & RBAC Guide](https://supabase.com/docs/guides/auth/custom-claims-and-role-based-access-control-rbac)
- [Managing User Data](https://supabase.com/docs/guides/auth/managing-user-data)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### Code Examples
- [User Management Starter (React)](https://github.com/supabase/supabase/tree/master/examples/user-management/react-user-management)
- [Slack Clone (RBAC Example)](https://github.com/supabase-community/slack-clone)

---

## IX. NEXT STEPS

### Immediate Action Items
1. ✅ **Review this document** with team
2. 🔄 **Discuss migration strategy** (big bang vs incremental)
3. 📝 **Create detailed implementation tasks** in project tracker
4. 🧪 **Setup staging environment** để test migration
5. 📧 **Configure email templates** trong Supabase Dashboard

### Implementation Order (Recommended)
1. **Week 1:** Database migration (schema + triggers)
2. **Week 2:** Backend invite endpoint + Supabase Admin SDK
3. **Week 3:** Frontend refactor (forms + actions)
4. **Week 4:** Auth Hook + RBAC policies
5. **Week 5:** Testing + Documentation

---

**Tác giả:** AI Assistant (Antigravity)
**Review:** Đang chờ team review
**Status:** ✅ Research Complete - Chưa implement
