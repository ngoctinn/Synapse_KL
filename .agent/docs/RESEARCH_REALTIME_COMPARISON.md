# RESEARCH: REALTIME ARCHITECTURE COMPARISON
**(Updated: 2026-01-03)**

So sánh chi tiết giữa **Supabase Realtime** và **FastAPI WebSockets** trong ngữ cảnh dự án Synapse_KL (Scheduling/Booking System).

## 1. SUPABASE REALTIME (POSTGRES CDC)

### Cơ chế hoạt động
Supabase Realtime sử dụng **BinLog (WAL Replication)** của PostgreSQL để bắt sự kiện (Change Data Capture - CDC).
*   Khi FastAPI ghi vào DB -> Postgres phát sinh Event -> Supabase Realtime Server bắt Event -> Broadcast cho Client qua WebSocket.

### Ưu điểm (Tại sao Best Practice cho Synapse?)
1.  **Single Source of Truth**: Dữ liệu **đã lưu thành công** vào DB mới được báo về Client. Tránh tình trạng "Giao diện cập nhật ảo" nhưng DB lỗi.
2.  **Decoupled Architecture**: FastAPI không cần biết Client đang kết nối ở đâu. Nó chỉ việc ghi dữ liệu (Write Operation). Client (Next.js) tự lắng nghe thay đổi (React Operation).
3.  **Scalability**: Supabase (Elixir/Erlang based backend) sinh ra để handle milioni connection. Bạn không cần lo về việc quản lý socket pool hay Redis Adapter cho horizontal scaling.
4.  **Security (RLS)**: Realtime tuân thủ Row Level Security. Chỉ user có quyền xem row đó mới nhận được event.

### Nhược điểm
*   **Latency**: Có độ trễ nhỏ (Pipeline: FastAPI -> DB -> WAL -> Realtime -> Client). Thường là < 100ms, chấp nhận được cho Booking.
*   **Cost**: Postgres Changes tốn tài nguyên DB nếu write frequency cực cao (> 1000 ops/sec).

---

## 2. FASTAPI WEBSOCKETS

### Cơ chế hoạt động
FastAPI duy trì kết nối WebSocket trực tiếp với Client.
*   Khi FastAPI xử lý xong Booking -> Phải tự gọi hàm `manager.broadcast()` để báo cho tất cả client khác.

### Ưu điểm
*   **Low Latency**: Nhanh hơn (FastAPI báo Client ngay lập tức, bỏ qua bước DB WAL).
*   **Custom Event**: Có thể bắn các event không liên quan đến DB (vd: "User A đang gõ phím...", "Chuẩn bị reload trang").

### Nhược điểm (Tại sao KHÔNG NÊN dùng cho Synapse?)
1.  **Scaling Complexity**: FastAPI là Stateless. Nếu bạn chạy 2 instance FastAPI (Load Balancing), socket ở Server A sẽ KHÔNG biết Server B vừa nhận request. Phải cài thêm **Redis Pub/Sub (`encode/broadcaster`)** để đồng bộ.
    *   *Hệ quả*: Tăng độ phức tạp vận hành (DevOps cost).
2.  **Duplicated Logic**: Phải viết code emit event ở mọi nơi (CreateBooking, UpdateBooking, CancelShift...). Quên emit = Client lệch data.
3.  **Connection Limit**: Python async tốt nhưng quản lý hàng nghìn connection lâu dài vẫn tốn resource hơn Elixir (Supabase).

---

## 3. KẾT LUẬN & KHUYẾN NGHỊ

### Tại sao chọn Supabase Realtime?
*   **Phù hợp với Booking Grid**: Grid chỉ nên update khi dữ liệu **THỰC SỰ** đã thay đổi trong DB (Consistency > Latency).
*   **Giảm tải cho Backend Team**: Python Dev chỉ tập trung thuật toán Scheduling. Không cần lo code logic notify.
*   **An toàn**: RLS đảm bảo Kỹ thuật viên chi nhánh A không bao giờ sniff được event của chi nhánh B.

### Khi nào mới dùng FastAPI WebSockets?
*   Chỉ khi cần tính năng **Ephemeral** (tạm thời) như: Chat Realtime, Typing Indicator, hoặc cursor position của chuột.
*   Với Core Data (Lịch, Khách, Ca làm việc), **CDC Pattern (Supabase)** là chân ái.
