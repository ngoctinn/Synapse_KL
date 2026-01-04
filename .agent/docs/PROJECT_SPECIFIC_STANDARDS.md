
# QUY TẮC ĐẶC THÙ DỰ ÁN (PROJECT_SPECIFIC_STANDARDS)
> **Mục tiêu**: Chuẩn hóa ngôn ngữ và giao diện cho dự án Synapse_KL.
> **Trạng thái**: BẮT BUỘC ÁP DỤNG.

## 1. NGÔN NGỮ & ĐỊA PHƯƠNG HÓA (LOCALIZATION)
*   **UI Text**: 100% **Tiếng Việt**.
    *   ❌ Sai: `Dashboard`, `Settings`, `Logout`.
    *   ✅ Đúng: `Tổng Quan`, `Cấu Hình`, `Đăng Xuất`.
*   **Code Naming**: 100% **Tiếng Anh** (Variables, Functions, Classes, Files).
    *   ❌ Sai: `function tinhTong()`, `var khachHang`.
    *   ✅ Đúng: `function calculateTotal()`, `var customer`.
*   **Comments**:
    *   Ngôn ngữ: **Tiếng Việt**.
    *   Nội dung: Chỉ giải thích **WHY** (Tại sao làm thế này), KHÔNG giải thích **WHAT** (Code làm gì).
    *   ❌ Sai: `// Hàm này lấy danh sách user`.
    *   ✅ Đúng: `// WHY: Cần filter user đã xóa để tránh lỗi tính lương`.

## 2. PHONG CÁCH PHÁT TRIỂN UI (MINIMALIST DEV)
*   **Giai đoạn hiện tại**: Tập trung vào **Business Logic** và **Layout Structure**.
*   **Design Constraints**:
    *   **NO DECORATION**: Không dùng bóng đổ (`shadow`), bo góc trang trí (`rounded-xl`), màu nền sặc sỡ (`bg-gradient`).
    *   **Structure Only**: Chỉ dùng `flex`, `grid`, `gap`, `p-*`, `m-*`, `border` (để chia vùng).
    *   **Components**: Sử dụng Shadcn/UI component ở trạng thái **Default** (không override style thủ công).

## 3. CẤU TRÚC PHÂN QUYỀN (RBAC PORTAL)
Tách biệt rõ ràng 4 phân hệ người dùng trong `src/app`:
1.  `/admin`: **Quản trị viên** (Layout Dashboard 2 cột).
2.  `/desk`: **Lễ tân** (Layout Full-screen tối ưu cho lưới Booking).
3.  `/tech`: **Kỹ thuật viên** (Layout Mobile-first, giới hạn chiều rộng).
4.  `/portal`: **Khách hàng** (Layout Web tiêu chuẩn, Branding).

## 4. QUY TẮC KIỂM SOÁT AGENT
*   Nếu User hỏi bằng Tiếng Việt -> Trả lời Tiếng Việt.
*   Nếu phát hiện code có text Tiếng Anh in cứng ra màn hình -> **TỰ ĐỘNG DỊCH** sang Tiếng Việt ngay lập tức.
*   Nếu phát hiện UI quá nhiều màu sắc/hiệu ứng trong giai đoạn này -> **TỰ ĐỘNG ĐƠN GIẢN HÓA** về wireframe.
