# AI Agent Rules: Synapse_KL (Next.js 16 + FastAPI)

## 1. CORE WORKFLOW: PLAN → ACT → VERIFY
*DO NOT CODE until you have a plan.*

1.  **UNDERSTAND (Context Pinning):**
    *   Identify target files/components explicitly.
    *   **Mandatory:** Query @mcp:context7 for bất kỳ thư viện mới nào (Shadcn, SQLModel, Tailwind 4).
    *   *Rule:* Liệt kê các đường dẫn tệp sẽ đọc/ghi trước khi hành động.

2.  **PLAN (Pseudocode/Steps):**
    *   Đối với tác vụ > 30 dòng hoặc nhiều tệp: Đề xuất lộ trình từng bước.
    *   Chờ xác nhận của người dùng nếu thay đổi ảnh hưởng đến kiến trúc hoặc logic cốt lõi.

3.  **ACT (Atomic & Safe):**
    *   Thực hiện các thay đổi **nguyên tử** (mỗi hành động một mối quan tâm).
    *   **KP Placeholders:** Tuyệt đối không dùng // TODO hoặc pass.
    *   **Conventions:** Tuân thủ FSD (Frontend) & Modular Monolith (Backend).

4.  **VERIFY (Test-Driven):**
    *   **Test-First:** Viết/Cập nhật test song song với việc triển khai.
    *   **Auto-Check:** Chạy linter/build sau khi thay đổi.
    *   *Rule:* Nếu sửa lỗi thất bại > 2 lần, DỪNG LẠI và hỏi hướng giải quyết.

## 2. QUẢN LÝ NGỮ CẢNH
*Giảm thiểu "ảo giác" bằng cách neo vào sự thật.*

*   **Nguồn sự thật:**
    *   Frontend: next.config.ts, package.json, src/features/
    *   Backend: pyproject.toml, app/modules/, alembic/
    *   Docs: Luôn kiểm tra docs/ai/ và @mcp:next-devtools_nextjs_docs.
*   **Thư viện ngoài:** Sử dụng context7 để xác minh tài liệu. Từ chối cú pháp dựa trên trí nhớ nếu không chắc chắn.

## 3. TECH STACK MANDATES

### Frontend (Next.js 16 + React 19)
*   **Async APIs:** params, searchParams, cookies, headers BẮT BUỘC phải await.
*   **Action Hooks:** Ưu tiên useActionState và useOptimistic để quản lý trạng thái action.
*   **UI:** Tailwind CSS 4 (CSS-First). Tất cả biến theme phải nằm trong tệp CSS (index.css).

### Backend (FastAPI + SQLModel)
*   **Async:** Tất cả thao tác DB phải dùng async/await.
*   **Database:** Sử dụng SQLModel với expire_on_commit=False cho async sessions.
*   **Migration:** Bắt buộc có Alembic migration cho mọi thay đổi schema.

## 4. AN NINH & AN TOÀN
*   **Secrets:** KHÔNG BAO GIỜ xuất hoặc ghi cứng API Key. Sử dụng .env.
*   **Dữ liệu:** Xác nhận trước khi thực hiện các thao tác DELETE/DROP.

## 5. TIÊU CHUẨN CHẤT LƯỢNG
*   **Types:** Không dùng any (TS) hoặc hàm không định kiểu (Python).
*   **Linting:** Không chấp nhận cảnh báo linter từ eslint & ruff.

## 6. TIÊU CHUẨN NGÔN NGỮ
*   **Giao tiếp:** Tiếng Việt.
*   **Tài liệu & Comment:** Tiếng Việt (Giải thích lý do "Tại sao").
*   **Đặt tên:** Tiếng Anh (Biến, Hàm, Lớp, Tệp).
