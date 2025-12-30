---
phase: requirements
title: Service & Resource Management - Requirements & Problem Understanding
description: Module quản lý Dịch vụ, Danh mục, Kỹ năng, và Tài nguyên (Giường/Thiết bị) cho Spa
feature: service-management
priority: high
---

# Service & Resource Management - Requirements & Problem Understanding

## Problem Statement

### Vấn đề cần giải quyết

1. **Thiếu hệ thống quản lý dịch vụ tập trung**: Spa cần một nơi để quản lý tất cả dịch vụ đang cung cấp, bao gồm giá, thời lượng, và yêu cầu kỹ năng.

2. **Khó phân công nhân viên phù hợp (Skill Matching)**: Không có cách liên kết giữa dịch vụ yêu cầu kỹ năng gì và nhân viên có kỹ năng gì -> Dẫn đến booking sai người, giảm chất lượng dịch vụ.

3. **Thiếu tổ chức danh mục**: Dịch vụ cần được phân loại rõ ràng (Massage, Facial, Nail...) để khách hàng dễ tìm kiếm và Manager dễ quản lý.

4. **Chưa có Buffer Time Management**: Giữa các ca làm việc, nhân viên cần thời gian chuẩn bị (dọn dẹp, vệ sinh dụng cụ, nghỉ ngơi) nhưng chưa có cách định nghĩa chính thức.

5. **Thiếu quản lý tài nguyên vật lý (Giường/Thiết bị)**: Mỗi dịch vụ cần giường massage, giường facial, hoặc thiết bị chuyên dụng. Không có hệ thống quản lý dẫn đến double-booking tài nguyên.

### Ai bị ảnh hưởng?

- **Manager**: Cần quản lý catalog dịch vụ, cập nhật giá, thêm/bớt dịch vụ, quản lý giường và thiết bị.
- **Receptionist**: Cần tra cứu nhanh dịch vụ khi khách hỏi, biết giường nào trống.
- **Technician**: Cần biết rõ dịch vụ mình sắp thực hiện, thời lượng, giường được phân công.
- **System (Scheduling Engine)**: Cần dữ liệu dịch vụ + resource requirements để tính toán lịch hẹn, tránh overlap cả nhân viên lẫn giường.

### Tình trạng hiện tại

- Chưa có module nào quản lý dịch vụ và tài nguyên.
- Database schema đã định nghĩa sẵn (skills, services, service_categories, resource_groups, resources, service_resource_requirements).

---

## Industry Research Insights

### 1. Skill-Based Assignment (Từ nghiên cứu thực tế)

- **Skill Tags**: Mỗi dịch vụ được gắn các "skill tag" yêu cầu. Khi booking, hệ thống chỉ hiển thị nhân viên có đủ skill.
- **AND Logic**: Nhân viên phải có TẤT CẢ skills yêu cầu mới được phân công (VD: "Massage Thai" yêu cầu cả MASSAGE_THERAPY và THAI_TECHNIQUE).
- **Auto-Assignment**: Hệ thống tự động gợi ý hoặc phân công nhân viên phù hợp nhất dựa trên skill và availability.

### 2. Buffer Time Best Practices (Thời gian nghỉ giữa ca)

- **Recommended**: 5-15 phút buffer sau mỗi dịch vụ (tùy loại).
- **Mục đích**:
  - Dọn dẹp, vệ sinh giường và dụng cụ.
  - Nhân viên nghỉ ngơi, chuẩn bị tinh thần.
  - Phòng trường hợp khách đến muộn hoặc dịch vụ kéo dài.
- **Implementation**: Buffer time nên được cấu hình riêng cho từng dịch vụ, không dùng giá trị cố định.

### 3. Resource Scheduling (Từ nghiên cứu thực tế)

Spa Việt Nam thường có mô hình **Open Floor** với nhiều giường:

| Loại tài nguyên | Ví dụ | Đặc điểm |
|-----------------|-------|----------|
| **Giường Massage** | Giường 1, Giường 2... | Dùng cho các dịch vụ massage body |
| **Giường Facial** | Giường Facial A, B... | Có đèn, kính phóng đại, hơi nước |
| **Giường Đa năng** | Giường VIP 1, 2... | Dùng được cho nhiều loại dịch vụ |
| **Thiết bị chuyên dụng** | Máy HydraFacial, Máy RF... | Số lượng giới hạn, cần đặt trước |

