# AI Agent Rules: Synapse_KL (Next.js 16 + FastAPI)

## 1. CORE WORKFLOW: PLAN → ACT → VERIFY
*DO NOT CODE until you have a plan.*

1.  **UNDERSTAND (Context Pinning):**
    *   Identify target files/components explicitly.
    *   Search documentation (`docs/ai/`) & relevant code first.
    *   *Rule:* List file paths you will read/write before acting.

2.  **PLAN (Pseudocode/Steps):**
    *   For tasks > 30 lines or multiple files: Propose a step-by-step roadmap.
    *   Wait for user confirmation if the change affects architecture or huge scope.

3.  **ACT (Atomic & Safe):**
    *   Make **atomic changes** (one concern per commit/action).
    *   **NO Placeholders:** Never use `// TODO` or `pass` unless explicitly asked.
    *   **Conventions:** Follow Feature-Sliced Design (Frontend) & Modular Monolith (Backend).

4.  **VERIFY (Test-Driven):**
    *   **Test-First:** Write/Update tests *before* or *alongside* implementation.
    *   **Auto-Check:** Run linter/build after changes.
    *   *Rule:* If a fix fails > 2 times, STOP and ask for direction.

## 2. CONTEXT MANAGEMENT
*Minimize "Hallucinations" by anchoring to facts.*

*   **System 2 Thinking:** If a request is vague, ask 3 clarifying questions (Input/Output/Constraints).
*   **Source of Truth:**
    *   Frontend: `next.config.ts`, `package.json`, `src/features/`
    *   Backend: `pyproject.toml`, `app/modules/`, `alembic.ini`
    *   Docs: Always check `docs/ai/` for architectural decisions.
*   **External Libs:** Use `context7` tools to verify library versions/usage (e.g., Shadcn, SQLModel) instead of guessing.

## 3. TECH STACK MANDATES

### Frontend (Next.js 16 + React 19)
*   **Server Components:** Default to Server Components. Use `'use client'` only for interactivity.
*   **Data Fetching:** Use Server Actions for mutations. Use `fetch` with tags/cache for queries.
*   **UI:** Tailwind CSS + Shadcn UI. No custom CSS classes unless necessary.
*   **Forms:** `react-hook-form` + `zod`.

### Backend (FastAPI + SQLModel)
*   **Async:** All DB operations must be `async/await`.
*   **Structure:** Modules (`app/modules/`) must operate independently where possible.
*   **Database:** NO raw SQL. Use `SQLModel` statements.
*   **Migration:** Always generate Alembic migrations for schema changes.

## 4. SECURITY & SAFETY
*   **Secrets:** NEVER output or hardcode API Keys/Secrets. Use `.env`.
*   **Config:** Do NOT modify `next.config.ts`, `pyproject.toml`, or Docker files without explicit permission.
*   **Data:** Be careful with `DELETE`/`DROP` operations. Confirm with user.

## 5. QUALITY GATES
*   **Linting:** Code must pass `eslint` (Frontend) and `ruff` (Backend).
*   **Types:** No `any` (TS) or untyped functions (Python).
*   **Tests:**
    *   Frontend: Unit tests for utils/hooks. Integration tests for critical flows.
    *   Backend: `pytest` coverage for all Services/routers.

## 6. LANGUAGE STANDARDS
*   **Communication:** Vietnamese (Tiếng Việt).
*   **Documentation:** Vietnamese.
*   **Code Comments:** Vietnamese (Consistent with existing codebase).
*   **Naming:** English (Variables, Functions, Classes, DB Tables).
