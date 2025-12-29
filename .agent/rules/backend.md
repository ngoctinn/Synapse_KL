---
trigger: always_on
glob: "backend/**/*"
---
# Backend Rules (Agent-Optimized)

## 1. Stack
- Python 3.12+, FastAPI, SQLModel, Pydantic v2, Alembic, PostgreSQL (asyncpg).

## 2. Architecture (3-Layer)
- `router.py`: HTTP, validation, status codes.
- `service.py`: Business logic, orchestration.
- `models.py`: SQLModel entities, relationships.
- **IMPORT FLOW**: Router -> Service -> Model (Strictly One-way).

## 3. SQLModel & DB
- **MANDATORY**: `table=True` for DB models. UUID as Primary Key.
- **RELATIONS**: Use `Relationship` + `back_populates`.
- **ASYNC**: Use `expire_on_commit=False` in async sessions.

## 4. Pydantic v2
- **CONFIG**: `ConfigDict(from_attributes=True)`.
- **CONVERSION**: Use `model_dump()` instead of `dict()`.

## 5. Error Handling
- **PATTERN**: Custom exceptions inheriting `HTTPException`.
- **RESPONSE**: Structured error: `{"detail": "..."}`.

## 6. Development
- **MIGRATIONS**: MUST use Alembic for schema changes.
- **VALIDATION**: Enforce strict type hints everywhere.