# Chiến lược Phân trang & Lọc (Cập nhật v2)

## 1. Quyết định Chiến lược: Client-Side Pagination cho Các Module Nhỏ

Sau khi đánh giá lại yêu cầu và khối lượng dữ liệu, chúng ta quyết định áp dụng **Client-Side Pagination** (Phân trang phía Client) cho module **Dịch vụ (Services)** và các module danh mục tương tự.

### Lý do:
1.  **Khối lượng Dữ liệu Thấp**: Một spa điển hình có dưới 100 dịch vụ. Dữ liệu này (bao gồm cả quan hệ) chỉ chiếm vài chục KB, tải cực nhanh trong một lần request.
2.  **Instant UX**: Việc tìm kiếm, lọc và sắp xếp diễn ra *tức thì* trên trình duyệt, không có độ trễ mạng (network latency). Đây là trải nghiệm người dùng vượt trội so với server-side interactive.
3.  **Giảm Phức tạp**: Loại bỏ nhu cầu đồng bộ trạng thái phức tạp giữa URL và Backend cho module này. Giảm tải các query phức tạp ở Backend.

## 2. Phạm vi Áp dụng

| Module | Chiến lược | Lý do |
| :--- | :--- | :--- |
| **Services** | Client-Side | Dữ liệu tĩnh, số lượng ít (< 500 records). |
| **Categories** | Client-Side | Số lượng rất ít (< 20 records). |
| **Resources** | Client-Side | Số lượng tài nguyên vật lý giới hạn. |
| **Skills** | Client-Side | Số lượng kỹ năng giới hạn. |
| **Customers** | **Server-Side** | Dữ liệu tăng trưởng liên tục (hàng nghìn+). |
| **Bookings** | **Server-Side** | Dữ liệu tăng trưởng nhanh, cần filter theo ngày tháng phức tạp. |

## 3. Kiến trúc Triển khai (Client-Side)

1.  **Server Component (Data Fetching)**:
    - `page.tsx`/`service-management.tsx` gọi Server Action `getServicesAction()`.
    - Action này gọi Backend để lấy **TOÀN BỘ** danh sách (`limit` bị loại bỏ hoặc set rất lớn).
    - Dữ liệu được truyền xuống Client Component dưới dạng prop.

2.  **Client Component (Interaction)**:
    - `ServicesTab` nhận mảng `services`.
    - Sử dụng `useMemo` để thực hiện:
        1.  **Search**: Filter mảng dựa trên text.
        2.  **Filter**: Filter dựa trên các tiêu chí (Category, Active).
        3.  **Sort**: Sắp xếp mảng.
        4.  **Paginate**: Cắt mảng (`slice`) dựa trên `currentPage` và `pageSize` (local state).
    - `DataTable` hiển thị phần dữ liệu đã cắt (`paginatedData`).

## 4. Quy tắc Frontend
- **Active Tab State**: Vẫn sử dụng URL (`?view=services`) để giữ trạng thái tab khi reload, nhưng không đồng bộ `page`, `search` lên URL cho các module nhỏ này (để giữ URL gọn gàng).
- **Hooks**: Sử dụng `usePagination` và `useSorting` (custom hooks) để quản lý logic.

## 5. Kết luận
Chiến lược này tối ưu hóa trải nghiệm người dùng (`Instant UX`) cho các tác vụ quản trị cấu hình (Services, Settings), trong khi vẫn giữ kiến trúc Server-Side cho các tác vụ vận hành dữ liệu lớn (CRM, Booking).
