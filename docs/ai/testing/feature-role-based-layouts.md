---
phase: testing
title: Testing Strategy - Role-Based Layouts
description: Quy trình kiểm thử đảm bảo người dùng chỉ thấy giao diện thuộc vai trò của mình.
---

# Testing Strategy: Role-Based Layouts

## Test Cases

### 1. Phân quyền giao diện (UI Separation)
- [ ] **Case 1.1:** Đăng nhập với role `ADMIN` -> Thấy menu Báo cáo, Nhân sự. Không thấy menu "Đặt lịch" của Customer.
- [ ] **Case 1.2:** Đăng nhập với role `TECHNICIAN` -> Thấy view Timeline cá nhân. Không thấy menu "Cấu hình hệ thống".
- [ ] **Case 1.3:** Đăng nhập với role `CUSTOMER` -> Thấy giao diện booking. Không thấy Sidebar nội bộ.

### 2. Điều hướng & URL
- [ ] **Case 2.1:** User CUSTOMER cố gắng truy cập `/dashboard` (của nhân viên) -> Phải bị redirect về `/me` hoặc trang phù hợp.
- [ ] **Case 2.2:** Kiểm tra nút "Back" trên trình duyệt không làm lộ giao diện của role trước đó.

### 3. Trạng thái Loading/Error
- [ ] **Case 3.1:** Kiểm tra loading state riêng của từng slot khi dữ liệu chậm.
- [ ] **Case 3.2:** Kiểm tra bọc lỗi (Error Boundary) khi một slot bị crash không làm hỏng toàn bộ Layout chính.
