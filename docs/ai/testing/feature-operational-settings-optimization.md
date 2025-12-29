---
phase: testing
title: Testing Strategy - Operational Settings Optimization
description: Chiến lược kiểm thử cho tính năng tối ưu hóa cấu hình vận hành.
---

# Testing Strategy

## Test Coverage Goals
**Mục tiêu bao phủ?**

- **Unit Test**: 100% cho logic tính toán Range ngày và Validation giờ.
- **Integration Test**: Luồng lưu dữ liệu từ UI xuống API.

## Unit Tests
**Cần test gì?**

### Logic Date Range
- [ ] Test case 1: Chọn 1 ngày đơn lẻ -> tạo ra 1 record.
- [ ] Test case 2: Chọn khoảng 3 ngày (01 - 03) -> tạo ra 3 records.
- [ ] Test case 3: Chọn ngày kết thúc trước ngày bắt đầu (Invalid) -> không cho phép.

### Logic Giờ (Time Validation)
- [ ] Test case 1: Mở 8:00, Đóng 20:00 -> Hợp lệ.
- [ ] Test case 2: Mở 22:00, Đóng 02:00 -> Hợp lệ (Overnight).
- [ ] Test case 3: Mở 08:00, Đóng 08:00 -> Không hợp lệ.

## Manual Testing
**Danh mục kiểm tra thủ công?**

1. Thay đổi dữ liệu ở Tab 1 -> Chuyển sang Tab 2 -> Có cảnh báo không?
2. Bấm "Sao chép giờ" từ Thứ Hai sang tất cả các ngày -> Kiểm tra các ngày khác có tự động cập nhật không.
3. Thêm một ngày ngoại lệ -> Kiểm tra Thứ trong tuần hiển thị có khớp với ngày đã chọn không.
4. Xóa ngày ngoại lệ -> Dialog xác nhận có hiện lên không? Bấm Hủy có giữ lại dữ liệu không?

## Bug Tracking
- Sử dụng console logs và `toast` để theo dõi lỗi khi gọi API.
