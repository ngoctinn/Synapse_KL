# RESEARCH_COMPONENT_RATIONALITY (v2026.01)

## 1. TỔNG QUAN (OBJECTIVE)
Đánh giá tính hợp lý và trải nghiệm người dùng thực thực tế của hệ thống Shared Components thuộc `frontend/src/shared/`. Tập trung vào khả năng vận hành Dashboard Spa với mật độ dữ liệu cao.

---

## 2. DANH SÁCH FILE CHÍNH & LUỒNG XỬ LÝ (DEPENDENCY MAP)

### Core UI (Primitives)
- `shared/ui/multi-select.tsx` -> (Popover, Command, Checkbox, Badge)
- `shared/ui/tabs.tsx` -> (Radix Tabs)
- `shared/ui/button.tsx` -> (Tailwind Variants)

### Shared Components (Composite)
- `shared/components/smart-data-table.tsx` -> (Table, Dropdown, Pagination)
- `shared/components/duration-select.tsx` -> (Select, durationFormatter)

### Luồng xử lý tiêu biểu (Selection flow)
`Feature Layer` (form.watch) -> `Shared Component` (onChange) -> `Primitive UI` (State sync) -> `User Feedback` (Toast/Badge updates).

---

## 3. ĐÁNH GIÁ CHUYÊN SÂU (UX AUDIT)

### 3.1. `MultiSelect` (Bộ chọn Kỹ thuật viên/Kỹ năng)
- **Hợp lý**: Sử dụng `Command` giúp tìm kiếm nhanh khi Spa có hàng trăm kỹ năng/Dịch vụ. Việc cắt ngang (`maxCount`) giúp form không bị vỡ bố cục khi chọn quá nhiều.
- **Vấn đề UX thực tế**:
    - Nút 'X' xóa Badge rất nhỏ (12px). Khi KTV đeo găng tay hoặc thao tác nhanh trên Tablet, việc click trúng 'X' để bỏ chọn rất khó.
    - **Đề xuất**: Tăng `padding-left` cho Badge và tăng kích thước hit-area cho icon 'X'.
- **Chấm điểm**: 8/10.

### 3.2. `SmartDataTable` (Quản lý Booking/Dịch vụ)
- **Hợp lý**: Cơ chế `Sticky Actions` là "cứu cánh" cho màn hình quản lý Dashboard. Việc tách STT (`no`) và Checkbox giúp việc thao số lượng lớn (Batch actions) an toàn hơn.
- **Vấn đề UX thực tế**:
    - Bộ lọc tại Header (inline filter) chiếm diện tich dọc. Với màn hình Laptop 13 inch, phần Table body bị đẩy xuống quá sâu.
    - **Đề xuất**: Chuyển inline filter sang dạng `Faceted Filter` (nút filter tổng) hoặc Toolbar gọn nhẹ hơn.
- **Chấm điểm**: 7.5/10.

### 3.3. `DurationSelect` (Thiết lập liệu trình)
- **Hợp lý**: Format "1 giờ 15 phút" thay vì "75 mins" giúp quản lý Spa dễ hình dung ca làm việc.
- **Vấn đề UX thực tế**:
    - Thiếu tính năng "Custom duration". Một liệu trình mới lạ có thể mất 40 phút, nhưng `step=15` không cho phép chọn.
    - **Đề xuất**: Thêm option "Tùy chỉnh" để mở Input số tự do.
- **Chấm điểm**: 6.5/10.

---

## 4. ĐỀ XUẤT PHƯƠNG ÁN TỐI ƯU (ACTION PLAN)

1.  **Standardize Height**: Tất cả controls trong `shared/ui` phải mặc định đạt `h-11` (44px) để tối ưu cho Tablet tại quầy lễ tân. (Đã thực hiện 80%).
2.  **Affordance Improvement**: Thêm `ring-offset` cho các item `aria-selected` trong `Command` để người dùng thao tác phím Tab/Enter mượt mà hơn.
3.  **Responsive Table**: Chuyển `SmartDataTable` sang dạng `Horizontal Scroll` mặc định cho Mobile thay vì bóp méo các cột.

---

## 5. KẾT LUẬN
Hệ thống component hiện tại mạnh về logic nhưng cần "mềm hóa" ở các điểm tương tác đầu cuối để phù hợp với môi trường Spa (thao tác nhanh, thiết bị cảm ứng).