**Automated Resource Allocation**:
- Khi booking dịch vụ, hệ thống tự động tìm giường/thiết bị trống phù hợp.
- Tránh double-booking: Không cho 2 khách dùng cùng 1 giường cùng lúc.
- Maintenance Awareness: Giường đang bảo trì không được đưa vào pool available.

### 4. Service Duration Components

```
Total Booking Slot = Service Duration + Buffer Time
Resource Blocked   = start_delay → (start_delay + usage_duration)
```

**Ví dụ phức tạp: HydraFacial 60 phút**
- Phút 0-30: Làm sạch da, tẩy tế bào chết (chỉ cần giường)
- Phút 30-60: Sử dụng máy HydraFacial (cần giường + máy)

```
service_resource_requirements:
  1. group = "Giường Facial", start_delay = 0, usage_duration = NULL (cả buổi)
  2. group = "Máy HydraFacial", start_delay = 30, usage_duration = 30 (chỉ 30p cuối)
```

### 5. Pricing Strategies (Chiến lược giá)

| Loại | Mô tả | Áp dụng |
|------|-------|---------|
| **Static Pricing** | Một mức giá cố định | 63% Spa (phổ biến nhất) |
| **Variable Pricing** | Giá khác nhau theo ngày/giờ (Peak/Off-peak) | 25% Spa |
| **Dynamic Pricing** | AI điều chỉnh giá theo demand real-time | 15% Spa (Luxury segment) |

**Quyết định MVP**: Chỉ implement **Static Pricing** (1 giá/dịch vụ). Variable/Dynamic là mở rộng sau.

---

## Goals & Objectives

### Primary Goals

1. **CRUD đầy đủ cho Services**: Thêm, sửa, xóa (mềm), xem danh sách dịch vụ.
2. **CRUD cho Service Categories**: Quản lý danh mục phân loại dịch vụ.
3. **CRUD cho Skills**: Quản lý danh sách kỹ năng chuyên môn.
4. **Liên kết Service - Skills**: Gán kỹ năng yêu cầu cho từng dịch vụ (N-N).
5. **CRUD cho Resource Groups**: Quản lý nhóm tài nguyên (Giường Massage, Giường Facial, Máy...).
6. **CRUD cho Resources**: Quản lý tài nguyên cụ thể (Giường 1, Giường 2, Máy HydraFacial...).
7. **Liên kết Service - Resource Requirements**: Gán yêu cầu tài nguyên cho từng dịch vụ.
8. **Buffer Time Management**: Cấu hình buffer time riêng cho từng dịch vụ.

### Secondary Goals

- Sắp xếp thứ tự hiển thị Categories (`sort_order`).
- Tìm kiếm, lọc dịch vụ theo Category/Status.
- Lên lịch bảo trì cho Resources (`resource_maintenance_schedules`).
- Setup time cho từng Resource (thời gian chuẩn bị riêng).

### Non-Goals (Out of Scope)

- **Quản lý liệu trình (Course/Package)**: Sẽ là module riêng.
- **Gán Staff vào Skills (`staff_skills`)**: Thuộc module Staff Management.
- **Variable/Dynamic Pricing**: Phức tạp, để sau MVP.
- **Inventory/Consumables per Service**: Không track vật tư tiêu hao trong MVP.
- **Real-time Resource Availability Display**: Chỉ hiện tại booking mới check, không live dashboard.

---

## User Stories & Use Cases

### US-1: Quản lý Danh mục Dịch vụ

> **As a** Manager,
> **I want to** tạo và sắp xếp các Danh mục dịch vụ (VD: Massage, Chăm sóc da, Nail),
> **So that** dịch vụ được tổ chức khoa học, dễ tìm kiếm.

**Acceptance Criteria:**

- [ ] Có thể thêm Category mới với tên và mô tả.
- [ ] Có thể sửa tên/mô tả Category.
- [ ] Có thể xóa Category (chỉ khi không có dịch vụ nào thuộc về - hiện cảnh báo nếu có).
- [ ] Có thể kéo thả để sắp xếp thứ tự hiển thị (`sort_order`).
- [ ] Hiển thị số lượng dịch vụ trong mỗi Category.

### US-2: Quản lý Kỹ năng (Skills)

> **As a** Manager,
> **I want to** định nghĩa các Kỹ năng chuyên môn (VD: MASSAGE_THERAPY, FACIAL_TREATMENT),
> **So that** hệ thống biết yêu cầu của từng dịch vụ để phân công đúng người.

**Acceptance Criteria:**

