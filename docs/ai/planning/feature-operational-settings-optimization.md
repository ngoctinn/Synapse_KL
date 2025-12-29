---
phase: planning
title: Project Planning - Operational Settings Optimization
description: Phân rã công việc và lộ trình thực hiện tối ưu hóa cấu hình vận hành.
---

# Project Planning & Task Breakdown

## Milestones
**Các mốc quan trọng?**

- [ ] Milestone 1: Thống nhất cơ chế Save & Dirty State (Tab 1 & 2).
- [ ] Milestone 2: Hoàn thiện "Ngày ngoại lệ" với Range Picker & Confirm Delete.
- [ ] Milestone 3: Hoàn thiện "Giờ định kỳ" với Copy feature & Overnight shift validation.
- [ ] Milestone 4: Kiểm thử tích hợp và Polish UI.

## Task Breakdown
**Các công việc cụ thể?**

### Phase 1: Foundation (Cơ sở)
- [ ] **Task 1.1**: Refactor `OperationalSettings` để quản lý trạng thái form tập trung (Shared State).
- [ ] **Task 1.2**: Implement `DirtyStateListener` để cảnh báo khi người dùng chuyển tab/rời trang mà chưa lưu.

### Phase 2: Exception Dates (Ngày ngoại lệ)
- [ ] **Task 2.1**: Nâng cấp `Calendar` trong `ExceptionDatesManager` thành Range Selection (chọn khoảng ngày).
- [ ] **Task 2.2**: Thêm logic hiển thị Thứ (vi-VN) trong danh sách ngày ngoại lệ.
- [ ] **Task 2.3**: Tích hợp `AlertDialog` (Shadcn UI) cho hành động xóa ngày.

### Phase 3: Regular Operating Hours (Giờ định kỳ)
- [ ] **Task 3.1**: Thêm nút "Sao chép giờ" (Copy to All) cho mỗi ngày.
- [ ] **Task 3.2**: Refactor validation logic trong Zod schema để hỗ trợ ca làm việc qua đêm.
- [ ] **Task 3.3**: Cập nhật logic hiển thị hỗ trợ ghi chú "Ngày hôm sau" nếu giờ đóng < giờ mở.

### Phase 4: Integration & UX
- [ ] **Task 4.1**: Hiển thị cảnh báo xung đột (ví dụ: ngày định kỳ mở nhưng có ngày ngoại lệ đóng).
- [ ] **Task 4.2**: Polish giao diện (Spaced layout, Mobile responsive).

## Dependencies
**Thứ tự ưu tiên và phụ thuộc?**

- Task 1.1 là tiên quyết vì nó thay đổi cách dữ liệu được luân chuyển giữa các component con.
- Task 2.1 phụ thuộc vào việc Backend xử lý tốt mảng JSON gửi lên.

## Timeline & Estimates
**Ước tính thời gian?**

- Phase 1: 2 giờ.
- Phase 2: 3 giờ.
- Phase 3: 3 giờ.
- Phase 4: 2 giờ.
- **Tổng cộng**: Khoảng 10 giờ làm việc. (Buffer 20% cho các vấn đề phát sinh).

## Risks & Mitigation
**Rủi ro và biện pháp xử lý?**

- **Rủi ro**: Ca làm việc qua đêm làm sai lệch logic tính toán lịch hẹn hiện có.
- **Biện pháp**: Viết Unit Test kỹ cho hàm `isOccupied` hoặc `getAvailableSlots`.
