# Synapse Spa - Backend

Hệ thống API backend cho dự án Synapse Spa, sử dụng FastAPI, SQLModel và Pydantic v2.

## Công nghệ sử dụng
- **Framework**: FastAPI
- **ORM**: SQLModel (SQLAlchemy 2.0 based)
- **Validation**: Pydantic v2
- **Database**: PostgreSQL (Async)
- **Migrations**: Alembic

## Cấu trúc thư mục (FSD-like 3-layer)
- `app/core/`: Cấu hình hệ thống, database connection, security.
- `app/modules/`: Chứa các module nghiệp vụ (Dịch vụ, Nhân viên, Lập lịch).
  - Each module: `router.py` (Giao diện API), `service.py` (Logic nghiệp vụ), `models.py` (Database schema).
- `app/api/`: Đăng ký router tổng.

## Hướng dẫn chạy nhanh
1. Cài đặt Python 3.12+
2. Cài đặt dependencies: `pip install -e .` (hoặc dùng `uv`).
3. Cấu hình file `.env`.
4. Chạy server: `uvicorn app.main:app --reload`
