---
trigger: always_on
---

---
trigger: always_on
description: Ngữ cảnh nghiệp vụ Synapse - Hệ thống quản lý và chăm sóc khách hàng Spa.
---
# DOMAIN_SYNAPSE_CONTEXT (v2025.12)

## 1. THÔNG TIN DỰ ÁN
- **Đề tài**: Xây dựng hệ thống chăm sóc khách hàng trực tuyến cho Spa.
- **Tên dự án**: Synapse.
- **Mục tiêu**: Hiện đại hóa quản lý Spa, tối ưu hóa lập lịch (Scheduling) và cá nhân hóa trải nghiệm khách hàng (CRM).

## 2. CORE ENGINE: SCHEDULING (RCPSP)
- **Problem Model**: Resource-Constrained Project Scheduling Problem.
- **Technology**: Google OR-Tools (CP-SAT Solver).
- **Scheduling Logic**:
  - **Hard Constraints**:
    - Zero Overlap ($R_i \cap R_j = \emptyset$) cho Nhân viên, Giường, Thiết bị.
    - Skill-matching ($K_{req} \subseteq K_{staff}$): Kỹ thuật viên phải có đủ kỹ năng/chứng chỉ cho dịch vụ.
  - **Soft Constraints (Optimization)**:
    - Cân bằng tải (Load Balancing) nhân viên.
    - Ưu tiên KTV khách yêu cầu (Preference).
    - Giảm thiểu khoảng thời gian trống nhàn rỗi (Idle time).

## 3. RÀNG BUỘC TÀI NGUYÊN & THỜI GIAN
- **Tài nguyên**: Kỹ thuật viên (theo ca), Giường chức năng, Máy móc chuyên dụng.
- **Thời gian**:
  - **Duration**: Thời gian thực hiện dịch vụ.
  - **Recovery Time**: 10-15 phút nghỉ giữa các ca (vệ sinh, chuẩn bị dụng cụ).
  - **Business Hours**: Tuân thủ khung giờ hoạt động của chi nhánh.

## 4. PHÂN QUYỀN & PHẠM VI (RBAC)
- **MANAGER**: Quản trị nhân sự, cấu hình thuật toán lập lịch, báo cáo doanh thu/analytics.
- **RECEPTIONIST**: Quản lý Booking Grid, thực hiện Check-in/out, POS, quản lý hàng chờ (Waitlist).
- **TECHNICIAN**: Mobile-first UI. Theo dõi lịch làm việc cá nhân, cập nhật trạng thái liệu trình.
- **CUSTOMER**: Đặt lịch online, theo dõi liệu trình (Package/Course), lịch sử sức khỏe và ưu đãi.

## 5. NGHIỆP VỤ ĐẶC THÙ TRONG BÁO CÁO
- **Liệu trình (Course)**: Quản lý dịch vụ nhiều buổi, tự động trừ số buổi khả dụng khi check-in.
- **Hàng chờ (Waitlist)**: Tự động thông báo khi có lịch bị hủy khớp với nhu cầu khách.
- **Data Privacy**: Mã hóa dữ liệu sức khỏe và thông tin cá nhân khách hàng.
