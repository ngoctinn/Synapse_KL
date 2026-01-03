
# BE_RULES_FASTAPI_HYBRID (v2025.12)
- **Docs**: BẮT BUỘC tham khảo `RESEARCH_FASTAPI_SQLMODEL.md`.
- **Stack**: Python 3.12, FastAPI, SQLModel, Supabase Auth (JWT), PostgreSQL.

## 1. KIẾN TRÚC (3-LAYER)
- **Flow**: Router -> Service -> Model.
- **Model**: Tách biệt `Base`, `Table` (DB), và `Public/Create/Update` (API).
- **Authentication**:
  - KHÔNG tự quản lý User Password (để Supabase lo).
  - Middleware: Validate Bearer Token từ Header (dùng `PyJWT` decode `SUPABASE_JWT_SECRET`).

## 2. DATABASE & ASYNC
- **Session**: `expire_on_commit=False` (BẮT BUỘC cho Async).
- **Queries**: Sử dụng `selectinload` cho quan hệ (Eager Loading).
- **Migrations**: Import TẤT CẢ models vào `env.py` của Alembic.

## 3. REALTIME (CDC)
- **Pattern**: Write to DB -> Postgres WAL -> Supabase Realtime -> Client.
- **Không dùng FastAPI WebSockets** để broadcast data thay đổi (trừ khi chat ephemeral).
- **Consistency**: Data trong DB là Source of Truth duy nhất.

## 4. GIAO THỨC CHUẨN
- **Errors**: Return JSON `{"detail": "Message"}`.
- **Validation**: Pydantic v2 `model_dump(exclude_unset=True)` cho PATCH updates.
