# Giải pháp UX/UI: Tối ưu hóa Lập lịch (Staff Scheduling)

Tài liệu này đề xuất các giải pháp kỹ thuật và thiết kế cho 10 vấn đề UX/UI đã được nhận diện.

## 1. Giải pháp Luồng Thao Tác (Interaction)

### 1.1 Xử lý xung đột chạm (Touch Conflict)
*   **Vấn đề**: `touch-none` làm mất khả năng cuộn trên mobile.
*   **Giải pháp**: **"Long-press to Select" (Nhấn giữ để chọn)**.
    *   Mặc định: Vuốt để cuộn (Scroll).
    *   Kích hoạt chọn: Người dùng nhấn giữ 500ms -> Rung nhẹ (Haptic) -> Chuyển sang chế độ "Drag Selection".
    *   *Kỹ thuật*: Sử dụng `useLongPress` hook kết hợp với `touch-action: pan-y` (chỉ chặn pan-x nếu cần, hoặc cho phép pan bình thường khi chưa vào mode).

### 1.2 Phản hồi bất ngờ (Abrupt Feedback)
*   **Vấn đề**: Sheet mở ngay khi nhả chuột dễ gây lỗi.
*   **Giải pháp**: **Nút xác nhận nổi (Floating Confirmation)**.
    *   Khi `pointerUp`: Không mở Sheet ngay.
    *   Hiển thị Popover/Tooltip ngay tại vị trí trỏ chuột: *"Đã chọn [5] ô. [Phân ca] (Button) | [Hủy] (Button)"*.
    *   Người dùng click "Phân ca" mới mở Sheet. Giảm thiểu thao tác nhầm.

### 1.3 Mâu thuẫn Chỉnh sửa vs. Tạo mới
*   **Vấn đề**: Khó phân biệt click để sửa hay chọn vùng.
*   **Giải pháp**: **Phân tách Action theo Đối tượng**.
    *   Click vào **Vùng Trống**: Bắt đầu chọn vùng (Create Mode).
    *   Click vào **Ca Có Sẵn**: Mở `ShiftDetailSheet` (Edit/Delete). Ngăn chặn hành động "drag" bắt đầu từ một ô đã có dữ liệu (trừ khi nhấn giữ để move - tính năng nâng cao sau này).

## 2. Giải pháp Giao Diện (Visualization)

### 2.1 Khả năng đọc lướt (Scannability)
*   **Vấn đề**: Thiếu thông tin giờ.
*   **Giải pháp**: **Hiển thị Compact Time**.
    *   Trong block ca làm việc: Hiển thị dòng phụ nhỏ (text-xs): `08:00 - 16:00`.
    *   Nếu ô quá nhỏ: Chỉ hiện khi Hover hoặc Zoom level cao.

### 2.2 Độ tương phản trạng thái (State Visibility)
*   **Vấn đề**: Họa tiết mờ nhạt.
*   **Giải pháp**: **Semantic Styling**.
    *   **DRAFT**: Viền nét đứt (Dashed Border) + Badge "Nháp" góc trên phải (chấm tròn màu cam).
    *   **OFFICIAL**: Viền liền (Solid) + Màu nền đậm hơn.
    *   Thêm **Legend (Chú giải)** cố định ở footer hoặc header grid.

### 2.3 Khám phá tính năng (Discoverability)
*   **Vấn đề**: Ẩn nút "+".
*   **Giải pháp**: **Input Hint**.
    *   Luôn hiển thị icon `+` với độ mờ thấp (opacity-20) ở giữa các ô trống.
    *   Hiển thị **Onboarding Tooltip** cho người dùng lần đầu: *"Kéo thả chuột trên các ô trống để phân ca nhanh"*.

## 3. Giải pháp Quản lý (Management UX)

### 3.1 Quá tải thông tin (Cluster)
*   **Vấn đề**: Danh sách phẳng khó theo dõi.
*   **Giải pháp**: **Row Grouping (Nhóm dòng)**.
    *   Nhóm nhân viên theo `Role` hoặc `Department` (Backend có thể trả về, hoặc Client group).
    *   UI: Header nhóm (e.g., "Kỹ thuật viên Spa (12)") có thể Collapsible (Thu gọn) để ẩn bớt nhóm chưa cần quan tâm.

### 3.2 Xử lý lỗi (Recovery)
*   **Vấn đề**: Undo khó khăn.
*   **Giải pháp**: **Toast Undo + Batch Delete**.
    *   Sau khi Save thành công: Hiện Toast *"Đã phân 5 ca. [Hoàn tác]"*.
    *   Trong Grid: Cho phép chọn vùng đè lên các ca đã có -> Menu ngữ cảnh: "Xóa [N] ca đã chọn".

### 3.3 Ngữ cảnh Form (Context)
*   **Vấn đề**: Danh sách tên dạng text khó quản lý.
*   **Giải pháp**: **Removable Tags**.
    *   Trong `ScheduleFormSheet`: Hiển thị danh sách nhân viên dạng Tags (Chips).
    *   Cho phép click dấu `x` trên Tag để loại bỏ nhân viên đó khỏi đợt phân ca này ngay lập tức.

## 4. Logic & Hiệu năng

### 4.1 Phản hồi xung đột (Conflict Feedback)
*   **Vấn đề**: Không biết bị trùng lịch.
*   **Giải pháp**: **Client-side Validation**.
    *   Trong khi Drag: Kiểm tra ngay lập tức mảng `schedules`.
    *   Nếu vùng chọn cắt qua một ca đã có: Tô màu đỏ (`bg-red-500/20`) ô đó.
    *   Hiển thị cảnh báo trong Popover xác nhận: *"Cảnh báo: 2 ô bị trùng lịch"*.