- [ ] Có thể thêm Skill với tên, mã code (unique, UPPERCASE_SNAKE_CASE), và mô tả.
- [ ] Có thể sửa thông tin Skill (trừ code sau khi tạo - để tránh break references).
- [ ] Có thể xóa Skill (chỉ khi không được sử dụng bởi dịch vụ hoặc nhân viên nào).
- [ ] Hiển thị số lượng Services và Staff liên quan với mỗi Skill.
- [ ] Code tự động sinh từ tên nếu không nhập (VD: "Massage Thái" -> "MASSAGE_THAI").

### US-3: Quản lý Nhóm Tài nguyên (Resource Groups)

> **As a** Manager,
> **I want to** tạo các nhóm tài nguyên theo loại (Giường Massage, Giường Facial, Máy chuyên dụng),
> **So that** hệ thống biết loại tài nguyên nào cần cho từng dịch vụ.

**Acceptance Criteria:**

- [ ] Có thể thêm Resource Group với: Tên, Loại (BED/EQUIPMENT), Mô tả.
- [ ] Có thể sửa thông tin Group.
- [ ] Có thể xóa Group (chỉ khi không có resource nào và không được dịch vụ nào yêu cầu).
- [ ] Hiển thị số lượng Resources trong mỗi Group.

### US-4: Quản lý Tài nguyên cụ thể (Resources)

> **As a** Manager,
> **I want to** thêm và quản lý từng giường/thiết bị cụ thể,
> **So that** hệ thống track được từng unit để tránh double-booking.

**Acceptance Criteria:**

- [ ] Có thể thêm Resource với: Tên, Mã code (unique), Thuộc Group nào, Trạng thái, Setup time.
- [ ] **Trạng thái**: ACTIVE (sẵn sàng), MAINTENANCE (đang bảo trì), INACTIVE (ngừng sử dụng).
- [ ] Có thể lên lịch bảo trì (Maintenance Schedule) với: Thời gian bắt đầu, kết thúc, lý do.
- [ ] Resource đang bảo trì không xuất hiện trong pool available khi booking.
- [ ] Soft delete (không xóa vĩnh viễn).

### US-5: Quản lý Dịch vụ

> **As a** Manager,
> **I want to** thêm mới và quản lý chi tiết các dịch vụ Spa,
> **So that** hệ thống có đầy đủ thông tin để đặt lịch và tính phí.

**Acceptance Criteria:**

- [ ] **Thông tin cơ bản**: Tên, Mô tả, Hình ảnh (URL).
- [ ] **Phân loại**: Chọn 1 Category (hoặc để trống = Uncategorized).
- [ ] **Thời lượng**:
  - Duration (phút): Thời gian thực hiện.
  - Buffer Time (phút): Thời gian nghỉ sau dịch vụ (mặc định 10 phút).
- [ ] **Giá**: Giá niêm yết (VND), số dương.
- [ ] **Kỹ năng yêu cầu**: Multi-select các Skills cần thiết.
- [ ] **Tài nguyên yêu cầu**: Thêm các Resource Group cần, với:
  - Số lượng (mặc định 1)
  - Start delay (phút từ đầu dịch vụ, mặc định 0)
  - Usage duration (phút, NULL = dùng đến hết)
- [ ] **Trạng thái**: Toggle Active/Inactive.
- [ ] **Soft Delete**: Không xóa vĩnh viễn, đánh dấu `deleted_at`.

### US-6: Xem chi tiết Dịch vụ

> **As a** Receptionist,
> **I want to** xem nhanh thông tin dịch vụ và biết cần những gì,
> **So that** tôi tư vấn chính xác cho khách.

**Acceptance Criteria:**

- [ ] Xem Sheet/Modal chi tiết: Tên, Giá (format VND), Duration, Buffer, Mô tả, Hình ảnh.
- [ ] Hiển thị danh sách Kỹ năng yêu cầu.
- [ ] Hiển thị danh sách Tài nguyên yêu cầu (VD: "1x Giường Massage, 1x Máy HydraFacial từ phút 30").
- [ ] (Future) Hiển thị danh sách Kỹ thuật viên có đủ kỹ năng.

### US-7: Validation & Constraints

> **As a** System,
> **I want to** đảm bảo dữ liệu nhất quán,
> **So that** Booking Engine không gặp lỗi.

**Acceptance Criteria:**

