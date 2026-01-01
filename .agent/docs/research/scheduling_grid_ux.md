# Nghiên cứu: Tối ưu hóa UX Lưới Lập Lịch

## 1. Định nghĩa Vấn đề
`SchedulingGrid` hiện tại gặp phải:
- **Ma sát thao tác**: "Click-to-Add" yêu cầu thao tác qua modal quá nặng nề cho từng ca làm việc đơn lẻ.
- **Mất ngữ cảnh**: Không có sticky column cho tên Nhân viên khi cuộn ngang.
- **Nhiễu thị giác**: Chữ "Bản nháp" lặp lại quá nhiều gây rối mắt.

## 2. Tìm kiếm Kỹ thuật

### A. Sticky Columns (Cố định cột đầu)
- **Hiện trạng**: `smart-data-table.tsx` dùng class Tailwind (`sticky right-0`) thủ công cho cột "Actions".
- **Đề xuất**:
  - Áp dụng `sticky left-0` cho thẻ `<th>` và `<td>` đầu tiên.
  - **Quan trọng**: Thêm `z-index` (`z-20` cho header, `z-10` cho body) và `bg-background` để tránh chồng đè trong suốt.
  - *Lưu ý*: API Pinning của TanStack Table rất mạnh nhưng thừa thãi nếu ta giữ nguyên thẻ `<table>` tùy biến cho grid matrix. CSS thuần là đủ.

### B. Thao tác Hàng loạt (Kéo thả để điền)
- **Mẫu (Pattern)**: "Drag Handle" kiểu Excel hoặc "Lasso Select".
- **Chiến lược Triển khai**:
  1.  **Pointer Events**: Theo dõi `onPointerDown` (Ô bắt đầu) và `onPointerEnter` (Ô hiện tại).
  2.  **Trạng thái Chọn**: Tính toán vùng bao (bounding box) của `[minDate, maxDate]` và `[staffIndex]`.
  3.  **Phản hồi Thị giác**: Highlight các ô trong vùng chọn bằng lớp phủ xanh bán trong suốt (`bg-primary/20`).
  4.  **Hành động**: Khi `onPointerUp`, mở Sheet *một lần duy nhất* với thông tin Nhân viên và Khoảng thời gian đã chọn được điền sẵn.
- **Thư viện có sẵn**: `categories-tab.tsx` dùng `@dnd-kit`, nhưng nó dành cho việc *sắp xếp lại* (List sorting). Với *Grid Selection*, một custom hook `useGridSelection` sẽ nhẹ và chính xác hơn.

### C. Giảm Nhiễu Thị giác
- **Vấn đề**: Chữ "Bản nháp" lặp lại hơn 50 lần.
- **Giải pháp**:
  - **Bỏ chữ**: Dựa vào gợi ý thị giác (visual affordance).
  - **Styling**: Dùng pattern "viền nét đứt" hoặc "nền sọc" cho các mục nháp.
  - **Chú thích**: Thêm chú thích đơn giản phía trên grid (VD: "Nháp: Nền sọc").

## 3. Giải pháp Đề xuất
1.  **Refactor Grid**: Thêm class `sticky left-0` cho cột Nhân viên.
2.  **Implement Drag-Select**: Tạo hook `useDragToSelect` để cho phép chọn nhiều ô.
3.  **Clean UI**: Thay thế chữ "Bản nháp" bằng CSS Pattern (`background-image: repeating-linear-gradient(...)`).

## 4. Các bước Thực hiện
- [ ] Tạo hook `useDragToSelect`.
- [ ] Refactor các ô trong `SchedulingGrid` để hỗ trợ vùng chọn.
- [ ] Cập nhật `batchCreateSchedulesAction` để chấp nhận Khoảng thời gian thay vì danh sách lẻ.
