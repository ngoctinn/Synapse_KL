---
trigger: always_on
---
# Agent Rules (Agent-Optimized)

## 1. Language & Communication
- **CODE**: English ONLY (variables, functions, classes).
- **COMMENTS/UI**: Vietnamese ONLY.
- **TONE**: Professional, Concise, NO fluff.

## 2. Commenting Philosophy
- **NO**: Don't explain "What" (e.g., `// add to cart`).
- **YES**: Explain "Why" (Business logic, constraints, workarounds).
- **DOCS**: Use Vietnamese JSDoc/Docstrings for public APIs.

## 3. Workflow (Vibe Coding)
- **PLAN**: Present plan before editing large files.
- **CONTEXT**: Keep edits minimal. No full-file rewrites unless necessary.
- **VERIFY**: Run `npm run build` or tests after major changes.

## 4. Quality Standards
- **CLEAN CODE**: No emojis in code/commits. Use descriptive names.
- **ASSETS**: No placeholders. Use meaningful SVGs/Images.
- **STRICT**: Adhere to `ui.md`, `frontend.md`, `backend.md`.