- [ ] Skill code phải unique và uppercase (regex: `^[A-Z][A-Z0-9_]*$`).
- [ ] Resource code phải unique.
- [ ] Duration phải > 0 phút.
- [ ] Buffer time >= 0 phút (mặc định 10).
- [ ] Price phải > 0 VND.
- [ ] Không xóa Category đang có dịch vụ.
- [ ] Không xóa Skill đang được dịch vụ hoặc nhân viên sử dụng.
- [ ] Không xóa Resource Group đang có resources hoặc được dịch vụ yêu cầu.
- [ ] usage_duration không được vượt quá (duration - start_delay).

---

## Success Criteria

| Tiêu chí | Đo lường |
|----------|----------|
| CRUD hoàn chỉnh | Tất cả entities có API & UI. |
| Validation | Không cho xóa entity đang được sử dụng. |
| Performance | Danh sách 100+ dịch vụ load < 500ms. |
| UX | Thao tác thêm dịch vụ mới < 60 giây (bao gồm chọn resources). |
| Data Integrity | Soft delete hoạt động đúng. |
| Scheduling Ready | Dữ liệu đủ cho Booking Engine consume (skills + resources). |

---

## Constraints & Assumptions

### Technical Constraints

- Database schema đã cố định (theo mô tả đã cung cấp).
- Backend: FastAPI + SQLModel + PostgreSQL.
- Frontend: Next.js 16 + Shadcn/UI.
- Resource type là ENUM: `BED` | `EQUIPMENT` (đổi từ ROOM vì Spa này dùng giường, không phải phòng).

### Business Constraints

- Giá dịch vụ phải > 0 (không có dịch vụ miễn phí trong MVP).
- Buffer time mặc định 10 phút, có thể override từng dịch vụ.
- Kỹ năng phải có mã `code` unique để Scheduling Engine sử dụng.
- Mỗi dịch vụ thường cần ít nhất 1 giường.

### Assumptions

- Một dịch vụ có thể yêu cầu nhiều kỹ năng (AND logic - KTV phải có TẤT CẢ các kỹ năng).
- Một dịch vụ có thể yêu cầu nhiều loại tài nguyên (VD: 1 giường + 1 máy).
- `start_delay` và `usage_duration` cho phép mô hình hóa việc dùng thiết bị không suốt buổi.
- Hình ảnh dịch vụ hiện tại chỉ lưu URL.

---

## Questions & Open Items

| # | Câu hỏi | Trạng thái | Ghi chú |
|---|---------|-----------|---------|
| 1 | Cho phép giá = 0 (dịch vụ miễn phí) không? | **Pending** | Có thể cho trường hợp promo |
| 2 | Resource type nên là BED/EQUIPMENT hay ROOM/EQUIPMENT? | **BED** | Spa này dùng open floor |
| 3 | Có cần UI quản lý Maintenance Schedule ngay MVP không? | **Yes** | Cần biết giường nào đang bảo trì |
| 4 | start_delay/usage_duration có quá phức tạp cho MVP? | **Giữ nhưng optional** | Default: 0 và NULL |
| 5 | Có cần hiển thị số giường trống real-time không? | Out of scope | Chỉ check khi booking |

---

## Proposed UX Flow (Manager Dashboard)

### Flow Chính

```
Sidebar: [Quản lý dịch vụ] (icon: Sparkles)
    └── Trang Services
            ├── Tab 1: Dịch vụ (DataTable + Filters + Add Button)
            ├── Tab 2: Danh mục (Sortable List + Add/Edit)
            ├── Tab 3: Kỹ năng (Simple Table + Add Modal)
            └── Tab 4: Giường & Thiết bị (Grouped List + Add/Edit)
```

### UI Components

#### Tab 1: Dịch vụ (Services)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [Search: Tìm dịch vụ...]  [Category ▼] [Status ▼]       [+ Thêm dịch vụ] │
├─────────────────────────────────────────────────────────────────────────┤
│ Tên             │ Danh mục   │ Thời lượng │ Giá      │ Tài nguyên│Status│
├─────────────────────────────────────────────────────────────────────────┤
│ Massage Thái    │ Massage    │ 90p + 15p  │ 500,000đ │ 1 Giường  │[✓]   │
│ HydraFacial Pro │ Facial     │ 60p + 10p  │ 800,000đ │ 1G + 1M   │[✓]   │
│ Nail Art Basic  │ Nail       │ 45p + 5p   │ 150,000đ │ -         │[○]   │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Tài nguyên**: Tóm tắt dạng "1G" (1 Giường), "1G + 1M" (1 Giường + 1 Máy).
- **Click row**: Mở Sheet chi tiết/edit bên phải.

