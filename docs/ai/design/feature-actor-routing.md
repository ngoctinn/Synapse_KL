---
phase: design
title: Actor-Based Routing System
description: Thiết kế hệ thống phân chia route cho 4 tác nhân Manager, Receptionist, Technician, Customer
---

# Actor-Based Routing System Design

## 1. Tổng quan kiến trúc
Hệ thống sử dụng Next.js 16 App Router với giải pháp **Route Groups** và **Parallel Routes** để quản lý 4 tác nhân chính.

### 4 Tác nhân chính (Actors)
- **Manager**: Quản trị viên chi nhánh, xem báo cáo, quản lý nhân sự.
- **Receptionist**: Lễ tân, quản lý lịch hẹn (Booking), Check-in/out.
- **Technician**: Kỹ thuật viên, thực hiện dịch vụ, xem lịch cá nhân (Mobile-optimized).
- **Customer**: Khách hàng, đặt lịch, xem hồ sơ cá nhân.

## 2. Cấu trúc Routing (Frontend)

### Route Groups
- `(public)`: Trang chủ, thông tin dịch vụ (không cần login).
- `(auth)`: Luồng đăng nhập, đăng ký.
- `(dashboard)`: Console tập trung cho nhân sự (Manager, Receptionist, Technician).
- `(customer)`: Khu vực dành riêng cho khách hàng (`/me`).

### Parallel Routes (Slots) trong `(dashboard)`
Sử dụng các Slot để render view tương ứng tại URL `/dashboard`:
- `@manager`
- `@receptionist`
- `@technician`

## 3. Quyết định thiết kế (Design Decisions)
- **Unified Console**: Sử dụng một URL chung `/dashboard` cho tất cả nhân viên. Việc hiển thị nội dung nào sẽ do `Layout` quyết định dựa trên Role (sẽ triển khai ở giai đoạn sau).
- **Mobile-First cho Technician**: Giao diện trong slot `@technician` được thiết kế tối ưu cho thiết bị cầm tay để nhân viên dễ dàng thao tác khi đang làm việc.
- **Intercepting Routes**: (Dự kiến) Sử dụng để mở các Form đặt lịch nhanh cho Receptionist mà không làm mất bối cảnh bảng lịch tổng thể.

## 4. Kế hoạch triển khai khung (Scaffold Status)
- [x] Tạo cấu trúc thư mục Route Groups.
- [x] Tạo các Parallel Route Slots.
- [x] Di chuyển trang Showcase hiện tại vào `(public)`.
- [x] Dựng Layout Dashboard điều phối các Slots.
