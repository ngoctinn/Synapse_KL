---
phase: planning
title: Project Planning & Task Breakdown - Operational Settings
description: Lộ trình nghiên cứu, thiết kế và triển khai frontend cho cấu hình vận hành.
---

# Project Planning & Task Breakdown: Operational Settings

## Milestones
- [ ] Milestone 1: Nghiên cứu UI Design & Mockup Giao diện.
- [ ] Milestone 2: Phát triển UI Components tại `features/system-settings`.
- [ ] Milestone 3: Tích hợp Mock Data và xác thực luồng hoạt động UX.

## Task Breakdown

### Phase 1: Common UI Components
- [x] **Task 1.1:** Phát triển `TimePickerDropdown` (Fixed optionsHH:mm, step 30m).
- [x] **Task 1.2:** Đảm bảo target size h-10 và accessibility.

### Phase 2: Functional Features (Mocked)
- [x] **Task 2.1:** Triển khai `OperatingHoursForm` quản lý `regular_operating_hours`.
    - *Note:* MVP Scope - Chỉ hỗ trợ 1 khung giờ (period) mỗi ngày. Logic đa khung giờ đã được loại bỏ để đơn giản hóa.
- [x] **Task 2.2:** Triển khai `ExceptionDatesManager` quản lý `exception_dates`.
- [x] **Task 2.3:** Tạo Mock Service API để giả lập tương tác dữ liệu.

### Phase 3: Integration & Polish
- [x] **Task 3.1:** Kết hợp các thành phần vào trang Dashboard Manager.
- [x] **Task 3.2:** Hoàn thiện logic Manual Save và thông báo Toast.

## Timeline & Estimates
- **Phase 1:** 4 giờ (Nghiên cứu & Thiết kế).
- **Phase 2:** 8 giờ (Coding Components).
- **Phase 3:** 4 giờ (Testing & Polish).

## Risks & Mitigation
- **Rủi ro:** Các TimePicker thô có thể gây khó khăn cho người dùng chọn giờ nhanh.
- **Giải pháp:** Cung cấp các lựa chọn giờ phổ biến (8h, 9h, 20h) dưới dạng gợi ý.
