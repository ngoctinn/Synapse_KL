# SQLModel + Pydantic v2 Cheatsheet
> Python 3.12 | SQLModel 0.0.19+ | Pydantic v2

## 1. Type Hints
```python
# Modern (Python 3.10+)
age: int | None = None          # Thay Optional[int]
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

## 3. Relationships
```python
# One-to-Many
class Category(SQLModel, table=True):
    services: list["Service"] = Relationship(back_populates="category")

class Service(SQLModel, table=True):
    category_id: UUID | None = Field(foreign_key="service_categories.id")
    category: Category | None = Relationship(back_populates="services")

# Many-to-Many (simple link)
class ServiceSkillLink(SQLModel, table=True):
    service_id: UUID = Field(foreign_key="services.id", primary_key=True)
    skill_id: UUID = Field(foreign_key="skills.id", primary_key=True)

skills: list["Skill"] = Relationship(back_populates="services", link_model=ServiceSkillLink)

# Many-to-Many (with extra columns)
class ServiceResourceReq(SQLModel, table=True):
    service_id: UUID = Field(foreign_key="services.id", primary_key=True)
    group_id: UUID = Field(foreign_key="resource_groups.id", primary_key=True)
    quantity: int = 1
    service: "Service" = Relationship(back_populates="resource_requirements")
```

## 4. Async Session (CRITICAL)
```python
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
#                                                        ^^^^^^^^^^^^^^^^^^^^^^^^
# PHẢI có expire_on_commit=False để tránh lỗi greenlet khi access attributes sau commit
```

## 5. Eager Loading (Avoid N+1)
```python
from sqlalchemy.orm import selectinload, joinedload

stmt = select(Service).options(
    selectinload(Service.skills),      # One-to-Many, M-N
    joinedload(Service.category),      # Many-to-One
)
```

## 6. Pydantic v2 Validators
```python
from pydantic import field_validator, model_validator

@field_validator("code")
@classmethod
def validate_code(cls, v, info):
    return v.upper() if v else info.data.get("name", "").upper().replace(" ", "_")

@model_validator(mode="after")
def validate_all(self):
    if self.usage_duration > self.duration:
        raise ValueError("Invalid duration")
    return self
```

## 7. v1 → v2 Migration
| v1 | v2 |
|----|----|
| `Optional[T]` | `T \| None` |
| `@validator` | `@field_validator` |
| `@root_validator` | `@model_validator` |
| `orm_mode=True` | `from_attributes=True` |
| `.dict()` | `.model_dump()` |
| `Field(regex=)` | `Field(pattern=)` |

## 8. Enums & Table Name
```python
class Status(str, Enum):  # Inherit str for JSON serialization
    ACTIVE = "ACTIVE"

class Service(SQLModel, table=True):
    __tablename__ = "services"  # Explicit snake_case
    status: Status = Field(default=Status.ACTIVE)
```

## Checklist
- [ ] `|` thay `Optional`
- [ ] `__tablename__` explicit
- [ ] `back_populates` bidirectional
- [ ] `expire_on_commit=False` async
- [ ] `selectinload`/`joinedload` eager
- [ ] `str, Enum` for enums
