---
phase: implementation
title: Implementation Guide - Operational Settings Optimization
description: Ghi chú kỹ thuật về việc triển khai tối ưu hóa cấu hình vận hành.
---

# Implementation Guide

## Development Setup
**Bắt đầu như thế nào?**

- Đảm bảo môi trường hỗ trợ `npm run dev` cho frontend.
- Cài đặt đầy đủ dependencies của Shadcn UI (`alert-dialog`, `popover`, `calendar`).

## Code Structure
**Cấu trúc code?**

- Các component nằm tại `src/features/system-settings/components/`.
- Logic validation chung nằm tại `src/features/system-settings/types.ts` hoặc tạo file `schema.ts` riêng.

## Implementation Notes
**Chi tiết kỹ thuật cần lưu ý:**

### Trạng thái Dirty
- Sử dụng prop `isDirty` từ `useFormState` của React Hook Form.
- Sync trạng thái này lên `OperationalSettings` (cha) qua callback.

### Range Selection
- Khi chọn range, `onChange` sẽ nhận được đối tượng `{ from: Date, to: Date }`.
- Cần map mảng này thành các bản ghi riêng lẻ trước khi `setExceptions`.

## Error Handling
- Validate lồng nhau: Đảm bảo giờ mở < giờ đóng nếu không phải ca qua đêm.
- Thông báo lỗi chi tiết cho từng dòng nếu có dữ liệu không hợp lệ.
