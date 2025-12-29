---
phase: requirements
title: Requirements & Problem Understanding - Role-Based Layouts
description: Thiết kế hệ thống layout và điều hướng dựa trên vai trò người dùng (RBAC) cho 4 nhóm: Admin, Receptionist, Technician, Customer.
---

# Requirements & Problem Understanding: Role-Based Layouts

## Problem Statement
**Giao diện hiện tại đang gặp các vấn đề sau:**
- **Trộn lẫn nghiệp vụ:** Các màn hình và menu dùng chung khiến người dùng thấy quá nhiều chức năng không thuộc trách nhiệm của mình, gây rối mắt và giảm năng suất.
- **Bảo mật giao diện:** Thiếu sự ngăn chặn truy cập ở tầng layout và navigation, tiềm ẩn rủi ro người dùng truy cập sai luồng nghiệp vụ.
- **UX chưa tối ưu:** Mỗi nhóm người dùng (Quản lý, Lễ tân, Kỹ thuật viên, Khách hàng) có mục tiêu công việc khác nhau nhưng đang phải dùng chung một cấu trúc layout.
- **Khó mở rộng:** Khi hệ thống thêm role hoặc phân quyền chi tiết, cấu trúc layout hiện tại sẽ trở nên quá phức tạp và khó kiểm soát.

## Goals & Objectives
**Mục tiêu chính:**
- Tách biệt hoàn toàn layout và hệ thống điều hướng (Navigation) cho 4 nhóm người dùng chính.
- Cá nhân hóa trải nghiệm người dùng ngay từ khi đăng nhập.
- Tăng cường bảo mật ở tầng giao diện người dùng.

**Mục tiêu phụ:**
- Xây dựng cấu trúc layout linh hoạt, dễ dàng mở rộng thêm role về sau.
- Tối ưu hóa luồng công việc (workflow) cho từng bộ phận.

**Non-goals:**
- Không thiết kế lại (redesign) chi tiết các UI component đã có.
- Không thay đổi logic phân quyền ở Backend (Backend vẫn giữ vai trò kiểm soát API).
- Không hỗ trợ chuyển đổi role (role switching) trực tiếp trên giao diện trong phiên bản này.

## User Stories & Use Cases

### 1. Quản trị viên (Admin / Manager)
- **User Story:** Là quản trị viên, tôi muốn khi đăng nhập thấy ngay tình trạng vận hành tổng thể để ra quyết định nhanh.
- **Workflow:**
    - Đăng nhập -> Dashboard tổng quan (Số lịch hẹn, tỷ lệ lấp lịch, nhân sự đang làm việc).
    - Truy cập nhanh menu: Quản lý dịch vụ, Nhân sự & kỹ năng, Báo cáo tài chính.

### 2. Lễ tân (Receptionist)
- **User Story:** Là lễ tân, tôi muốn thao tác nhanh với lịch hẹn và khách đến quầy mà không bị phân tâm bởi các chức năng quản trị.
- **Workflow:**
    - Đăng nhập -> Xem lịch hẹn trong ngày (Timeline/List).
    - Sử dụng các hành động nhanh: Tạo lịch thủ công, Check-in/Check-out.
    - Không nhìn thấy các menu: Báo cáo, Cấu hình hệ thống.

### 3. Kỹ thuật viên (Technician)
- **User Story:** Là kỹ thuật viên, tôi chỉ quan tâm đến lịch làm việc và thông tin buổi điều trị của mình.
- **Workflow:**
    - Đăng nhập -> Xem lịch làm việc cá nhân và danh sách ca sắp tới.
    - Truy cập menu tối giản: Lịch làm việc, Ghi chú buổi điều trị.

### 4. Khách hàng (Customer)
- **User Story:** Là khách hàng, tôi muốn đặt lịch nhanh, xem lịch đã đặt và không thấy bất kỳ chức năng nội bộ nào.
- **Workflow:**
    - Đăng nhập -> Trang đặt lịch dịch vụ hoặc danh sách lịch hẹn sắp tới.
    - Truy cập menu: Đặt lịch, Lịch sử điều trị, Hồ sơ cá nhân.

## Success Criteria
- Mỗi nhóm người dùng khi đăng nhập chỉ nhìn thấy menu và tính năng thuộc vai trò của mình.
- Trang "Default View" sau khi đăng nhập phải khớp chính xác với User Story của từng vai trò.
- Không còn tình trạng người dùng role thấp thấy menu của role cao (ví dụ: Kỹ thuật viên thấy menu Báo cáo).
- Layout hoạt động ổn định trên cả desktop và tablet (thiết bị chính của kỹ thuật viên và lễ tân).

## Constraints & Assumptions
- **Kỹ thuật:** Sử dụng Next.js Route Groups và Metadata-driven navigation.
- **Quyền hạn:** Một user chỉ có 1 layout duy nhất tại một thời điểm.
- **Dữ liệu:** Giả định Backend đã cung cấp thông tin `role` trong profile người dùng/token.

## Questions & Open Items
- Cần làm rõ cấu trúc thư mục cụ thể để hỗ trợ linh hoạt cả 4 role trong Next.js App Router.
- Có cần bộ lọc nội dung (Search/Filter) riêng biệt cho từng loại menu không?
