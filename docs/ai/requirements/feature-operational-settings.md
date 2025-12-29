---
phase: requirements
title: Requirements & Problem Understanding - Operational Settings
description: Thiết kế và triển khai giao diện quản lý giờ làm việc và ngày nghỉ của Spa.
---

# Requirements & Problem Understanding: Operational Settings

## Problem Statement
**Vấn đề cần giải quyết:**
- **Đối tượng bị ảnh hưởng:** Manager (người quản trị), Khách hàng (không biết giờ đặt), Kỹ thuật viên (không biết lịch làm việc).
- **Hệ quả nếu không giải quyết:** Hệ thống đặt lịch (Booking Engine) sẽ không thể:
    - Hiển thị các slot thời gian khả dụng cho khách hàng.
    - Ngăn chặn khách hàng đặt lịch vào các khung giờ Spa không hoạt động hoặc các ngày nghỉ lễ.
    - Quản lý hiệu quả lịch làm việc của nhân viên dựa trên khung giờ chung của Spa.

## Goals & Objectives
**Mục tiêu chính:**
- Xây dựng giao diện quản lý giờ làm việc định kỳ (`regular_operating_hours`) cho Manager.
- Xây dựng giao diện quản lý các ngày ngoại lệ (`exception_dates`) - luôn override giờ định kỳ.
- Đảm bảo cơ chế lưu dữ liệu thủ công (Manual save) để tối ưu hiệu suất API.

**Mục tiêu phụ:**
- Hỗ trợ dropdown TimePicker với mốc cố định 30 phút.
- Đảm bảo tính nhất quán giữa UI (1 ca/ngày) và DB (đa ca).

**Non-goals:**
- Không hỗ trợ thêm/xóa nhiều ca (period) trên UI v1.
- Không cho phép nhập tự do thời gian.

## User Stories & Use Cases

### 1. Quản lý thiết lập giờ làm việc hàng tuần
- **User Story:** Là quản trị viên, tôi muốn thiết lập giờ mở cửa và đóng cửa cho mỗi ngày trong tuần (Thứ 2 đến Chủ Nhật) để khách hàng biết khi nào có thể đặt lịch.
- **Workflow:**
    - Truy cập trang Cài đặt -> Giờ làm việc.
    - Chỉnh sửa khung giờ cho từng ngày hoặc đánh dấu ngày đó là "Đóng cửa".
    - Nhấn "Lưu" để cập nhật hệ thống.

### 2. Quản lý ngày nghỉ lễ/đột xuất
- **User Story:** Là quản trị viên, tôi muốn thêm các ngày nghỉ lễ (như Tết, Quốc khánh) hoặc các ngày đóng cửa đột xuất (để sửa chữa) để hệ thống tự động khóa lịch trong những ngày đó.
- **Workflow:**
    - Truy cập trang Cài đặt -> Ngày nghỉ.
    - Chọn ngày trên lịch và nhập lý do nghỉ.
    - Xem danh sách các ngày nghỉ sắp tới và có thể xóa nếu cần.

### 3. Các trường hợp biên (Edge Cases)
- **Thay đổi giờ khi đã có lịch hẹn:** Nếu Manager rút ngắn giờ làm việc khi đã có khách đặt lịch trong khung giờ đó, hệ thống cần cảnh báo (nhưng vẫn cho phép lưu, việc xử lý khách sẽ tính sau).
- **Ngoại lệ trùng lặp:** Hai cấu hình trong `exception_dates` trùng ngày nhau (Xử lý: Ưu tiên bản ghi được tạo mới nhất).
- **Giờ đóng cửa qua đêm:** Hiện tại chưa hỗ trợ (open < close).

## Success Criteria
- Manager có thể thay đổi giờ làm việc và ngày nghỉ một cách dễ dàng.
- Giao diện có validation chặt chẽ (ví dụ: giờ mở cửa phải trước giờ đóng cửa).
- Các thay đổi được lưu trữ thành công vào Database.
- UI tuân thủ các chuẩn accessibility đã thiết lập (Sizing, Focus).

## Constraints & Assumptions
- Sử dụng `react-hook-form` và `zod` để quản lý form.
- Sử dụng component `Calendar` và `TimePicker` từ `shared/ui`.

## Questions & Open Items
- Có cần hỗ trợ chia khung giờ theo từng loại dịch vụ không? (Hiện tại giả định áp dụng chung cho toàn Spa).
- Có cần cơ chế lặp lại cho các ngày nghỉ định kỳ hàng năm không?
