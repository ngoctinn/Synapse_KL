---
trigger: always_on
glob: "backend/**/*"
description: Quy tắc phát triển Backend (FastAPI, SQLModel).
---
# Backend Rules (FastAPI + SQLModel)

> Tài liệu này là **LUẬT BẮT BUỘC** khi sinh code backend. Không có ngoại lệ.

---

## 1. SOURCE OF TRUTH (BẮT BUỘC)

- **FastAPI**: [https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/) (Luôn dùng bản stable mới nhất).
- **SQLModel**: [https://sqlmodel.tiangolo.com/](https://sqlmodel.tiangolo.com/) (Tham chiếu cho ORM và Type hints).
- **Pydantic v2**: [https://docs.pydantic.dev/](https://docs.pydantic.dev/).

**QUY TẮC**: Agent **PHẢI** kiểm tra patterns từ tài liệu chính quy nếu có bất kỳ sự không chắc chắn nào về cú pháp của Pydantic v2 hoặc SQLModel Relationship.

---

## 2. TECH STACK

- Python ≥3.10 (ưu tiên 3.12+)
- FastAPI + SQLModel + Pydantic v2
- Alembic cho migrations
- PostgreSQL + asyncpg
- Poetry hoặc uv cho dependency

---

## 3. KIẾN TRÚC 3 LỚP (BẮT BUỘC)

| Lớp | Vị trí | Trách nhiệm |
|-----|--------|-------------|
| **Router** | `modules/<module>/router.py` | HTTP endpoints, validation, status codes |
| **Service** | `modules/<module>/service.py` | Business logic, orchestration |
| **Model** | `modules/<module>/models.py` | SQLModel entities, relationships |

### Quy tắc import:
- Router → Service → Model ✅
- Model → Service ❌
- Service → Router ❌

---

## 4. SQLMODEL RULES

- PHẢI dùng `table=True` cho database models.
- PHẢI dùng `Relationship` với `back_populates` cho quan hệ 2 chiều.
- PHẢI dùng UUID làm primary key.
- PHẢI dùng `expire_on_commit=False` trong async session.

---

## 5. PYDANTIC V2 RULES

- PHẢI dùng `ConfigDict(from_attributes=True)` thay cho `orm_mode`.
- PHẢI dùng `model_dump()` thay cho `dict()`.

---

## 6. ERROR HANDLING

- PHẢI dùng custom exceptions kế thừa `HTTPException`.
- Trả về structured error response: `{"detail": "..."}`.

---

## 7. AI AGENT GUIDELINES (MANDATORY)

- **Zero Emoji Policy**: No emojis in code or comments.
- **Commenting Philosophy**: 
  - NO comments like `// initialize db`. The code `init_db()` is self-explanatory.
  - USE comments for business logic justifications (e.g., `// Using 48h expiry to match bank settlement cycle`).
- **Incremental Logic**: Build in small, testable chunks.

---

*Cập nhật: December 2025*
