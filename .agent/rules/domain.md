---
trigger: always_on
description: Bối cảnh dự án và bài toán lập lịch Spa.
---

# Tài liệu Miền giá trị (Domain) - Dự án Synapse

## 1. Thông tin Dự án
- **Tên đề tài**: Xây dựng hệ thống chăm sóc khách hàng trực tuyến cho Spa.
- **Mục tiêu**: Cung cấp giải pháp quản lý spa hiện đại, tối ưu hóa việc đặt lịch và chăm sóc khách hàng.

## 2. Trọng tâm Kỹ thuật (Scheduling Engine)
- **Bài toán cốt lõi**: Lập lịch dịch vụ Spa (Spa Service Scheduling).
- **Mô hình hóa**: RCPSP (Resource-Constrained Project Scheduling Problem).
- **Công nghệ**: Constraint Programming (CP).
- **Công cụ**: Google OR-Tools (thư viện CP-SAT).

## 3. Mục tiêu Lập lịch
- **Mục tiêu chính**: Tìm lịch **khả thi (Feasible)**. Phải đảm bảo không trùng lịch nhân viên, giường và thiết bị.
- **Mục tiêu phụ**:
  - Cân bằng tải (Load balancing) giữa các nhân viên.
  - Đảm bảo tính công bằng trong phân bổ công việc.
  - Không ưu tiên tối ưu hiệu năng cực hạn (CPU/RAM) mà ưu tiên tính hợp lý của lịch trình.

## 4. Ràng buộc chính (Constraints)
- **Tài nguyên (Resources)**:
  - Nhân viên (Kỹ thuật viên) với kỹ năng phù hợp.
  - Giường chức năng.
  - Thiết bị chuyên dụng.
- **Thời gian (Time)**:
  - Giờ mở cửa của Spa.
  - Thời lượng của từng loại dịch vụ.
  - Thời gian nghỉ giữa các ca.
