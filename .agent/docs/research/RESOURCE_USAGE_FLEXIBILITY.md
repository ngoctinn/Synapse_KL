# RESEARCH_REPORT: FLEXIBLE_RESOURCE_OCCUPATION (v2026.01)

## 1. CHỦ ĐỀ NGHIÊN CỨU
Xác định cách thức quản lý và tối ưu hóa việc chiếm dụng tài nguyên không trọn vẹn trong một liệu trình (Partial Resource Occupation).
- **Vấn đề**: Ví dụ một dịch vụ 90 phút nhưng chỉ cần Giường trong 60 phút đầu, sau đó khách di chuyển ra khu vực khác. Nếu hệ thống khóa giường cả 90 phút sẽ gây lãng phí tài nguyên.
- **Câu hỏi**:
    1. Làm thế nào để người dùng thiết lập được khoảng thời gian chiếm dụng (Start Offset & Duration) cho từng tài nguyên?
    2. Thuật toán Scheduling (RCPSP) xử lý việc này như thế nào để tối ưu hóa?
    3. Giao diện trực quan hóa việc này ra sao để Manager dễ hiểu?

## 2. KẾT QUẢ TÌM KIẾM CODEBASE
- **Data Model**: Bảng `ServiceResourceRequirement` trong backend đã có sẵn cột `start_delay` và `usage_duration`. Tuy nhiên hiện tại `usage_duration` đang để mặc định là NULL (ngầm định dùng đến hết dịch vụ).
- **Frontend Schema**: `resourceRequirementSchema` trong `schemas.ts` đã định nghĩa `usage_duration` là optional.
- **UI hiện tại**: `ServiceFormSheet` chỉ mới hiển thị "Bắt đầu sau" (`start_delay`), thiếu ô nhập "Thời lượng sử dụng" (`usage_duration`).

## 3. TÀI LIỆU BÊN NGOÀI & BEST PRACTICES (GOOGLE OR-TOOLS)
- **Cơ chế RCPSP**: Trong Google OR-Tools CP-SAT, mỗi yêu cầu tài nguyên được mô tả bằng một **Interval Variable**.
- **Giải pháp con (Sub-interval)**: Đối với các tài nguyên dùng một phần, ta tạo một interval con gắn chặt với interval chính của dịch vụ qua ràng buộc:
    - `Resource_Interval.Start == Service.Start + Requirement.Start_Delay`
    - `Resource_Interval.End == Resource_Interval.Start + Requirement.Usage_Duration`
    - Ràng buộc cứng: `Start_Delay + Usage_Duration <= Service.Duration`.
- **Lợi ích**: Khi `Usage_Duration` nhỏ hơn `Service.Duration`, tài nguyên sẽ được giải phóng sớm, cho phép solver xếp lịch cho dịch vụ tiếp theo ngay lập tức vào tài nguyên đó.

## 4. TỔNG HỢP & PHƯƠNG ÁN ĐỀ XUẤT

### Phương án: "Dynamic Resource Window"
1. **Frontend**:
    - Thêm ô nhập "Thời lượng dùng" (DurationSelect) bên cạnh "Bắt đầu sau".
    - Mặc định: Nếu để trống, hệ thống tự hiểu là `Total_Duration - Start_Delay`.
    - Validation: `start_delay + usage_duration` không được vượt quá tổng thời gian dịch vụ.
2. **Visualization**:
    - Timeline hiện tại đã xử lý việc vẽ thanh dựa trên `usage_duration`. Khi cập nhật giá trị này, thanh tài nguyên trên sơ đồ sẽ co giãn tương ứng, giúp Manager thấy ngay khoảng thời gian "trống" của tài nguyên trong chính liệu trình đó.
3. **Backend**:
    - Cập nhật logic Service layer để đảm bảo lưu đúng `usage_duration`.

### Đề xuất hành động:
- Cập nhật `ServiceFormSheet` để hiển thị thêm trường "Thời lượng dùng".
- Cập nhật Timeline để hiển thị rõ hơn vùng "Tài nguyên được giải phóng sớm".
