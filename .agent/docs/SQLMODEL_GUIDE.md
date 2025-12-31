# SQLModel + Pydantic v2 Cheatsheet
> Python 3.12 | SQLModel 0.0.19+ | Pydantic v2
> Source: sqlmodel.tiangolo.com, docs.pydantic.dev (verified 2025-12)

## 1. Type Hints
```python
age: int | None = None          # Thay Optional[int] (Python 3.10+)
id: int | None = Field(default=None, primary_key=True)
id: UUID = Field(default_factory=uuid4, primary_key=True)  # UUID auto-gen
```

## 2. Field Patterns
```python
name: str = Field(max_length=255)                    # Required
description: str | None = None                       # Optional nullable
buffer_time: int = Field(default=10)                 # Default value
price: Decimal = Field(max_digits=12, decimal_places=2)
code: str = Field(max_length=50, unique=True, index=True)
created_at: datetime = Field(default_factory=datetime.utcnow)
deleted_at: datetime | None = None                   # Soft delete
```

## 3. Relationships (verified)
```python
# One-to-Many (sqlmodel.tiangolo.com/tutorial/relationship-attributes)
class Team(SQLModel, table=True):
    heroes: list["Hero"] = Relationship(back_populates="team")

class Hero(SQLModel, table=True):
    team_id: int | None = Field(default=None, foreign_key="team.id")
    team: Team | None = Relationship(back_populates="heroes")

# Many-to-Many simple (sqlmodel.tiangolo.com/tutorial/many-to-many)
class HeroTeamLink(SQLModel, table=True):
    team_id: int = Field(foreign_key="team.id", primary_key=True)
    hero_id: int = Field(foreign_key="hero.id", primary_key=True)

heroes: list["Hero"] = Relationship(back_populates="teams", link_model=HeroTeamLink)

# Many-to-Many with extra fields (sqlmodel.tiangolo.com/tutorial/many-to-many/link-with-extra-fields)
class HeroTeamLink(SQLModel, table=True):
    team_id: int | None = Field(default=None, foreign_key="team.id", primary_key=True)
    hero_id: int | None = Field(default=None, foreign_key="hero.id", primary_key=True)
    is_training: bool = False
    team: "Team" = Relationship(back_populates="hero_links")
    hero: "Hero" = Relationship(back_populates="team_links")

class Team(SQLModel, table=True):
    hero_links: list[HeroTeamLink] = Relationship(back_populates="team")
```

## 4. Async Session (CRITICAL)
```python
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
# PHẢI có expire_on_commit=False để tránh lỗi greenlet
```

## 5. Imports (CRITICAL - verified)
```python
from sqlmodel import select                             # select từ sqlmodel
from sqlmodel.ext.asyncio.session import AsyncSession   # AsyncSession từ sqlmodel (có exec())
from sqlalchemy import func                             # func vẫn từ sqlalchemy
from sqlalchemy.orm import selectinload                 # loading strategies từ sqlalchemy

# SAI: from sqlalchemy.ext.asyncio import AsyncSession  # Không có method exec()
```

## 6. exec() (verified sqlmodel.tiangolo.com/tutorial/select)
```python
# SQLModel Session/AsyncSession dùng exec(), KHÔNG dùng execute()
result = await session.exec(select(Skill))
skills = result.all()        # list[Skill]
skill = result.first()       # Skill | None

# func.count()
result = await session.exec(select(func.count()).where(...))
count = result.one()         # int
```

## 7. Eager Loading
```python
from sqlalchemy.orm import selectinload, joinedload

stmt = select(Service).options(
    selectinload(Service.skills),      # One-to-Many, M-N
    joinedload(Service.category),      # Many-to-One
)
```

## 8. Pydantic v2 Validators (verified docs.pydantic.dev/latest/concepts/validators)
```python
from pydantic import field_validator, model_validator

# field_validator - mode='after' là default
@field_validator("code", mode="after")
@classmethod
def validate_code(cls, value: str) -> str:
    return value.upper()

# model_validator - phải return self
@model_validator(mode="after")
def validate_all(self) -> Self:
    if self.usage_duration > self.duration:
        raise ValueError("Invalid duration")
    return self
```

## 9. v1 to v2 Migration
| v1 | v2 |
|----|-----|
| `Optional[T]` | `T \| None` |
| `@validator` | `@field_validator` |
| `@root_validator` | `@model_validator` |
| `orm_mode=True` | `from_attributes=True` |
| `.dict()` | `.model_dump()` |
| `Field(regex=)` | `Field(pattern=)` |

## 10. Enums & Table Name
```python
class Status(str, Enum):  # Inherit str for JSON serialization
    ACTIVE = "ACTIVE"

class Service(SQLModel, table=True):
    __tablename__ = "services"  # Explicit snake_case
    status: Status = Field(default=Status.ACTIVE)
```

## Checklist
- [ ] `str, Enum` for enums

## 11. Circular Import & M-N Best Practice (CRITICAL)
- **Problem**: `Relationship(link_model="String")` gây lỗi `NoInspectionAvailable`.
- **Rule**: `link_model` BẮT BUỘC phải là **Class Object**, không được dùng chuỗi.
- **Solution**: Tách link model ra file riêng (VD: `link_models.py`) để cả 2 module cùng import mà không bị circular dependency.
- **Pattern**:
  ```python
  # Trong models.py
  from .link_models import HeroTeamLink # Import class thật
  heroes: list["Hero"] = Relationship(back_populates="teams", link_model=HeroTeamLink)
  ```
