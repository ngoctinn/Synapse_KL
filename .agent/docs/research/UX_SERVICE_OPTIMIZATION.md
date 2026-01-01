# Báo cáo Nghiên cứu: Tối ưu hóa UX Module Dịch vụ (Synapse)
**Ngày tạo:** 2026-01-01
**Người thực hiện:** Antigravity (AI Assistant)

## 1. Mục tiêu
Giải quyết 10 vấn đề phản biện UX/UI đã xác định trong Module Quản lý Dịch vụ, tập trung vào tính liên tục của luồng công việc và an toàn dữ liệu.

## 2. Kết quả Nghiên cứu & Giải pháp Đề xuất

### A. Tạo thực thể nhanh (On-the-fly Creation)
*   **Vấn đề:** Manager bị ngắt luồng khi thiếu Danh mục hoặc Kỹ năng trong lúc tạo Dịch vụ.
*   **Giải pháp Best Practice:** Sử dụng "Nested Dialog" (Dialog trong Sheet).
*   **Thực hiện:**
    *   Thêm nút `+` cạnh Select Box của Danh mục và Kỹ năng.
    *   Mở một `Dialog` con có form tối giản.
    *   Sau khi Server Action tạo thành công, tự động chọn thực thể mới đó trong Form chính.
*   **Kỹ thuật:** Sử dụng `open` state riêng biệt cho con và cha. Tránh dùng lồng `Sheet` trong `Sheet` vì gây rối bố cục Mobile.

### B. Kiểm soát rủi ro khi thay đổi trạng thái (Safe Deactivation)
*   **Vấn đề:** Tắt dịch vụ/tài nguyên khi đang có lịch hẹn gây lỗi logic lập lịch.
*   **Giải pháp:** "Dependency Check before Action".
*   **Thực hiện:**
    *   Backend `toggleServiceStatusAction` sẽ kiểm tra số lượng lịch hẹn tương lai (Active Bookings).
    *   Nếu > 0, trả về lỗi: `{ "error": "DEPENDENCY_EXISTS", "count": 15 }`.
    *   Frontend sẽ bắt lỗi này và hiển thị `AlertDialog` cảnh báo chi tiết thay vì chỉ hiện Toast đỏ.

### C. Hướng dẫn tính năng "Smart Price Shorthand"
*   **Vấn đề:** Tính năng gõ 'k', 'm' bị ẩn (Hidden feature).
*   **Giải pháp:** "Contextual Hint".
*   **Thực hiện:**
    *   Thêm một dòng caption nhỏ dưới input giá: *Tips: Gõ '500k' cho 500.000 hoặc '1.5m' cho 1.500.000.*
    *   Hiển thị feedback giá trị đã quy đổi ngay bên cạnh để người dùng kiểm chứng.

### D. Trực quan hóa Resource Timeline + Buffer Time
*   **Vấn đề:** Biểu đồ chiếm dụng tài nguyên hiện tại bỏ qua Buffer Time (thời gian dọn dẹp).
*   **Giải pháp:** "Compound Timeline Visualization".
*   **Thực hiện:**
    *   Tổng thời gian biểu đồ = `duration + buffer_time`.
    *   Vùng chiếm dụng chính: Màu đậm.
    *   Vùng dọn dẹp (Buffer): Màu nhạt/Gạch chéo.
    *   Điều này giúp Manager nhận ra thực tế giường/máy sẽ bận lâu hơn thời gian làm cho khách.

## 3. Kế hoạch triển khai
1.  **Giai đoạn 1:** Cập nhật `ServiceFormSheet` để hỗ trợ hiển thị Hint cho giá và biểu đồ Timeline mới.
2.  **Giai đoạn 2:** Thêm Dialog tạo nhanh Danh mục/Kỹ năng.
3.  **Giai đoạn 3:** Xây dựng logic kiểm tra ràng buộc lịch hẹn ở Backend.
