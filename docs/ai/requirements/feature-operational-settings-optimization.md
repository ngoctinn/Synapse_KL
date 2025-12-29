---
phase: requirements
title: Tối ưu hóa Cấu hình Vận hành (Operational Settings Optimization)
description: Cải thiện trải nghiệm người dùng, tính nhất quán của UI và bổ sung các tính năng quản lý lịch vận hành nâng cao.
---

# Requirements & Problem Understanding

## Problem Statement
**Vấn đề chúng ta đang giải quyết là gì?**

Hiện tại, module "Cấu hình vận hành" đang ở mức MVP, dẫn đến một số hạn chế:
- **Trải nghiệm người dùng (UX) không nhất quán**: Cơ chế lưu dữ liệu khác nhau giữa các tab (Tab "Giờ định kỳ" lưu riêng, "Ngày ngoại lệ" lưu chung).
- **Thiếu tính năng quan trọng**: Chưa hỗ trợ chọn khoảng ngày (Date Range), chưa có tính năng sao chép giờ làm việc giữa các ngày.
- **Rủi ro dữ liệu**: Người dùng không được cảnh báo khi chuyển tab mà chưa lưu dữ liệu.
- **Thiếu thông tin trực quan**: Danh sách ngày ngoại lệ thiếu hiển thị Thứ trong tuần, gây khó khăn cho việc đối chiếu lịch.
- **Giới hạn nghiệp vụ**: Chỉ hỗ trợ ca làm việc trong ngày (open < close), chưa hỗ trợ ca qua đêm.

**Ai bị ảnh hưởng bởi vấn đề này?**
- Quản lý Spa (Manager): Gặp khó khăn và mất thời gian khi thiết lập lịch nghỉ lễ dài ngày hoặc thay đổi giờ làm việc hàng loạt.

## Goals & Objectives
**Chúng ta muốn đạt được điều gì?**

- **Mục tiêu chính**:
  - Thống nhất cơ chế lưu dữ liệu và thông báo trên toàn bộ logic cấu hình.
  - Bổ sung tính năng chọn khoảng ngày cho "Ngày ngoại lệ".
  - Bổ sung tính năng sao chép giờ làm việc (Copy hours) cho "Giờ định kỳ".
  - Thêm cảnh báo "Thay đổi chưa được lưu" (Unsaved changes warning).
  - Cải thiện hiển thị danh sách ngày ngoại lệ (thêm Thứ, Confirm Dialog khi xóa).

- **Mục tiêu phụ**:
  - Hỗ trợ ca làm việc qua đêm (Overnight shifts).
  - Tự động cảnh báo xung đột giữa Giờ định kỳ và Ngày ngoại lệ.

- **Non-goals**:
  - Tích hợp trực tiếp với hệ thống chấm công nhân viên (HR).
  - Thay đổi cấu trúc database lõi (chỉ mở rộng nếu cần thiết).

## User Stories & Use Cases
**Người dùng sẽ tương tác với giải pháp như thế nào?**

1. **Thiết lập kỳ nghỉ**: "Là quản lý, tôi muốn chọn từ ngày 01/01 đến 05/01 để đánh dấu là nghỉ Tết chỉ trong một lần thao tác."
2. **Sao chép giờ**: "Là quản lý, tôi muốn thiết lập giờ cho Thứ Hai và áp dụng nhanh cho tất cả các ngày khác trong tuần."
3. **Bảo vệ dữ liệu**: "Là quản lý, tôi muốn nhận được cảnh báo nếu tôi vô tình chuyển tab hoặc đóng trình duyệt khi đang sửa giờ mà chưa lưu."
4. **Xác nhận xóa**: "Là quản lý, tôi muốn hệ thống hỏi lại trước khi xóa một ngày ngoại lệ để tránh bấm nhầm."
5. **Thông tin chi tiết**: "Là quản lý, tôi muốn thấy Thứ Năm, 01/01/2026 thay vì chỉ 01/01/2026 để dễ hình dung lịch trực."

## Success Criteria
**Làm thế nào để biết chúng ta đã hoàn thành?**

- [ ] UI/UX thống nhất: Chỉ có một cơ chế lưu rõ ràng hoặc tự động phát hiện thay đổi (dirty state).
- [ ] Tính năng "Chọn khoảng ngày" hoạt động ổn định.
- [ ] Tính năng "Sao chép giờ" giúp giảm 50% thao tác thiết lập giờ định kỳ.
- [ ] Cảnh báo Unsaved Changes xuất hiện đúng lúc.
- [ ] Hiển thị thông tin Thứ trong tuần đầy đủ.
- [ ] Logic ca qua đêm được validate đúng (ví dụ 22h - 2h sáng hôm sau).

## Constraints & Assumptions
**Các hạn chế và giả định?**

- **Hạn chế kỹ thuật**: Phải tương thích với React 19 và Next.js 16. Sử dụng Radix UI / Shadcn UI.
- **Giả định**: Người dùng luôn muốn Ngày ngoại lệ có ưu tiên cao hơn Giờ định kỳ khi tính toán khả năng phục vụ.

## Questions & Open Items
**Cần làm rõ thêm điều gì?**

- Có nên hỗ trợ nhiều khung giờ trong cùng một ngày (Break shifts) không? (Tạm thời: Không, để đơn giản hóa MVP+).
- Việc hỗ trợ ca qua đêm có ảnh hưởng đến logic hiển thị trên Calendar của khách hàng không?
