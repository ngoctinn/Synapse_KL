# Synapse Spa: Project Roadmap & Strategy

Dự án Synapse Spa - Hệ thống quản lý chăm sóc khách hàng Spa thông minh.

## Lộ trình phát triển (Roadmap)

### 🟢 Giai đoạn 1: Nền tảng & Giao diện (Hoàn thành)
- [x] Thiết lập Framework (Next.js 16, FastAPI).
- [x] Chuẩn hóa UI Primitives (Sizing, Accessibility).
- [x] Khởi tạo Dashboard Layout đa vai trò (Role-based Layouts).

### 🟡 Giai đoạn 2: Quản lý Vận hành & Nghiệp vụ (Tiếp theo)
Mục tiêu: Thiết lập các tham số vận hành và dữ liệu nền tảng.
1. **Module Cấu hình Hệ thống (Operational Settings):** Giờ mở/đóng cửa, Quản lý ngày nghỉ lễ/nghỉ định kỳ. (Ưu tiên cao nhất)
2. **Module Dịch vụ (Service Management):** Danh mục, Dịch vụ, Giá, Kỹ năng yêu cầu.
3. **Module Tài nguyên & Nhân tài:** Kỹ thuật viên, Phòng/Giường, Phân ca làm việc.

### 🟠 Giai đoạn 3: Hệ thống Đặt lịch & Điều phối (MVP)
Mục tiêu: Vận hành luồng đặt lịch cơ bản.
1. **Booking Engine (v1):** Kiểm tra tính khả dụng cơ bản, đặt lịch phía khách hàng.
2. **Receptionist Console:** Quản lý lịch hẹn, Check-in/Check-out, POS cơ bản.
3. **Technician Mobile View:** Xem lịch làm việc và ghi chú trị liệu.

### 🔴 Giai đoạn 4: Tối ưu hóa & Nâng cao
Mục tiêu: Ứng dụng AI/Toán học vào vận hành.
1. **Scheduling Engine (v2):** Tối ưu hóa lịch tập trung (OR-Tools CP-SAT).
2. **Analytics & Báo cáo:** Dashboard tài chính và hiệu suất cho Quản lý.
3. **Automation:** Nhắc lịch tự động, Chăm sóc khách hàng tự động.

---

## Bước đi tiếp theo (Next Steps)
Tôi đề xuất bắt đầu **Giai đoạn 2: Quản lý Nghiệp vụ Cốt lõi**, tập trung vào **Module Dịch vụ (Services)**. Đây là module đơn giản nhất để thiết lập chuẩn FSD và luồng dữ liệu Backend-Frontend hoàn chỉnh.
