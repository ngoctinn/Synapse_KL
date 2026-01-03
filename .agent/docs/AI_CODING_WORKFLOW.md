# QUY TRÌNH CODE AI & CHỐNG ẢO GIÁC (v2025.01)
> **Mục tiêu**: Loại bỏ hoàn toàn "Ảo giác AI" (code bịa đặt, import sai, logic tự tin nhưng sai) và đảm bảo đầu ra có độ tin cậy cao thông qua quy trình "Lên kế hoạch - Kiểm chứng - Triển khai".

## 1. TƯ DUY "CHỐNG ẢO GIÁC" (ANTI-HALLUCINATION)
*   **Giả định bạn đang mất mạng**: Đừng cho rằng bạn "nhớ" chính xác API của Supabase hay Next.js. LUÔN kiểm tra lại tài liệu nếu không chắc chắn 100%.
*   **Không tin tưởng Import**: Không bao giờ import một hàm/component mà bạn chưa thấy tận mắt trong codebase hiện tại hoặc chưa verify qua docs. "Hallucinated Imports" là nguyên nhân số 1 gây lỗi build.
*   **Ngữ cảnh là Vua**: Code thiếu ngữ cảnh chỉ là đoán mò. BẮT BUỘC phải đọc file liên quan trước khi sửa.

---

## 2. QUY TRÌNH 4 BƯỚC (THE 4-STEP WORKFLOW)

### Bước 1: Thu thập ngữ cảnh (Retrieval)
*   **Quy tắc**: Trước khi chạm vào BẤT KỲ file nào, hãy đọc nó trước. Đọc cả file lân cận.
*   **Hành động**: Dùng `view_file` hoặc `grep_search` để hiểu trạng thái *hiện tại* của code.
*   **Kiểm tra**: "Đường dẫn import có khớp thực tế không?" (Ví dụ: là `@/shared/ui/button` hay `@/components/ui/button`?)

### Bước 2: Lập kế hoạch chiến lược (Chain-of-Thought)
*   **Quy tắc**: Viết ra kế hoạch từng bước rõ ràng trước khi viết code.
*   **Tự vấn**: "Dependencies là gì? Thay đổi này có phá vỡ Kiến trúc 3 Lớp không? Có tuân thủ `MASTER_FRONTEND_RULES.md` không?"
*   **Check Docs**: Nếu dùng thư viện mới (vd: `useActionState`), verify cú pháp bằng `@mcp:context7`. Đừng đoán.
*   **Đầu ra**: Một danh sách các bước ngắn gọn trong cửa sổ chat.

### Bước 3: Triển khai (Atomic & Defensive)
*   **Quy tắc**: Mỗi lần gọi tool chỉ sửa một logic nhỏ/cụ thể. Đừng cố refactor cả app một lúc.
*   **Code phòng thủ**:
    *   Thêm validation (`zod`) cho mọi input.
    *   Xử lý lỗi (try/catch) và trả về object lỗi có cấu trúc.
    *   Thêm kiểm tra điều kiện (`if (!data) return null`).
*   **Vibe Check**: Code nhìn có sạch không? Có dùng "Magic Numbers" không? (Xem `SHADCN_CONSISTENCY_PROTOCOL`).

### Bước 4: Thẩm định (Self-Correction)
*   **Quy tắc**: Sau khi viết xong, tự kiểm tra lại ngay lập tức.
*   **Hành động**:
    *   Đọc lại file (`view_file`) để chắc chắn nội dung đã được lưu đúng.
    *   (Tự vấn): "Mình có lỡ tạo vòng lặp vô tận (infinite loop) hay vòng tròn dependencies không?"

---

## 3. CHECKLIST CHO CÁC HÀNH ĐỘNG QUAN TRỌNG

### A. Khi Import Component
1.  [ ] File đó có thực sự tồn tại ở đường dẫn đó không?
2.  [ ] Tên export có đúng không? (Nó export `Card` hay `CardRoot`?)
3.  [ ] Có nguy cơ `circular dependency` không?

### B. Khi Sửa Database/API
1.  [ ] Đã cập nhật Type Definitions (Zod/TypeScript) chưa?
2.  [ ] Đã xử lý trạng thái loading/error chưa?
3.  [ ] Có bảo mật không (Check RBAC/Middleware)?

### C. Khi Refactor (Sửa lại code cũ)
1.  [ ] Đã backup logic cũ (nhớ trong đầu hoặc copy ra) chưa?
2.  [ ] Cách làm mới có đúng chuẩn `VIBE_CODING_PROTOCOL` không?

---

## 4. KHẮC PHỤC SỰ CỐ
*   **Nếu Tool gọi bị lỗi**: Dừng lại. Đọc kỹ thông báo lỗi. Đừng thử lại mù quáng cùng một lệnh.
*   **Nếu bị "Lạc lối"**: Đọc lại `MASTER_FRONTEND_RULES.md` để căn chỉnh lại kiến trúc.
*   **Khi nghi ngờ**: Hỏi người dùng (hoặc tra cứu Docs). "Thà hỏi còn hơn là ảo giác."

> **MANTRA CUỐI CÙNG**: "Kiểm chứng hai lần, code một lần. Ngữ cảnh là sự tin cậy."
