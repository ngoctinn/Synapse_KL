# NGHIÊN CỨU: HYBRID ARCHITECTURE VERIFICATION
**(Updated: 2026-01-03)**

Kết quả kiểm chứng (Verification) mô hình Hybrid (Next.js + FastAPI + Supabase) dựa trên tài liệu chính thức:

## 1. NEXT.JS ↔ FASTAPI (Xác thực JWT)
Mô hình "Pass-through Auth Token" (Truyền Token) là **CHÍNH XÁC** và được khuyến nghị khi tách rời Frontend/Backend.

### Tại sao đúng?
*   **Next.js (@supabase/ssr)**: Lưu session JWT trong HttpOnly Cookie/Header.
*   **FastAPI Authentication**: Có thể sử dụng `PyJWT` để decode JWT này.
    *   Cần `SUPABASE_JWT_SECRET` để verify signature.
    *   Validate `aud` (authenticated) và `exp` (expiration).
*   **Lợi ích**: Không cần tạo User Table riêng ở FastAPI. Tận dụng RLS của Supabase nếu FastAPI gọi lại Database.

## 2. REALTIME ARCHITECTURE (CDC Pattern)
Mô hình "Write to Backend -> Read from Realtime" là **Change Data Capture (CDC)** pattern kinh điển.

```mermaid
[Client/Action] --(1. Update)--> [FastAPI] --(2. Commit)--> [PostgreSQL] --(3. BinLog)--> [Supabase Realtime] --(4. Socket)--> [Client]
```

### Tại sao đúng?
*   **Single Source of Write**: FastAPI kiểm soát toàn bộ Logic ghi (Validation, Trigger Solver). Tránh ghi trực tiếp từ Client (không an toàn).
*   **Realtime Feedback**: Client nhận phản hồi qua Socket ngay khi DB thay đổi, không cần FastAPI phải bắn Socket thủ công (giảm tải cho Backend).

## 3. TRIỂN KHAI CHI TIẾT (IMPLEMENTATION PLAN)

### 3.1. Supabase Auth Config
*   Cài đặt `@supabase/ssr` cho Next.js 16.
*   Middleware Next.js để refresh token tự động (quan trọng).

### 3.2. FastAPI Auth Middleware
Thêm middleware vào FastAPI để tự động reject request không có Bearer Token hợp lệ.

```python
# fastAPI deps
async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], audience="authenticated")
        return Payload(payload)
    except:
        raise HTTPException(401, "Invalid Token")
```

### 3.3. BFF Integration
*   Sử dụng `fetchWithAuth` wrapper đã thiết kế ở bước trước để luôn đính kèm Token.
*   Đảm bảo Next.js Server Components handle lỗi 401 từ FastAPI (redirect về login).

---
**KÊT LUẬN**: Kiến trúc Hybrid này **Solid & Scalable**.
1.  Tận dụng hệ sinh thái Auth/Realtime có sẵn (không phải code lại).
2.  Giữ việc xử lý nghiệp vụ nặng (Scheduling) ở Python/FastAPI.
3.  Next.js tập trung vào UX và SEO.
