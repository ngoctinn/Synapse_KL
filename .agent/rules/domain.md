---
trigger: always_on
description: Ngữ cảnh nghiệp vụ Synapse - Hệ thống quản lý và chăm sóc khách hàng Spa.
---
# DOMAIN_SYNAPSE_CONTEXT (v2025.12)

## 1. THÔNG TIN DỰ ÁN
- **Đề tài**: Hệ thống CRM và Quản lý Spa trực tuyến Synapse.
- **Mục tiêu**: Hiện đại hóa Spa, tối ưu hóa lập lịch (Scheduling) và cá nhân hóa trải nghiệm.

## 2. CORE ENGINE: SCHEDULING (RCPSP)
- **Problem Model**: Resource-Constrained Project Scheduling Problem.
- **Technology**: Google OR-Tools (CP-SAT Solver).
- **Scheduling Logic**:
  - **Hard Constraints**:
    - Không chồng chéo (Zero Overlap) cho Nhân viên, Giường, Thiết bị.
    - Skill-matching: Kỹ thuật viên phải có chứng chỉ phù hợp với dịch vụ.
  - **Soft Constraints**:
    - Cân bằng tải nhân viên.
    - Ưu tiên KTV theo yêu cầu của khách.
    - Giảm thiểu khoảng thời gian trống (Idle time).
  - **Granularity**: Lập lịch dựa trên 5-10 phút slot để tối ưu hóa không gian tìm kiếm của solver.

## 3. RÀNG BUỘC TÀI NGUYÊN
- **Tài nguyên**: Kỹ thuật viên (theo ca), Giường chức năng, Máy móc.
- **Thời gian**:
  - **Recovery Time**: 10-15 phút nghỉ giữa các dịch vụ để vệ sinh/chuẩn bị.
  - **Business Hours**: Tuân thủ khung giờ của chi nhánh.

## 4. PHÂN QUYỀN (RBAC)
- **MANAGER**: Quản lý nhân sự, cấu hình thuật toán, báo cáo doanh thu.
- **RECEPTIONIST**: Quản lý Booking Grid, Check-in/out, POS, Waitlist.
- **TECHNICIAN**: Xem lịch làm việc, cập nhật trạng thái liệu trình. Mobile-first UI.
- **CUSTOMER**: Đặt lịch online, theo dõi liệu trình (Course), lịch sử sức khỏe.

## 5. NGHIỆP VỤ ĐẶC THÙ
- **Liệu trình (Course)**: Quản lý dịch vụ nhiều buổi, tự động trừ số buổi khi check-in.
- **Hàng chờ (Waitlist)**: Tự động thông báo khi có slot trống phù hợp.
- **Data Privacy**: Mã hóa dữ liệu sức khỏe và thông tin cá nhân khách hàng theo tiêu chuẩn.
