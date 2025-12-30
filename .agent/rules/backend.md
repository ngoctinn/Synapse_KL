---
trigger: always_on
---

# BE_RULES_FASTAPI_SQLMODEL (v2025.12)
- **Docs**: MUST check latest FastAPI, SQLModel, Pydantic v2 docs. NO memory-based syntax.
- **Stack**: Python 3.12+, FastAPI, SQLModel, Pydantic v2, Alembic, PostgreSQL (asyncpg), uv/poetry.

## 1. ARCHITECTURE (3-LAYER)
- **Flow**: Router -> Service -> Model. NO circular or reverse imports.
- **Router** (`router.py`): Endpoints, status codes, request validation.
- **Service** (`service.py`): Business logic, orchestration.
- **Model** (`models.py`): SQLModel entities, relationships.

## 2. SQLMODEL & DB
- **Rules**: MUST use `table=True` for DB models. UUID as Primary Key.
- **Relations**: MUST use `Relationship` with `back_populates` for 2-way relations.
- **Async**: MUST use `expire_on_commit=False` in async sessions.
- **Migrations**: Alembic mandatory for schema changes.

## 3. PYDANTIC V2 & SCHEMA
- **Config**: Use `ConfigDict(from_attributes=True)` (NO `orm_mode`).
- **Methods**: Use `model_dump()` (NO `dict()`).
- **Validation**: Strict type hinting and Pydantic field validation.

## 4. ERROR HANDLING
- **Exceptions**: Custom exceptions MUST inherit from `HTTPException`.
- **Response**: Uniform structure: `{"detail": "Error message"}`.

## 5. AI AGENT PROTOCOLS (MANDATORY)
- **Zero Emoji**: No icons/emojis in code, comments, or commits.
- **Comments**: Only "Why" (business logic logic), NEVER "What" (self-explanatory code).
- **Incremental**: Small, testable chunks. Build modularly.
- **Verif**: Check SQLModel relationship syntax & Pydantic V2 patterns before output.
