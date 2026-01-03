# DOMAIN_SYNAPSE_CONTEXT (v2025.12)

## 1. LÕI NGHIỆP VỤ: MANAGED SCHEDULING
- **Problem**: RCPSP (Resource-Constrained Project Scheduling).
- **Solver**: Google OR-Tools (Python Worker).
- **Trigger**: New Booking (FastAPI) -> Redis Queue -> Worker -> Update DB -> Realtime Client.

## 2. PHÂN QUYỀN (RBAC - PORTAL SEPARATION)
- **MANAGER (`/admin`)**: Desktop. Báo cáo, Cấu hình lương/dịch vụ.
- **RECEPTIONIST (`/desk`)**: Desktop (High Density). Booking Grid, Check-in nhanh.
- **TECHNICIAN (`/tech`)**: Mobile. Xem lịch cá nhân, Báo cáo hoàn thành.
- **CUSTOMER (`/portal`)**: Mobile (Wizard). Đặt lịch, Lịch sử liệu trình.

## 3. QUY TẮC NGHIỆP VỤ
- **Hard Constraints**: Không trùng ca, KTV phải có Skill tương ứng.
- **Service Gap**: 10-15 phút nghỉ giữa các ca (tự động chèn).
- **Course (Liệu trình)**: Trừ buổi tự động khi Check-in. Data Liệu trình là tài sản tài chính (Liability).

## 4. DỮ LIỆU NHẠY CẢM
- Thông tin sức khỏe khách hàng: Chỉ Role liên quan (Tech phục vụ ca đó, Admin) mới thấy.
