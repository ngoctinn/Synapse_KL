---
phase: requirements
title: Mở rộng Thư viện UI Component cho Synapse Spa
description: Xác định và lập kế hoạch mở rộng thư viện UI dựa trên shadcn để đáp ứng yêu cầu UX hiện đại cho hệ thống quản lý Spa.
---

# Yêu cầu & Phân tích Vấn đề

## Phát biểu Vấn đề
**Chúng ta đang giải quyết vấn đề gì?**

Thư viện UI hiện tại của Synapse chỉ bao gồm các primitive cơ bản từ shadcn, chưa đủ để xử lý các luồng công việc phức tạp của một hệ thống Quản lý Spa hiện đại. Cụ thể:
- **Khoảng trống Lập lịch**: Thiếu component chọn ngày-giờ kết hợp hoặc chọn khung giờ chuyên dụng để đặt lịch nhanh.
- **Quản lý Dữ liệu**: Bảng dữ liệu thiếu khả năng lọc nâng cao (faceted filter) để quản lý danh sách khách hàng và dịch vụ.
- **Chọn Tài nguyên**: Thiếu combobox cho phép chọn nhanh dịch vụ/nhân viên.
- **Chọn Tài nguyên**: Thiếu combobox cho phép chọn nhiều mục để liên kết dịch vụ với nhân viên/phòng.
- **Layout không Nhất quán**: Thiếu sidebar dashboard và hệ thống breadcrumb chuẩn hóa.
- **Component Nguyên bản chưa tối ưu**: Các component mặc định của shadcn/ui chưa hoàn toàn khớp với kỳ vọng UX hiện đại (ví dụ: Button thiếu `cursor-pointer` trong Tailwind v4, Sonner chưa có style đồng bộ với theme Spa).

## Mục tiêu & Đích đến
**Chúng ta muốn đạt được gì?**

- **Mục tiêu chính**:
    - Mở rộng thư viện UI với các component nền tảng thiết yếu từ shadcn (sidebar, calendar, popover, command, v.v.).
    - Xây dựng/Tích hợp các component "UX Hiện đại" tối giản (DateTimePicker, Multi-select).
    - **Tinh chỉnh Component Nguyên bản**: Điều chỉnh CSS (Button cursor) và Sonner để tối ưu cảm giác sử dụng.
    - Đảm bảo tất cả component tuân thủ design token "Tranquil Lotus" (OKLCH Sage/Cream/Gold).
- **Mục tiêu phụ**:
    - Cải thiện khả năng truy cập (A11y) cho tất cả input phức tạp.
    - Tối ưu kích thước bundle bằng cách sử dụng các primitive nhẹ.
- **Ngoài phạm vi**:
    - Thay thế Tailwind CSS bằng thư viện styling khác.
    - Xây dựng một design system hoàn toàn mới từ đầu (logic vẫn nằm trong pattern của shadcn).

## User Stories & Use Cases
**Người dùng sẽ tương tác với giải pháp như thế nào?**

- **Với tư cách Admin**, tôi muốn sử dụng `FacetedFilter` trong bảng dịch vụ để nhanh chóng tìm dịch vụ theo danh mục, trạng thái và khoảng giá.
- **Với tư cách Nhân viên**, tôi muốn đặt lịch nhanh trên một màn hình duy nhất mà không cần qua nhiều bước phức tạp.
- **Với tư cách Quản lý**, tôi muốn có `Sidebar` gọn gàng để điều hướng các mục chính của Spa.

## Tiêu chí Thành công
**Làm sao để biết chúng ta đã hoàn thành?**

- Các component nền tảng (Sidebar, Calendar, Popover, Command, v.v.) được cài đặt và áp dụng theme.
- Các component chuyên biệt (DateTimePicker, Stepper, Multi-Select) được triển khai như shared UI tái sử dụng.
- Tất cả component mới vượt qua kiểm tra accessibility (điều hướng bàn phím, nhãn cho screen reader).
- Đảm bảo tính nhất quán thị giác với theme "Tranquil Lotus" hiện có.
- Cung cấp tài liệu/ví dụ kiểu Storybook cho mỗi component mới.

## Ràng buộc & Giả định
**Chúng ta cần làm việc trong giới hạn nào?**

- **Ràng buộc kỹ thuật**: Phải sử dụng Next.js 16 (App Router), Tailwind v4, và pattern từ shadcn/ui registry.
- **Ràng buộc thiết kế**: Phải sử dụng không gian màu OKLCH như đã định nghĩa trong `globals.css`.
- **Giả định**: Cấu trúc `shared/ui` hiện tại đủ để chứa các phần mở rộng này.

## Câu hỏi & Vấn đề Mở
**Chúng ta cần làm rõ điều gì?**

- Có cần hỗ trợ Dark Mode cho tất cả component mới ngay lập tức không? (Có, theo `globals.css`).
- File Uploader nên hỗ trợ upload trực tiếp lên S3/Supabase hay chỉ base64/blob trước? (Giả định local/multipart cho giai đoạn đầu).
