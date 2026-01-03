---
trigger: always_on
---

# BE_RULES_FASTAPI_SQLMODEL (v2025.12)
- **Docs**: BẮT BUỘC kiểm tra tài liệu FastAPI, SQLModel, Pydantic v2 mới nhất. KHÔNG dùng cú pháp cũ.
- **Stack**: Python 3.12+, FastAPI, SQLModel, Pydantic v2, Alembic, PostgreSQL (asyncpg), uv

## 1. KIẾN TRÚC (3-LAYER)
- **Flow**: Router -> Service -> Model. KHÔNG có import vòng hoặc import ngược.
- **Router** (router.py): Endpoints, mã trạng thái, kiểm tra tính hợp lệ của request.
- **Service** (service.py): Logic nghiệp vụ, điều phối.
- **Model** (models.py): Các thực thể SQLModel và mối quan hệ.

## 2. SQLMODEL & DB
- **Rules**: BẮT BUỘC dùng table=True cho các model DB. Sử dụng UUID làm Khóa chính.
- **Quan hệ**: BẮT BUỘC dùng Relationship với back_populates cho các quan hệ 2 chiều.
- **Async**: BẮT BUỘC dùng expire_on_commit=False trong async sessions để tránh lỗi truy cập attribute.
- **Session**: Sử dụng yield dependency cho việc quản lý session để đảm bảo đóng kết nối sớm.

## 3. PYDANTIC V2 & SCHEMA
- **Cấu hình**: Sử dụng ConfigDict(from_attributes=True) (KHÔNG dùng orm_mode).
- **Phương thức**: Sử dụng model_dump() (KHÔNG dùng dict()).
- **Validation**: Strict type hinting và sử dụng các validator của Pydantic V2 nếu logic phức tạp.

## 4. XỬ LÝ LỖI
- **Ngoại lệ**: Custom exceptions BẮT BUỘC kế thừa từ HTTPException.
- **Phản hồi**: Cấu trúc đồng nhất: {"detail": "Thông báo lỗi"}.

## 5. GIAO THỨC AI (BẮT BUỘC)
- **Zero Emoji**: Không dùng biểu tượng/emoji trong code, comment, hoặc commit.
- **Comments**: Chỉ giải thích "Tại sao" (logic nghiệp vụ), KHÔNG giải thích "Cái gì" (code tự tường minh).
- **Phân tách**: Xây dựng mô-đun, các thành phần nhỏ, có thể test được.
- **Xác minh**: Kiểm tra cú pháp quan hệ SQLModel & các pattern Pydantic V2 trước khi phản hồi.
