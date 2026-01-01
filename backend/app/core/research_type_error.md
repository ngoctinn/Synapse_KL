# Research Report: TypeError unsupported operand for | (str and NoneType)

## 1. Problem Definition
- **Error**: `TypeError: unsupported operand type(s) for |: 'str' and 'NoneType'`
- **Context**: Occurs during `pytest` discovery in `app/modules/staff/models.py`.
- **Environment**: Python 3.13.9.
- **Hypothesis**: The use of the `|` operator with a string forward reference (e.g., `"Model" | None`) is causing issues because the evaluation context at runtime doesn't recognize the string as a type that supports the `|` operator, despite Python 3.13's native support for Union types.

## 2. Codebase Investigation Questions
1. Where are string forward references used with `| None`?
2. Is `from __future__ import annotations` present in the affected files?
3. How does SQLModel handle runtime evaluation of these hints?

## 3. Search Strategy
- `grep` for the pattern `| None` in models and schemas.
- Use `context7` to query standard practices for Pydantic/SQLModel with PEP 604 and forward references.
