# Dữ liệu Mẫu Spa Thẩm Mỹ Việt Nam 2025

Tài liệu này tổng hợp bộ dữ liệu mẫu chuẩn hóa cho các Spa Thẩm Mỹ / Clinic tại Việt Nam để sử dụng làm Seed Data.

## 1. Phân quyền & Nhân sự (Staff)

| Chức danh | Vai trò (Role) | Kỹ năng liên quan | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Quản lý** | MANAGER | Quản lý chung | Chủ spa hoặc quản lý chi nhánh |
| **Lễ tân** | RECEPTIONIST | Check-in, Thu ngân, CSKH | |
| **Bác sĩ Da liễu** | DOCTOR (Custom) | Khám da, Laser Co2, Tiêm Filler/Botox | Bắt buộc cho Med Spa |
| **KTV Điều trị** | TECHNICIAN | Peel da, Triệt lông, Máy công nghệ cao | Senior Staff |
| **KTV Chăm sóc** | TECHNICIAN | Facial cơ bản, Massage, Nặn mụn | Junior Staff |

## 2. Danh mục Dịch vụ (Categories) & Dịch vụ (Services)

### 2.1. Điều trị Mụn & Sẹo (Acne & Scar)
| Tên Dịch vụ | Thời lượng | Giá (VNĐ) | Mô tả | Yêu cầu Kỹ năng |
| :--- | :--- | :--- | :--- | :--- |
| **Lấy nhân mụn chuẩn Y khoa** | 60 phút | 350,000 | Quy trình 12 bước, vô khuẩn, chiếu đèn Biolight | KTV Chăm sóc |
| **Peel da sinh học trị mụn** | 45 phút | 850,000 | Sử dụng acid trái cây nồng độ thấp/trung bình | KTV Điều trị |
| **Phi kim trị sẹo rỗ** | 90 phút | 2,500,000 | Tái tạo bề mặt da, kết hợp tế bào gốc | KTV Điều trị |

### 2.2. Trẻ hóa & Công nghệ cao (Hi-Tech Rejuvenation)
| Tên Dịch vụ | Thời lượng | Giá (VNĐ) | Mô tả | Yêu cầu Kỹ năng |
| :--- | :--- | :--- | :--- | :--- |
| **Laser Carbon trẻ hóa** | 60 phút | 1,200,000 | Se khít lỗ chân lông, sáng da bằng than hoạt tính | KTV Điều trị |
| **Điện di tinh chất Vitamin C** | 45 phút | 500,000 | Cấp ẩm, làm sáng da, phục hồi sau nắng | KTV Chăm sóc |
| **HIFU nâng cơ toàn mặt** | 90 phút | 5,000,000 | Nâng cơ không phẫu thuật, giảm nếp nhăn | Bác sĩ Da liễu |

### 2.3. Thẩm mỹ Nội khoa (Aesthetics)
| Tên Dịch vụ | Thời lượng | Giá (VNĐ) | Mô tả | Yêu cầu Kỹ năng |
| :--- | :--- | :--- | :--- | :--- |
| **Tiêm Mesotherapy căng bóng** | 45 phút | 3,500,000 | Cấy tinh chất Mulwang/HA giúp da căng bóng | Bác sĩ Da liễu |
| **Tiêm Filler cằm/mũi (1cc)** | 30 phút | 4,500,000 | Tạo hình cằm V-line hoặc nâng mũi không phẫu thuật | Bác sĩ Da liễu |
| **Xóa nhăn Botox (vùng mắt/trán)** | 30 phút | 2,500,000 | Xóa nhăn động, thư giãn cơ | Bác sĩ Da liễu |

### 2.4. Spa & Thư giãn (Relaxation)
| Tên Dịch vụ | Thời lượng | Giá (VNĐ) | Mô tả | Yêu cầu Kỹ năng |
| :--- | :--- | :--- | :--- | :--- |
| **Gội đầu dưỡng sinh** | 45 phút | 150,000 | Gội thảo dược, massage cổ vai gáy | KTV Chăm sóc |
| **Massage Body đá nóng** | 90 phút | 450,000 | Thư giãn cơ, lưu thông khí huyết | KTV Chăm sóc |

## 3. Tài nguyên & Thiết bị (Resources)

### 3.1. Nhóm Phòng (Rooms)
*   **Phòng Tư vấn (Consultation Room)**: Nơi bác sĩ soi da và tư vấn.
*   **Phòng Điều trị Tech (Hi-Tech Room)**: Đặt máy Laser, Hifu (yêu cầu vô khuẩn).
*   **Phòng Facial (Facial Room)**: Giường spa tiêu chuẩn cho chăm sóc da/gội đầu.
*   **Sảnh chờ (Lobby)**: Khu vực khách đợi.

### 3.2. Nhóm Máy móc (Equipment)
*   **Máy Soi da Visia/A-One**: (1 cái) Đặt tại phòng tư vấn.
*   **Máy Laser CO2 Fractional**: (1 cái) Đặt tại phòng Tech.
*   **Máy Triệt lông Diode**: (1 cái) Đặt tại phòng Tech.
*   **Máy Điện di & Ánh sáng**: (2 cái) Di động, dùng tại phòng Facial.
*   **Giường Spa Cao cấp**: (5 cái) 3 giường Facial, 2 giường Tech.

## 4. Kỹ năng (Skills)

*   `SKILL_BASIC_CARE`: Chăm sóc da cơ bản, Massage, Nặn mụn.
*   `SKILL_LASER_OP`: Vận hành máy Laser, Triệt lông.
*   `SKILL_INJECTION`: Tiêm chích thẩm mỹ (Chỉ dành cho Bác sĩ).
*   `SKILL_CONSULT`: Soi da, đọc chỉ số, tư vấn phác đồ.

---
**Dữ liệu này sẽ được dùng để reset database.**
