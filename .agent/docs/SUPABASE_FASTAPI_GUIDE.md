# Hướng Dẫn Tích Hợp Supabase SDK với FastAPI cho Synapse Project

> **Version**: v2025.12
> **Stack**: FastAPI + SQLModel + Supabase Python SDK
> **Áp dụng cho**: Synapse - Hệ thống quản lý và chăm sóc khách hàng Spa

---

## Mục Lục

1. [Tổng Quan Kiến Trúc](#1-tổng-quan-kiến-trúc)
2. [Cài Đặt và Cấu Hình](#2-cài-đặt-và-cấu-hình)
3. [Khởi Tạo Supabase Client](#3-khởi-tạo-supabase-client)
4. [Database Operations](#4-database-operations)
5. [Authentication (GoTrue)](#5-authentication-gotrue)
6. [Storage Operations](#6-storage-operations)
7. [Edge Functions](#7-edge-functions)
8. [Realtime Subscriptions](#8-realtime-subscriptions)
9. [Row Level Security (RLS)](#9-row-level-security-rls)
10. [Best Practices cho Synapse](#10-best-practices-cho-synapse)
11. [Migration Strategy](#11-migration-strategy)

---

## 1. Tổng Quan Kiến Trúc

### 1.1 Hai Lựa Chọn Tích Hợp

| Approach | Mô Tả | Khi Nào Dùng |
|----------|-------|--------------|
| **Supabase SDK + RLS** | Sử dụng Supabase Python SDK với Row Level Security | Ứng dụng client-centric, logic auth đơn giản |
| **Direct PostgreSQL + SQLModel** | Kết nối trực tiếp PostgreSQL với SQLModel/asyncpg | Logic nghiệp vụ phức tạp (RCPSP), cần full control |

### 1.2 Kiến Trúc Hybrid (Khuyến Nghị cho Synapse)

```
┌─────────────────────────────────────────────────────────────────┐
│                        SYNAPSE BACKEND                          │
├─────────────────────────────────────────────────────────────────┤
│  FastAPI Router Layer                                           │
│  └── Endpoints, Request Validation, Status Codes                │
├─────────────────────────────────────────────────────────────────┤
│  Service Layer                                                  │
│  ├── Business Logic (RCPSP Scheduling, CRM)                     │
│  ├── SQLModel + asyncpg (Core Operations)                       │
│  └── Supabase SDK (Auth, Storage, Realtime)                     │
├─────────────────────────────────────────────────────────────────┤
│  Data Layer                                                     │
│  ├── SQLModel Entities (models.py)                              │
│  └── Supabase PostgreSQL (Cloud Database)                       │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Phân Chia Trách Nhiệm

| Component | Công Nghệ | Chức Năng |
|-----------|-----------|-----------|
| **Database CRUD** | SQLModel + asyncpg | Insert, Update, Delete, Complex Queries |
| **Authentication** | Supabase GoTrue | Sign Up, Sign In, JWT, Session Management |
| **File Storage** | Supabase Storage | Upload, Download, Public URLs |
| **Realtime** | Supabase Realtime | Live booking updates, Notifications |
| **Scheduling Engine** | Google OR-Tools | RCPSP Solver (Backend Python) |

---

## 2. Cài Đặt và Cấu Hình

### 2.1 Dependencies

Cập nhật `pyproject.toml`:

```toml
[project]
name = "synapse-backend"
version = "0.1.0"
description = "Hệ thống quản lý và chăm sóc khách hàng Spa"
readme = "README.md"
requires-python = ">=3.12"
dependencies = [
    # Core FastAPI Stack
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.30.0",
    "sqlmodel>=0.0.22",
    "pydantic-settings>=2.4.0",
    "asyncpg>=0.29.0",
    "alembic>=1.13.0",

    # Security
    "python-jose[cryptography]>=3.3.0",
    "passlib[bcrypt]>=1.7.4",
    "python-multipart>=0.0.9",
    "itsdangerous>=2.2.0",

    # Supabase SDK
    "supabase>=2.10.0",

    # Scheduling Engine
    "ortools>=9.10.0",
]
```

### 2.2 Cài Đặt

```bash
# Sử dụng uv (recommended)
uv sync

# Hoặc pip
pip install supabase>=2.10.0
```

### 2.3 Environment Variables

Tạo/cập nhật `.env`:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database (Direct Connection for SQLModel)
DATABASE_URL=postgresql+asyncpg://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# JWT Settings (Supabase JWT secret)
JWT_SECRET=your-supabase-jwt-secret
JWT_ALGORITHM=HS256
```

> **QUAN TRỌNG**:
> - `SUPABASE_ANON_KEY`: Dùng cho client-side, tuân thủ RLS
> - `SUPABASE_SERVICE_ROLE_KEY`: Bypass RLS, CHỈ dùng ở backend, KHÔNG BAO GIỜ expose ra client

---

## 3. Khởi Tạo Supabase Client

### 3.1 Cấu Hình Settings

Cập nhật `app/core/config.py`:

```python
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator, ConfigDict
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Cấu hình hệ thống Synapse.
    Env variables sẽ override các giá trị mặc định.
    """
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Synapse Spa"

    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database (Direct PostgreSQL Connection)
    DATABASE_URL: str

    # Supabase
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str

    # JWT (Supabase JWT Secret)
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    model_config = ConfigDict(
        case_sensitive=True,
        env_file=".env",
        env_file_encoding="utf-8"
    )


settings = Settings()
```

### 3.2 Supabase Client Module

Tạo `app/core/supabase.py`:

```python
from supabase import create_client, Client
from supabase.client import ClientOptions
from app.core.config import settings


def get_supabase_client() -> Client:
    """
    Tạo Supabase client với anon key.
    Dùng cho các operations tuân thủ RLS.
    """
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_ANON_KEY,
        options=ClientOptions(
            postgrest_client_timeout=10,
            storage_client_timeout=30,
        )
    )


def get_supabase_admin_client() -> Client:
    """
    Tạo Supabase client với service_role key.
    Bypass RLS - CHỈ dùng cho admin operations trong backend.

    Các trường hợp sử dụng:
    - Tạo user mới từ admin panel
    - Background jobs (cron, scheduled tasks)
    - Data migration scripts
    """
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_ROLE_KEY,
        options=ClientOptions(
            postgrest_client_timeout=10,
            storage_client_timeout=30,
        )
    )


# Singleton instances (tái sử dụng cho performance)
supabase: Client = get_supabase_client()
supabase_admin: Client = get_supabase_admin_client()
```

### 3.3 Async Client (Khuyến Nghị cho FastAPI)

Tạo `app/core/supabase_async.py`:

```python
from supabase import acreate_client, AsyncClient
from supabase.client import ClientOptions
from app.core.config import settings

# Async client instance
_async_client: AsyncClient | None = None
_async_admin_client: AsyncClient | None = None


async def get_async_supabase() -> AsyncClient:
    """
    Async Supabase client cho FastAPI.
    Non-blocking operations phù hợp với asyncio event loop.
    """
    global _async_client
    if _async_client is None:
        _async_client = await acreate_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_ANON_KEY,
            options=ClientOptions(
                postgrest_client_timeout=10,
                storage_client_timeout=30,
            )
        )
    return _async_client


async def get_async_supabase_admin() -> AsyncClient:
    """
    Async Supabase admin client.
    Bypass RLS - CHỈ dùng cho admin operations.
    """
    global _async_admin_client
    if _async_admin_client is None:
        _async_admin_client = await acreate_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
            options=ClientOptions(
                postgrest_client_timeout=10,
                storage_client_timeout=30,
            )
        )
    return _async_admin_client
```

### 3.4 FastAPI Lifespan Integration

Cập nhật `app/main.py`:

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.core.db import init_db
from app.core.supabase_async import get_async_supabase, get_async_supabase_admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup/Shutdown events cho FastAPI.
    Khởi tạo database và Supabase clients.
    """
    # Startup
    await init_db()
    await get_async_supabase()  # Warm up connection
    await get_async_supabase_admin()

    yield

    # Shutdown (cleanup if needed)


app = FastAPI(
    title="Synapse Spa API",
    lifespan=lifespan
)
```

---

## 4. Database Operations

### 4.1 Lựa Chọn: SQLModel vs Supabase SDK

| Tiêu Chí | SQLModel + asyncpg | Supabase SDK |
|----------|-------------------|--------------|
| **Complex Joins** | Tốt hơn | Hạn chế |
| **Transactions** | Full support | Không hỗ trợ |
| **Performance** | Tối ưu hơn | Overhead HTTP |
| **Type Safety** | SQLModel models | Dictionary-based |
| **RLS** | Manual check | Automatic |

### 4.2 Sử Dụng SQLModel (Khuyến Nghị cho Synapse)

Giữ nguyên approach hiện tại với SQLModel cho core business logic:

```python
# app/modules/services/models.py
from sqlmodel import SQLModel, Field, Relationship
from uuid import UUID, uuid4
from typing import Optional, List


class Service(SQLModel, table=True):
    """Model dịch vụ Spa."""
    __tablename__ = "services"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    duration_minutes: int
    price: int
    is_active: bool = True

    # Relationships
    bookings: List["Booking"] = Relationship(back_populates="service")
```

```python
# app/modules/services/service.py
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from .models import Service
from .schemas import ServiceCreate, ServiceUpdate


class ServiceCRUD:
    """Service operations với SQLModel."""

    async def create(self, db: AsyncSession, data: ServiceCreate) -> Service:
        service = Service.model_validate(data)
        db.add(service)
        await db.commit()
        await db.refresh(service)
        return service

    async def get_by_id(self, db: AsyncSession, service_id: UUID) -> Service | None:
        result = await db.execute(
            select(Service).where(Service.id == service_id)
        )
        return result.scalar_one_or_none()

    async def get_all(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> list[Service]:
        result = await db.execute(
            select(Service)
            .where(Service.is_active == True)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())


service_crud = ServiceCRUD()
```

### 4.3 Sử Dụng Supabase SDK (Khi Cần RLS Automatic)

```python
# Ví dụ: Query với RLS enforcement
from app.core.supabase import supabase


async def get_user_bookings(user_id: str):
    """
    Lấy bookings của user với RLS enforcement.
    RLS policy sẽ tự động filter theo user_id trong JWT.
    """
    response = supabase.table("bookings") \
        .select("*, services(name, duration_minutes)") \
        .eq("user_id", user_id) \
        .order("scheduled_at", desc=True) \
        .execute()

    return response.data


async def create_booking_supabase(booking_data: dict):
    """Insert với Supabase SDK."""
    response = supabase.table("bookings") \
        .insert(booking_data) \
        .execute()

    return response.data[0] if response.data else None
```

### 4.4 Query Filters Reference

```python
# Equality
.eq("column", "value")

# Not equal
.neq("column", "value")

# Greater than / Less than
.gt("column", value)
.lt("column", value)
.gte("column", value)
.lte("column", value)

# Pattern matching
.like("column", "%pattern%")
.ilike("column", "%pattern%")  # case-insensitive

# In list
.in_("column", ["value1", "value2"])

# Is null
.is_("column", "null")

# Range
.range(0, 10)  # offset, limit

# Order
.order("column", desc=True)

# Select specific columns
.select("id, name, services(name)")
```

---

## 5. Authentication (GoTrue)

### 5.1 Luồng Authentication cho Synapse

```
┌─────────────────────────────────────────────────────────────────┐
│                    SYNAPSE AUTH FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Frontend gọi Supabase Auth (signUp/signIn)                  │
│                     ↓                                           │
│  2. Supabase trả về JWT access_token                            │
│                     ↓                                           │
│  3. Frontend gửi JWT trong header: Authorization: Bearer <JWT>  │
│                     ↓                                           │
│  4. FastAPI verify JWT với Supabase JWT secret                  │
│                     ↓                                           │
│  5. Extract user info từ JWT payload                            │
│                     ↓                                           │
│  6. RLS policies tự động filter data theo user                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 JWT Verification Dependency

Tạo `app/core/auth.py`:

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from app.core.config import settings


security = HTTPBearer()


class TokenPayload(BaseModel):
    """JWT payload structure từ Supabase."""
    sub: str  # user_id
    email: Optional[str] = None
    role: str = "authenticated"
    aud: str = "authenticated"
    exp: int
    iat: int


class CurrentUser(BaseModel):
    """User info extracted từ JWT."""
    id: UUID
    email: Optional[str] = None
    role: str = "authenticated"


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> CurrentUser:
    """
    Dependency xác thực JWT từ Supabase.
    Extract user info để sử dụng trong endpoints.
    """
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            audience="authenticated"
        )
        token_data = TokenPayload(**payload)

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ hoặc đã hết hạn",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return CurrentUser(
        id=UUID(token_data.sub),
        email=token_data.email,
        role=token_data.role
    )


async def get_current_active_user(
    current_user: CurrentUser = Depends(get_current_user)
) -> CurrentUser:
    """Dependency kiểm tra user đang active."""
    # Có thể thêm logic kiểm tra user status trong DB
    return current_user


# Role-based dependencies
def require_role(required_role: str):
    """Factory function tạo dependency kiểm tra role."""
    async def role_checker(
        current_user: CurrentUser = Depends(get_current_user)
    ) -> CurrentUser:
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Yêu cầu quyền {required_role}"
            )
        return current_user
    return role_checker


# Shortcuts cho các roles phổ biến
require_manager = require_role("manager")
require_receptionist = require_role("receptionist")
require_technician = require_role("technician")
```

### 5.3 Sử Dụng trong Router

```python
# app/modules/bookings/router.py
from fastapi import APIRouter, Depends
from app.core.auth import get_current_user, require_manager, CurrentUser
from app.core.db import get_db


router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.get("/me")
async def get_my_bookings(
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_db)
):
    """Lấy danh sách booking của user hiện tại."""
    # current_user.id có sẵn để query
    pass


@router.get("/all")
async def get_all_bookings(
    current_user: CurrentUser = Depends(require_manager),
    db = Depends(get_db)
):
    """Chỉ Manager được xem tất cả bookings."""
    pass
```

### 5.4 Admin Auth Operations (Backend Only)

```python
# app/modules/users/service.py
from app.core.supabase import supabase_admin


class UserService:
    """Admin operations sử dụng service_role key."""

    async def create_staff_user(self, email: str, password: str, role: str):
        """
        Tạo user staff từ admin panel.
        Bypass email confirmation.
        """
        response = supabase_admin.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True,  # Skip email verification
            "user_metadata": {
                "role": role  # manager, receptionist, technician
            }
        })
        return response.user

    async def update_user_role(self, user_id: str, new_role: str):
        """Cập nhật role user."""
        response = supabase_admin.auth.admin.update_user_by_id(
            user_id,
            {"user_metadata": {"role": new_role}}
        )
        return response.user

    async def delete_user(self, user_id: str):
        """Xóa user (soft delete recommended)."""
        response = supabase_admin.auth.admin.delete_user(user_id)
        return response
```

---

## 6. Storage Operations

### 6.1 Cấu Hình Buckets

Trong Supabase Dashboard, tạo các buckets:

| Bucket Name | Access | Mô Tả |
|-------------|--------|-------|
| `avatars` | Public | Ảnh đại diện users |
| `service-images` | Public | Hình ảnh dịch vụ |
| `medical-records` | Private | Hồ sơ sức khỏe (encrypted) |
| `documents` | Private | Tài liệu nội bộ |

### 6.2 Upload Files

```python
# app/modules/storage/service.py
from app.core.supabase import supabase, supabase_admin
from fastapi import UploadFile
import uuid


class StorageService:
    """Service xử lý file storage."""

    async def upload_avatar(self, user_id: str, file: UploadFile) -> str:
        """
        Upload avatar user.
        Returns: Public URL của file.
        """
        # Generate unique filename
        extension = file.filename.split(".")[-1]
        filename = f"{user_id}/{uuid.uuid4()}.{extension}"

        # Read file content
        content = await file.read()

        # Upload to Supabase Storage
        response = supabase.storage \
            .from_("avatars") \
            .upload(
                filename,
                content,
                {"content-type": file.content_type}
            )

        if response.error:
            raise Exception(f"Upload failed: {response.error.message}")

        # Get public URL
        public_url = supabase.storage \
            .from_("avatars") \
            .get_public_url(filename)

        return public_url

    async def upload_medical_record(
        self,
        customer_id: str,
        file: UploadFile
    ) -> str:
        """
        Upload hồ sơ sức khỏe (private bucket).
        Sử dụng admin client để bypass public access restrictions.
        """
        extension = file.filename.split(".")[-1]
        filename = f"{customer_id}/{uuid.uuid4()}.{extension}"

        content = await file.read()

        # Dùng admin client cho private bucket
        response = supabase_admin.storage \
            .from_("medical-records") \
            .upload(
                filename,
                content,
                {"content-type": file.content_type}
            )

        return filename  # Return path, không phải public URL

    async def get_signed_url(self, bucket: str, path: str, expires_in: int = 3600) -> str:
        """
        Tạo signed URL cho private files.
        expires_in: Thời gian hiệu lực (seconds).
        """
        response = supabase_admin.storage \
            .from_(bucket) \
            .create_signed_url(path, expires_in)

        return response["signedURL"]

    async def delete_file(self, bucket: str, paths: list[str]):
        """Xóa files từ storage."""
        response = supabase_admin.storage \
            .from_(bucket) \
            .remove(paths)

        return response


storage_service = StorageService()
```

### 6.3 Router Integration

```python
# app/modules/storage/router.py
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.core.auth import get_current_user, CurrentUser
from .service import storage_service


router = APIRouter(prefix="/storage", tags=["Storage"])


@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user)
):
    """Upload avatar cho user hiện tại."""
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(400, "Chỉ chấp nhận file JPEG, PNG, WebP")

    # Validate file size (max 5MB)
    if file.size > 5 * 1024 * 1024:
        raise HTTPException(400, "File quá lớn (max 5MB)")

    url = await storage_service.upload_avatar(str(current_user.id), file)
    return {"url": url}
```

---

## 7. Edge Functions

### 7.1 Khi Nào Dùng Edge Functions

| Use Case | Edge Function | Backend FastAPI |
|----------|---------------|-----------------|
| Webhook handlers | Phù hợp | OK |
| Simple notifications | Phù hợp | OK |
| Complex business logic | Không nên | Phù hợp |
| RCPSP Scheduling | Không thể | Bắt buộc |
| Database transactions | Hạn chế | Phù hợp |

### 7.2 Invoke Edge Functions từ Backend

```python
# app/core/edge_functions.py
from app.core.supabase import supabase


async def invoke_edge_function(
    function_name: str,
    body: dict = None,
    headers: dict = None
) -> dict:
    """
    Gọi Supabase Edge Function từ backend.
    Dùng cho các tác vụ chạy ở edge (notifications, webhooks).
    """
    try:
        response = supabase.functions.invoke(
            function_name,
            invoke_options={
                "body": body or {},
                "headers": headers or {}
            }
        )
        return response
    except Exception as e:
        raise Exception(f"Edge Function error: {str(e)}")


# Ví dụ: Gửi notification
async def send_booking_notification(booking_id: str, customer_email: str):
    """Trigger notification qua Edge Function."""
    return await invoke_edge_function(
        "send-notification",
        body={
            "type": "booking_confirmation",
            "booking_id": booking_id,
            "email": customer_email
        }
    )
```

---

## 8. Realtime Subscriptions

### 8.1 Realtime trong Backend Context

Supabase Realtime thường dùng ở frontend. Trong backend, có thể dùng cho:
- Background workers lắng nghe DB changes
- Microservice communication

### 8.2 Python Realtime Client

```python
# app/core/realtime.py
from app.core.supabase import supabase


def setup_realtime_subscription():
    """
    Setup realtime subscription cho backend workers.
    Useful cho background jobs cần react với DB changes.
    """

    def handle_booking_insert(payload):
        """Handler khi có booking mới."""
        print(f"New booking: {payload}")
        # Trigger scheduling engine
        # Send notifications

    def handle_booking_update(payload):
        """Handler khi booking được update."""
        print(f"Booking updated: {payload}")

    # Subscribe to bookings table
    channel = supabase.channel("db-changes")

    channel.on_postgres_changes(
        "INSERT",
        schema="public",
        table="bookings",
        callback=handle_booking_insert
    ).on_postgres_changes(
        "UPDATE",
        schema="public",
        table="bookings",
        callback=handle_booking_update
    ).subscribe()

    return channel
```

---

## 9. Row Level Security (RLS)

### 9.1 RLS Policies cho Synapse

```sql
-- Enable RLS on tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Policy: Customers chỉ xem booking của mình
CREATE POLICY "Customers view own bookings"
ON bookings FOR SELECT
USING (auth.uid() = customer_id);

-- Policy: Staff (receptionist, manager) xem tất cả bookings
CREATE POLICY "Staff view all bookings"
ON bookings FOR SELECT
USING (
    auth.jwt() ->> 'role' IN ('receptionist', 'manager')
);

-- Policy: Technicians xem bookings assigned cho họ
CREATE POLICY "Technicians view assigned bookings"
ON bookings FOR SELECT
USING (
    auth.jwt() ->> 'role' = 'technician'
    AND technician_id = auth.uid()
);

-- Policy: Chỉ receptionist+ được tạo booking
CREATE POLICY "Staff create bookings"
ON bookings FOR INSERT
WITH CHECK (
    auth.jwt() ->> 'role' IN ('receptionist', 'manager')
);

-- Policy: Services là public read
CREATE POLICY "Anyone can view active services"
ON services FOR SELECT
USING (is_active = true);
```

### 9.2 Bypass RLS trong Backend

Khi dùng SQLModel với direct connection, RLS không tự động apply. Cần:

1. **Set role trong connection** (nếu muốn RLS):
```sql
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid';
```

2. **Hoặc** implement authorization logic trong Service layer (khuyến nghị cho Synapse):

```python
# app/modules/bookings/service.py
class BookingService:
    """Booking service với authorization logic."""

    async def get_bookings_for_user(
        self,
        db: AsyncSession,
        current_user: CurrentUser
    ) -> list[Booking]:
        """Lấy bookings dựa trên role của user."""

        query = select(Booking)

        match current_user.role:
            case "customer":
                # Customers chỉ xem booking của mình
                query = query.where(Booking.customer_id == current_user.id)

            case "technician":
                # Technicians xem booking assigned
                query = query.where(Booking.technician_id == current_user.id)

            case "receptionist" | "manager":
                # Staff xem tất cả
                pass

            case _:
                raise HTTPException(403, "Không có quyền truy cập")

        result = await db.execute(query)
        return list(result.scalars().all())
```

---

## 10. Best Practices cho Synapse

### 10.1 Quy Tắc Vàng

| Quy Tắc | Mô Tả |
|---------|-------|
| **Không hardcode keys** | Luôn dùng environment variables |
| **Service Role = Backend Only** | KHÔNG BAO GIỜ expose SUPABASE_SERVICE_ROLE_KEY |
| **SQLModel cho Core** | Dùng SQLModel/asyncpg cho RCPSP, complex queries |
| **Supabase SDK cho Auth/Storage** | Leverage built-in features |
| **Authorization ở Service Layer** | Kiểm tra quyền trước khi thực hiện operation |

### 10.2 Error Handling Pattern

```python
# app/core/exceptions.py
from fastapi import HTTPException


class SupabaseError(HTTPException):
    """Base exception cho Supabase operations."""
    def __init__(self, detail: str, status_code: int = 500):
        super().__init__(status_code=status_code, detail=detail)


class AuthenticationError(SupabaseError):
    """Lỗi authentication."""
    def __init__(self, detail: str = "Xác thực thất bại"):
        super().__init__(detail=detail, status_code=401)


class AuthorizationError(SupabaseError):
    """Lỗi authorization."""
    def __init__(self, detail: str = "Không có quyền truy cập"):
        super().__init__(detail=detail, status_code=403)


class StorageError(SupabaseError):
    """Lỗi storage operations."""
    def __init__(self, detail: str = "Lỗi xử lý file"):
        super().__init__(detail=detail, status_code=500)
```

### 10.3 Logging Pattern

```python
# app/core/logger.py
import logging
from app.core.config import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger("synapse")


def log_supabase_operation(operation: str, table: str, user_id: str = None):
    """Log Supabase operations cho audit trail."""
    logger.info(f"Supabase [{operation}] on {table} by user {user_id}")
```

### 10.4 Testing Pattern

```python
# tests/conftest.py
import pytest
from unittest.mock import MagicMock, patch


@pytest.fixture
def mock_supabase():
    """Mock Supabase client cho unit tests."""
    with patch("app.core.supabase.supabase") as mock:
        mock.table.return_value.select.return_value.execute.return_value = MagicMock(
            data=[{"id": "test-id", "name": "Test"}]
        )
        yield mock


@pytest.fixture
def mock_supabase_admin():
    """Mock admin client."""
    with patch("app.core.supabase.supabase_admin") as mock:
        yield mock
```

---

## 11. Migration Strategy

### 11.1 Từ SQLModel Hiện Tại sang Hybrid

**Phase 1: Thêm Supabase (Không breaking changes)**
1. Thêm `supabase` dependency
2. Tạo `app/core/supabase.py`
3. Cấu hình environment variables
4. Test connection

**Phase 2: Migrate Auth**
1. Tạo users trong Supabase Auth
2. Update JWT verification để dùng Supabase JWT
3. Migrate existing users (nếu có)

**Phase 3: Integrate Storage**
1. Tạo buckets
2. Migrate existing files (nếu có)
3. Update file upload endpoints

**Phase 4: Enable RLS**
1. Tạo RLS policies trên Supabase
2. Test thoroughly với different roles
3. Rollout dần dần

### 11.2 Checklist Trước Production

- [ ] Tất cả keys trong environment variables
- [ ] RLS enabled trên tất cả public tables
- [ ] Service role key chỉ dùng trong backend
- [ ] JWT verification hoạt động đúng
- [ ] Storage policies cấu hình đúng
- [ ] Error handling đầy đủ
- [ ] Logging cho audit trail
- [ ] Unit tests cover Supabase operations

---

## Tài Liệu Tham Khảo

- [Supabase Python SDK](https://supabase.com/docs/reference/python/initializing)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)

---

> **Lưu ý**: Tài liệu này được tạo dựa trên Supabase Python SDK v2.10+ và FastAPI v0.115+. Luôn kiểm tra documentation chính thức để cập nhật các thay đổi mới nhất.
