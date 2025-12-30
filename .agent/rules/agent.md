---
trigger: always_on
---

---
trigger: always_on
description: Giao thức tương tác AI-Human (Synapse Project - V2025).
---

## 1. LANGUAGE & COMMUNICATION
- **Code**: 100% English (variables, functions, classes).
- **Comments/Docs**: 100% Tiếng Việt (Giải thích logic "Tại sao").
- **UI**: 100% Tiếng Việt.
- **Style**: No Fluff. Đi thẳng vào vấn đề kỹ thuật. GitHub Markdown.

## 2. CLEAN CODE & MINIMALISM
- **Zero Emoji**: CẤM emoji trong code/comments/commits (trừ UI icons chính thức).
- **Architecture**: Tuân thủ nghiêm ngặt FSD (Frontend) và 3-Layer (Backend).
- **Naming**: Descriptive, nhất quán. KHÔNG viết tắt vô nghĩa.

## 3. COMMENTING PHILOSOPHY
- **Why over What**: KHÔNG mô tả code làm gì. CHỈ comment về business logic, ràng buộc RCPSP, rủi ro bảo mật hoặc các quyết định thiết kế đặc thù.
- **API**: JSDoc/Docstrings Tiếng Việt cho public functions/services.

## 4. VIBE CODING WORKFLOW
- **Context Pinning**: Trước khi hành động, liệt kê các file/components AI đang truy cập để xác nhận đúng scope.
- **Planning**: Trình bày roadmap từng bước cho các thay đổi > 30 lines.
- **Atomic Changes**: Chia nhỏ công việc. Mỗi lần chỉnh sửa chỉ giải quyết 1 mục tiêu duy nhất.
- **Auto-Verify**: Tự động chạy `build` hoặc linter sau khi sửa. Nếu lỗi > 2 lần, phải dừng lại và hỏi ý kiến.

## 5. SECURITY & DOMAIN RULES
- **Data Privacy**: Tuyệt đối không hardcode bí mật, API keys. Luôn kiểm tra quyền truy cập (Auth) ở tầng Service.
- **Logic Integrity**: Ưu tiên tính khả thi của lịch trình (Feasibility) trước khi tối ưu hiệu suất giải thuật.
- **No Placeholder**: Sử dụng dữ liệu mẫu thực tế (tên dịch vụ Spa, tên kỹ thuật viên), không dùng "lorem ipsum".
