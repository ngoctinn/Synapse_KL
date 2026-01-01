<!-- AGENT_NOTE: Concise reusable patterns. Grouped by logic. Keep critical code blocks. -->
# BACKEND_CHEATSHEET (FASTAPI, SQLMODEL, SUPABASE)

## 0. FILTERING STRATEGY (SYNAPSE SPECIFIC)
- **Core Ops**: Focus on **Backend Filtering** for scalability and security. Support URL searchParams as the source of truth for filtering & pagination.

## 1. INFRA & ENV
- **CORS**: Middleware must run unconditionally. Explicitly add `localhost:3000` to `BACKEND_CORS_ORIGINS`.
- **Pooler**: Accessing Supabase port 6543/5432 requires `Generic SSL Context` (disable hostname check).
- **Env**: Use `.venv/Scripts/python`. Set `line-length = 120` in Ruff.

## 2. DATETIME & TIMEZONES (TIMESTAMPTZ)
- **Problem**: `asyncpg` crashes on naive vs aware datetime.
- **Rule**: ALL datetime fields MUST use `sa_type=DateTime(timezone=True)`.
  ```python
  created_at: datetime = Field(sa_type=DateTime(timezone=True), default_factory=lambda: datetime.now(timezone.utc))
  ```
- **App**: NEVER use `datetime.now()`. ALWAYS use `datetime.now(timezone.utc)`.

## 3. SQLMODEL & PYDANTIC V2
- **Types**: Use `int | None` (No `Optional`). UUID PK: `id: UUID = Field(default_factory=uuid4, primary_key=True)`.
- **Relations**: `back_populates` mandatory. `link_model` MUST be a **Class Object**, not a string (Extract to `link_models.py` to fix circular imports).
- **Session**: `sessionmaker(..., expire_on_commit=False)` to prevent Greenlet errors.
- **Execution**: Use `await session.exec(select(...))`.
- **Loading**: `selectinload` (1-N/M-N), `joinedload` (M-1).
- **Validators**: Use `@field_validator` and `@model_validator` (mode="after").

## 4. HYBRID SUPABASE INTEGRATION
- **Architecture**: Core Logic/RCPSP -> **SQLModel**, Auth/Storage/Realtime -> **Supabase SDK**.
- **Security**: Service Role Key is **BACKEND ONLY**. Manual RBAC in Service layer (match `user.role`) as SQLModel bypasses RLS.
- **Auth**: Verify JWT (HS256) via `python-jose`. Audiences: `authenticated`.
- **Storage**: `.upload()` returns Path/URL. Use `create_signed_url` for private assets.

## 5. RELEVANT LOGIC
- **Validation**: Endpoints must return standard JSON structure even if data is empty.
- **Migrations**: Always import ALL models in `env.py` before `alembic --autogenerate`.
- **Model Order**: Base Tables -> Link Tables -> Relationships.
