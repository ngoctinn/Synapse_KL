# RESEARCH: FASTAPI + SQLMODEL + ALEMBIC (BEST PRACTICES)
**(Updated: 2026-01-03)**

Tài liệu này tổng hợp các chuẩn mực (Best Practices) khi sử dụng FastAPI với SQLModel (Pydantic v2) và Alembic trong môi trường Async.

## 1. PROJECT STRUCTURE (3-LAYER ARCHITECTURE)

Áp dụng kiến trúc 3 lớp (3-Layer Architecture) để đảm bảo tính tách biệt (Separation of Concerns).

```
backend/
├── app/
│   ├── modules/            # Modular Monolith Structure
│   │   ├── auth/
│   │   ├── users/
│   │   │   ├── router.py       # Layer 1: API Endpoint & Validation
│   │   │   ├── service.py      # Layer 2: Business Logic
│   │   │   ├── models.py       # Layer 3: DB Models & Pydantic Schemas
│   │   │   └── dependencies.py # Module specific deps
│   │   └── schedule/
│   ├── core/               # Core configs
│   │   ├── db.py           # Database connection & Session
│   │   └── config.py
│   └── main.py
├── alembic/                # DB Migrations
│   └── env.py
└── pyproject.toml
```

### Quy tắc Dependencies:
*   **Router** gọi **Service**.
*   **Service** gọi **Model** (DB operations).
*   **Model** độc lập (không import Service/Router).

---

## 2. SQLMODEL & PYDANTIC V2 PATTERNS

### 2.1. Model Separation Strategy
Tránh dùng chung 1 class cho cả DB và API. Hãy tách biệt để tránh lộ dữ liệu nhạy cảm (password_hash) hoặc lỗi validation thừa.

```python
# modules/users/models.py
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from uuid import UUID, uuid4

# 1. Shared Properties (Base)
class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    full_name: str | None = None
    is_active: bool = True

# 2. Database Model (Table)
class User(UserBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    hashed_password: str

    # Relationships
    shifts: list["Shift"] = Relationship(back_populates="user")

# 3. API Schemas
class UserCreate(UserBase):
    password: str

class UserPublic(UserBase):
    id: UUID

class UserUpdate(SQLModel):
    # Tất cả đều optional để hỗ trợ PATCH
    email: str | None = None
    full_name: str | None = None
    password: str | None = None
```

### 2.2. Selective Update (PATCH)
Sử dụng `.model_dump(exclude_unset=True)` của Pydantic v2 để chỉ update các trường client gửi lên.

```python
# modules/users/service.py
def update_user(user: User, user_in: UserUpdate, session: Session):
    update_data = user_in.model_dump(exclude_unset=True)
    user.sqlmodel_update(update_data)

    session.add(user)
    session.commit()
    session.refresh(user)
    return user
```

---

## 3. ASYNC DATABASE SESSION

### 3.1. Async Engine Configuration
Bắt buộc dùng `expire_on_commit=False` để tránh lỗi `MissingGreenlet` khi truy cập attribute sau khi commit trong môi trường async.

```python
# core/db.py
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker

engine = create_async_engine(settings.DATABASE_URL, echo=True, future=True)

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session
```

### 3.2. Relationship Loading
Trong Async, Lazy Loading mặc định sẽ gây lỗi. Phải dùng Eager Loading (`selectinload`).

```python
# Service query
from sqlalchemy.orm import selectinload

statement = select(User).options(selectinload(User.shifts)).where(User.id == user_id)
result = await session.exec(statement)
```

---

## 4. ALEMBIC MIGRATIONS (ASYNC)

### 4.1. Import All Models
Để Alembic phát hiện được bảng, phải import TẤT CẢ models vào file `env.py` (hoặc một file trung gian `app/models/__init__.py`).

```python
# alembic/env.py
from app.core.db import Base (?)
# SQLModel là wrapper của Pydantic & SQLAlchemy.
# Cần import models cụ thể để chúng register vào metadata.
from app.modules.users.models import User
from app.modules.schedule.models import Shift
from sqlmodel import SQLModel

target_metadata = SQLModel.metadata
```

### 4.2. Async Env Setup
Cấu hình `run_migrations_online` chạy với `connectable.connect()` và `run_sync` để hỗ trợ driver `asyncpg`.

---

## 5. RECAP (QUY TẮC BẮT BUỘC)
1.  **Strict Typing**: Dùng `int | None` thay vì `Optional[int]`. Dùng `UUID` làm primary key.
2.  **Explicit Relationships**: Luôn định nghĩa `back_populates` ở cả 2 đầu quan hệ.
3.  **Session Management**: Dependency Injection `get_session` cho mọi route. Không dùng global session.
4.  **No Circular Imports**: Nếu Model A cần Model B (Link), hãy để trong chuỗi string `Relationship(link_model="ModelB")` hoặc import trong hàm/TYPE_CHECKING.