#### Tab 4: Giường & Thiết bị (Resources)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Giường & Thiết bị                            [+ Thêm nhóm] [+ Thêm item] │
├─────────────────────────────────────────────────────────────────────────┤
│ ▼ Giường Massage (5 items)                                              │
│   ├── Giường 1 (ACTIVE)           [Edit] [Maintenance]                  │
│   ├── Giường 2 (ACTIVE)           [Edit] [Maintenance]                  │
│   ├── Giường 3 (MAINTENANCE ⚠️)   [Edit] [End Maintenance]              │
│   ├── Giường 4 (ACTIVE)           [Edit] [Maintenance]                  │
│   └── Giường 5 (ACTIVE)           [Edit] [Maintenance]                  │
│                                                                          │
│ ▼ Giường Facial (2 items)                                               │
│   ├── Facial A (ACTIVE)           [Edit] [Maintenance]                  │
│   └── Facial B (ACTIVE)           [Edit] [Maintenance]                  │
│                                                                          │
│ ▼ Máy chuyên dụng (2 items)                                             │
│   ├── Máy HydraFacial (ACTIVE)    [Edit] [Maintenance]                  │
│   └── Máy RF (MAINTENANCE ⚠️)     [Edit] [End Maintenance]              │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Grouped by Resource Group**: Collapsible sections.
- **Status Badges**: ACTIVE (green), MAINTENANCE (yellow warning), INACTIVE (gray).
- **Maintenance Action**: Click để lên lịch bảo trì hoặc kết thúc bảo trì.

#### Service Form (Sheet) - Resource Requirements Section

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Tài nguyên yêu cầu                                        [+ Thêm]      │
├─────────────────────────────────────────────────────────────────────────┤
│ Nhóm tài nguyên     │ Số lượng │ Bắt đầu (phút) │ Thời lượng (phút)     │
├─────────────────────────────────────────────────────────────────────────┤
│ [Giường Massage ▼]  │ [1]      │ [0]            │ [Cả buổi ▼]           │
│ [Máy HydraFacial ▼] │ [1]      │ [30]           │ [30        ]          │ ← Optional
│                                                                          │
│ (+ Thêm yêu cầu tài nguyên)                                             │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Nhóm tài nguyên**: Dropdown chọn từ danh sách Resource Groups.
- **Thời lượng**: "Cả buổi" = NULL (dùng đến hết dịch vụ) hoặc nhập số phút cụ thể.

### Key Interactions

- **Add Service**: Sheet slide-in từ phải, form đầy đủ bao gồm resource requirements.
- **Add Resource**: Modal nhỏ, chọn Group và nhập thông tin.
- **Maintenance Schedule**: Modal với DateTimePicker để chọn khoảng thời gian bảo trì.
- **Toggle Status**: Click badge -> Switch inline (optimistic update).
- **Delete**: Soft delete với AlertDialog xác nhận.
- **Feedback**: Toast notification sau mỗi thao tác.

---

## Data Schema (Reference)

```sql
-- Skills
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT
);

-- Service Categories
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Resource Groups (Nhóm tài nguyên)
CREATE TYPE resource_type AS ENUM ('BED', 'EQUIPMENT');

CREATE TABLE resource_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type resource_type NOT NULL,
  description TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resources (Tài nguyên cụ thể: Giường 1, Máy HydraFacial...)
CREATE TYPE resource_status AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');

CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES resource_groups(id),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE,
  status resource_status DEFAULT 'ACTIVE',
  setup_time_minutes INTEGER DEFAULT 0,
  description TEXT,
  image_url TEXT,
  deleted_at TIMESTAMPTZ
);

-- Resource Maintenance Schedules
CREATE TABLE resource_maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  reason TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES service_categories(id),
  name VARCHAR(255) NOT NULL,
  duration INTEGER NOT NULL,       -- phút
  buffer_time INTEGER DEFAULT 10,  -- phút
  price DECIMAL(12,2) NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Required Skills (N-N)
CREATE TABLE service_required_skills (
  service_id UUID REFERENCES services(id),
  skill_id UUID REFERENCES skills(id),
  PRIMARY KEY (service_id, skill_id)
);

-- Service Resource Requirements (N-N with attributes)
CREATE TABLE service_resource_requirements (
  service_id UUID NOT NULL REFERENCES services(id),
  group_id UUID NOT NULL REFERENCES resource_groups(id),
  quantity INTEGER DEFAULT 1,
  start_delay INTEGER DEFAULT 0,      -- phút từ đầu dịch vụ
  usage_duration INTEGER,             -- NULL = dùng đến hết dịch vụ
  PRIMARY KEY (service_id, group_id)
);
```
