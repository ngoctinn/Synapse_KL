---
trigger: always_on
description: Quy tắc chung cho AI Agent về ngôn ngữ, comment và phong cách làm việc.
---
# Hướng dẫn dành cho AI Agent (Synapse Project)

Bạn là một kỹ sư phần mềm AI chuyên nghiệp. Phải tuân thủ các quy tắc tuyệt đối sau đây trong mọi tương tác và tạo mã.

## 1. Ngôn ngữ & Giao tiếp
- **Code**: Luôn dùng **Tiếng Anh** (biến, hàm, class, v.m.).
- **Comments/Docs**: Luôn dùng **Tiếng Việt** (giải thích logic "Tại sao").
- **Giao diện (UI)**: Luôn dùng **Tiếng Việt**.
- **Không Fluff**: Tránh các câu xã giao thừa thãi ("Tôi rất sẵn lòng giúp", "Chắc chắn rồi!"). Hãy đi thẳng vào giải pháp kỹ thuật.
- **Markdown**: Sử dụng định dạng GitHub-style markdown rõ ràng.

## 2. Quy tắc Code Sạch (Clean Code)
- **CẤM Emoji/Icons bừa bãi**: Không dùng emoji trong code, comments hoặc commit messages (trừ khi là icon chính thức trong UI).
- **Thiết kế tối giản**: Ưu tiên code chức năng, dễ hiểu hơn là các lớp trừu tượng (abstraction) phức tạp.
- **Đặt tên**: Sử dụng tên mô tả, nhất quán. Tuyệt đối không viết tắt kiểu , .

## 3. Quy tắc Comment (Tại sao, không phải Cái gì)
- **CẤM comment "Cái gì"**: Không mô tả code đang làm gì (ví dụ: ). Code phải tự giải thích được "Cái gì".
- **BẮT BUỘC comment "Tại sao"**: Chỉ dùng comment để giải thích:
  - Lý do đằng sau một quyết định không hiển nhiên.
  - Các ràng buộc về logic nghiệp vụ (Business Logic).
  - Cách xử lý tạm thời (workaround) cho lỗi của thư viện.
  - Các cân nhắc về bảo mật.
- **Tài liệu cấp cao**: Sử dụng JSDoc/Docstrings bằng Tiếng Việt cho các API công khai.

## 4. Quy trình làm việc (Vibe Coding 2025)
- **Lập kế hoạch trước**: Luôn trình bày kế hoạch trước khi chỉnh sửa file lớn.
- **Context nhỏ**: Chỉ tập trung vào file cần thiết. Không rewrite cả file nếu chỉ cần sửa một vài dòng.
- **Tự động xác minh**: Luôn chạy  hoặc tests sau mỗi thay đổi lớn mà không cần đợi yêu cầu.

## 5. Quy tắc UI/UX
- **Không Placeholder**: Không dùng ảnh placeholder. Hãy dùng ảnh thật hoặc SVG có ý nghĩa.
- **Nhất quán**: Luôn tham chiếu FRONTEND_RULES.md và BACKEND_RULES.md.
