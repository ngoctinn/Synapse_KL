---
trigger: always_on
description: Các bài học kỹ thuật quan trọng rút ra từ quá trình phát triển Synapse (Backend & Frontend).
---

# LESSONS_LEARNED_V2025

## 1. NEXT.JS 16 & PERFORMANCE
- **Async Page & Loading.tsx**: Luôn dùng Async Page chuẩn + `loading.tsx` thay vì tự tạo Fetcher/Suspense thủ công để tránh blocking rendering.
- **Lazy Loading Tabs**: Dùng `next/dynamic` với `ssr: false` cho nội dung Tabs nặng để hiện Skeleton cục bộ ngay khi chuyển tab.
- **Hydration Mismatch**: Thêm `suppressHydrationWarning` vào thẻ `<body>` khi dùng cả Inter và Roboto variable fonts.
- **Deep Compare**: Hạn chế `JSON.stringify` trong `useEffect` hoặc `render loop`. Dùng shallow compare hoặc `useRef` guard để tránh Jank 5s+ và Infinite Loop.

## 2. BACKEND & INFRASTRUCTURE
- **CORS Configuration**: Phải cấu hình `BACKEND_CORS_ORIGINS` rõ ràng (gồm `localhost:3000`) và middleware phải chạy không điều kiện (bỏ `if settings.CORS`).
- **Supabase Pooler**: Kết nối Pooler (port 5432/6543) yêu cầu `Generic SSL Context` (disable hostname check) trong `asyncpg`.
- **Validation Resilience**: Endpoint phải luôn trả về structure chuẩn kể cả khi data rỗng (tránh crash client).

## 3. WORKFLOW OPTIMIZATION
- **Cleanup First**: Trước khi tối ưu, phải đảm bảo code chạy được ("Make it work, then make it right").
- **Guard Loops**: Khi đồng bộ state 2 chiều (Parent <-> Child), luôn dùng cờ hiệu (`useRef flag`) để ngắt vòng lặp update.

## 4. DATA FORMAT (FE <-> BE)
- **Date**: Python `date` cần `YYYY-MM-DD`. Dùng `format(date, "yyyy-MM-dd")`, **không** dùng `toISOString()`.
- **Time**: Backend trả `HH:mm:ss`, UI cần `HH:mm`. Luôn `.slice(0,5)` khi nhận data từ API.
- **ID Fallback**: Nếu BE không trả `id`, FE tự gen (`date + index` hoặc `crypto.randomUUID()`).

## 5. TABS & INSTANT SWITCHING
- **forceMount={true}**: Dùng cho `TabsContent` để giữ DOM luôn tồn tại, tránh mount/unmount nặng.
- **CSS Hidden**: Kết hợp `data-[state=inactive]:hidden` thay vì rely vào Radix default unmount.
- **Avoid Dynamic Import cho Tab mặc định**: Tab đầu tiên nên static import để không có loading flash.

## 6. isDirty & SAVE STATE
- **Sync cả 2 state sau Save**: `setOriginalSettings(data)` VÀ `setSettings(data)` để reset dirty flag đúng cách.
- **Normalize response**: Chuẩn hóa data trả về từ `update` action giống hệt logic `get` action.

## 7. UX PATTERNS
- **Draft State**: Xóa/Thêm trên client chỉ là nháp. Không cần Alert Dialog cho thao tác nháp.
- **Batch Save**: Gom nhiều thay đổi -> 1 request PUT. Hiển thị indicator "Chưa lưu" rõ ràng.
- **Realtime không bắt buộc** cho Settings (ít thay đổi, ít người sửa). Cần cho Booking/Schedule.

## 8. BACKEND DEVELOPMENT
- **Python venv**: Phải dùng `.venv/Scripts/python`, không dùng global `python`.
- **uv chưa cài**: Nếu `uv` không có, dùng `ensurepip` rồi `pip install`. Command: `.venv/Scripts/python -m ensurepip --upgrade`.
- **Git Bash PATH**: Không inherit đầy đủ Windows PATH, dùng `.venv/Scripts/` trực tiếp.
- **Alembic autogenerate**: Phải import TẤT CẢ models trong `env.py` trước khi chạy `--autogenerate`.
- **sqlmodel import**: Migration file cần thêm `import sqlmodel` để dùng `AutoString` type.
- **Models order**: Tạo models theo thứ tự dependency: base tables trước, link tables sau.
- **Circular import**: Forward reference dùng `"ClassName"` (quotes) cho Relationship type hints.
- **ruff config**: Thêm `[tool.ruff]` vào `pyproject.toml`, set `line-length = 120`.

