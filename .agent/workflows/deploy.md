---
description: Hướng dẫn chi tiết các bước triển khai (deploy) dự án Synapse_KL
---

# Quy trình Triển khai Dự án Synapse_KL

Tài liệu này hướng dẫn cách triển khai toàn bộ hệ thống (Frontend, Backend, Database) lên môi trường Production.

## 1. Chuẩn bị Cơ sở dữ liệu & Auth (Supabase)
Dự án sử dụng Supabase làm backend-as-a-service.
- Truy cập [Supabase Dashboard](https://supabase.com).
- Tạo Project mới (nếu chưa có).
- Chạy các migration SQL (nếu có) trong `backend/migrations` hoặc thông qua Supabase CLI.
- Lấy thông tin kết nối: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, và mã kết nối DB.

## 2. Triển khai Backend (FastAPI)
Đề xuất: **Render**, **Railway**, hoặc **Fly.io**.

### Các biến môi trường cần thiết:
- `DATABASE_URL`: URL kết nối PostgreSQL từ Supabase.
- `SUPABASE_URL`: URL của dự án Supabase.
- `SUPABASE_ANON_KEY`: Anon key.
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key.
- `ENVIRONMENT`: `production`

### Các bước thực hiện:
1. Kết nối kho mã nguồn (GitHub/GitLab) với dịch vụ Hosting.
2. Cấu hình lệnh cài đặt: `pip install uv && uv sync --frozen`.
3. Cấu hình lệnh chạy: `uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

## 3. Triển khai Frontend (Next.js)
Đề xuất: **Vercel** (Tối ưu nhất cho Next.js).

### Các biến môi trường cần thiết:
- `NEXT_PUBLIC_SUPABASE_URL`: URL dự án Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon key.
- `NEXT_PUBLIC_API_URL`: URL của Backend đã triển khai ở bước 2.

### Các bước thực hiện:
1. Import dự án vào Vercel từ GitHub.
2. Chọn thư mục Root là `frontend`.
3. Cấu hình Build settings:
   - Framework Preset: `Next.js`
   - Build Command: `pnpm build`
   - Install Command: `pnpm install`
4. Thêm các biến môi trường vào phần `Environment Variables`.
5. Nhấn **Deploy**.

## 4. Cấu hình CORS
Bổ sung URL của Frontend vào cấu hình CORS của Backend để cho phép các yêu cầu từ trình duyệt.
- Cập nhật biến `ALLOWED_ORIGINS` trong mã nguồn backend hoặc biến môi trường.

## 5. Lưu ý quan trọng
- Luôn sử dụng HTTPS cho cả Frontend và Backend.
- Đảm bảo các biến bí mật (Secret keys) không được đẩy lên GitHub công khai.
- Chạy `npm run lint` và `uv run pytest` trước khi triển khai để tránh lỗi runtime.
