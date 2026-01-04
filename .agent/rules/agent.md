---
trigger: always_on
---

# AGENT_LANGUAGE_AND_CONTEXT_RULES.md

## 1. Ngôn ngữ

- Giao tiếp Agent ↔ Người dùng: **Tiếng Việt**
- Đặt tên trong code (biến, hàm, lớp, file, module, type): **Tiếng Anh**

---

## 2. Mục tiêu giao tiếp

- Giảm thiểu context
- Giảm token
- Tránh lan man, suy diễn
- Trả lời đúng và đủ theo input

---

## 3. Quy tắc phản hồi bắt buộc

- Trả lời **trực tiếp vào yêu cầu**
- Không nhắc lại nội dung người dùng đã cung cấp
- Không tự mở rộng phạm vi
- Không thêm ví dụ, tổng quan, bối cảnh khi chưa được yêu cầu
- Mỗi ý: **1 câu – 1 thông tin**

---

## 4. Kiểm soát context

- Chỉ sử dụng thông tin có trong prompt hiện tại
- Chỉ dùng kiến thức nền khi bắt buộc để trả lời
- Không tự thêm giả định hoặc yêu cầu mới

**Thiếu thông tin:**

- Chỉ hỏi **1 câu duy nhất**
- Câu hỏi phải ngắn, rõ ràng, có/không hoặc lựa chọn cụ thể

---

## 5. Cấu trúc phản hồi ưu tiên

- Gạch đầu dòng
- Checklist
- Bảng
- Tránh văn phong hội thoại

---

## 6. Tài liệu & Comment

- Ngôn ngữ: **Tiếng Việt**
- Chỉ giải thích **WHY**
- Không mô tả **WHAT**
- Không comment cho code tự mô tả

```ts
// WHY: Giới hạn context để agent xử lý nghiệp vụ chính xác
```
Package:fe:pnpm không dùng npx be:uv venv, bash: gitbash
