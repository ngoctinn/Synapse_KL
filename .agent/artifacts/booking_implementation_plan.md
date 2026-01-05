# 📋 KẾ HOẠCH TRIỂN KHAI MODULE BOOKINGS

> **Ngày tạo**: 2026-01-06
> **Phiên bản**: v1.0
> **Tham chiếu**: domain.json (RCPSP Model)

---

## 🎯 MỤC TIÊU

Triển khai hệ thống **Booking Optimization** sử dụng Google OR-Tools CP-SAT Solver để tự động phân bổ Staff + Resource cho lịch hẹn của khách hàng.

---

## 📊 KIẾN TRÚC TỔNG QUAN

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   FastAPI        │────▶│  Redis Queue    │
│   (Next.js)     │◀────│   (REST API)     │◀────│  (ARQ Worker)   │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │  OR-Tools       │
                                                 │  CP-SAT Solver  │
                                                 └─────────────────┘
```

---

## 📁 CẤU TRÚC THƯ MỤC

### Backend (`backend/app/modules/bookings/`)
```
bookings/
├── __init__.py
├── models.py           # SQLModel: Booking, BookingItem, BookingStatus
├── schemas.py          # Pydantic v2: BookingCreate, BookingRead, OptimizationRequest
├── router.py           # FastAPI endpoints
├── service.py          # Business logic CRUD
├── optimizer/
│   ├── __init__.py
│   ├── solver.py       # OR-Tools CP-SAT implementation
│   ├── constraints.py  # Hard/Soft constraints definitions
│   └── objective.py    # Objective function (α·C_fair + β·C_pref + γ·C_idle + δ·C_perturb)
└── exceptions.py       # Custom exceptions
```

### Frontend (`frontend/src/features/bookings/`)
```
bookings/
├── api/
│   └── actions.ts      # Server Actions
├── model/
│   └── schemas.ts      # Zod schemas
├── ui/
│   ├── booking-wizard.tsx      # Multi-step booking form
│   ├── slot-picker.tsx         # Time slot selection
│   ├── staff-preference.tsx    # Optional staff preference
│   └── booking-confirmation.tsx
└── index.ts
```

---

## 🔧 PHASE 1: BACKEND CORE (3-4 ngày)

### 1.1 Database Models (`models.py`)

```python
# Entities chính
class BookingStatus(str, Enum):
    PENDING = "pending"           # Chờ optimization
    CONFIRMED = "confirmed"       # Đã xác nhận
    IN_PROGRESS = "in_progress"   # Đang phục vụ
    COMPLETED = "completed"       # Hoàn thành
    CANCELLED = "cancelled"       # Đã hủy

class Booking(SQLModel, table=True):
    id: UUID
    customer_id: UUID             # FK -> customers
    status: BookingStatus
    preferred_time_start: datetime
    preferred_time_end: datetime
    preferred_staff_id: UUID | None
    notes: str | None
    created_at: datetime
    updated_at: datetime

class BookingItem(SQLModel, table=True):
    id: UUID
    booking_id: UUID              # FK -> bookings
    service_id: UUID              # FK -> services
    assigned_staff_id: UUID | None
    assigned_resource_id: UUID | None
    scheduled_start: datetime | None
    scheduled_end: datetime | None
    actual_start: datetime | None
    actual_end: datetime | None
```

### 1.2 OR-Tools Solver (`optimizer/solver.py`)

**Input Data Structure:**
```python
@dataclass
class OptimizationInput:
    booking_items: list[BookingItemData]
    available_staff: list[StaffAvailability]  # Từ StaffSchedule
    available_resources: list[ResourceAvailability]
    time_window: tuple[datetime, datetime]
    weights: ObjectiveWeights  # α, β, γ, δ
```

**Ràng buộc cứng (Hard Constraints):**
- `AddNoOverlap`: Staff không thể phục vụ 2 khách cùng lúc
- `AddNoOverlap`: Resource (giường/phòng) không thể dùng chung
- Skill Matching: `staff.skills ⊇ service.required_skills`
- Time Window: Lịch hẹn phải nằm trong khung giờ làm việc của Staff

**Ràng buộc mềm (Soft Constraints - Objective Function):**
```python
# Minimize Z = α·C_fair + β·C_pref + γ·C_idle + δ·C_perturb
```

### 1.3 Background Worker (ARQ)

**Lý do chọn ARQ thay vì Celery:**
- **Async-native**: Tích hợp tự nhiên với FastAPI asyncio
- **Lightweight**: Footprint nhỏ, setup đơn giản
- **Redis-only**: Project đã có Redis (Supabase/sử dụng cho cache)

**Flow:**
1. `POST /bookings` → Tạo Booking với status `PENDING`
2. Enqueue task `optimize_booking(booking_id)` vào Redis
3. ARQ Worker pick task → Chạy OR-Tools solver
4. Update Booking với kết quả (assigned_staff, scheduled_time)
5. Notify client via WebSocket hoặc polling

---

## 🎨 PHASE 2: FRONTEND UI (2-3 ngày)

### 2.1 Booking Wizard Flow

```
Step 1: Chọn Dịch vụ
    ↓
Step 2: Chọn Thời gian mong muốn (Date + Time Range)
    ↓
Step 3: (Optional) Chọn Nhân viên ưu tiên
    ↓
Step 4: Xác nhận & Đặt lịch
    ↓
Step 5: Chờ hệ thống tối ưu (Loading state)
    ↓
Step 6: Hiển thị kết quả (Staff + Resource + Time chính xác)
```

### 2.2 UI Components cần tạo

| Component | Mô tả |
|-----------|-------|
| `BookingWizard` | Multi-step form với Shadcn Tabs/Steps |
| `ServiceSelector` | Grid/List dịch vụ với filter theo Category |
| `DateTimePicker` | Calendar + Time slot picker |
| `StaffPicker` | Optional, hiển thị staff với skills phù hợp |
| `BookingStatus` | Real-time status với polling/WebSocket |

---

## 📡 PHASE 3: API ENDPOINTS (1-2 ngày)

### Endpoints chính

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/bookings` | Tạo booking mới (trigger optimization) |
| `GET` | `/bookings` | Danh sách bookings (filter by customer/date) |
| `GET` | `/bookings/{id}` | Chi tiết booking |
| `PATCH` | `/bookings/{id}/cancel` | Hủy booking |
| `GET` | `/scheduling/suggest-slots` | Gợi ý slot trống (pre-optimization) |

### Suggest Slots API (Lightweight)

```python
# GET /scheduling/suggest-slots?service_ids=...&date=...
# Returns: list[AvailableSlot] - Các khung giờ có thể đặt
```

**Logic:**
1. Query staff availability từ StaffSchedule
2. Query resource availability từ current bookings
3. Filter theo skill matching
4. Return danh sách slot khả dụng (chưa tối ưu)

---

## 🔄 PHASE 4: INTEGRATION & TESTING (2 ngày)

### 4.1 Integration với modules hiện có

- `scheduling`: Sử dụng StaffSchedule để lấy availability
- `services`: Lấy duration, required_skills, resource_requirements
- `resources`: Kiểm tra resource availability
- `settings`: Business hours, recovery time

### 4.2 Test Cases

- [ ] Booking với 1 service, 1 staff available
- [ ] Booking với multiple services (combo)
- [ ] Booking với staff preference
- [ ] Conflict resolution (2 bookings cùng thời điểm)
- [ ] Edge case: Không có slot khả dụng

---

## 📅 TIMELINE TỔNG HỢP

| Phase | Công việc | Thời gian |
|-------|-----------|-----------|
| 1 | Backend Core (Models, Solver, Worker) | 3-4 ngày |
| 2 | Frontend UI (Wizard, Components) | 2-3 ngày |
| 3 | API Endpoints & Integration | 1-2 ngày |
| 4 | Testing & Polish | 2 ngày |
| **Tổng** | | **8-11 ngày** |

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **OR-Tools chạy Background Worker**: KHÔNG block main thread của FastAPI
2. **ARQ vs Celery**: Dùng ARQ vì async-native, phù hợp project size
3. **Skill Matching là Hard Constraint**: Không được violate
4. **Staff Schedule vs Booking Optimization**: 2 module độc lập
   - Staff Schedule: Manual CRUD (đã hoàn thiện)
   - Booking Optimization: Automatic OR-Tools (module mới)

---

## 📝 TASKS ĐẦU TIÊN

1. [ ] Tạo cấu trúc thư mục `backend/app/modules/bookings/`
2. [ ] Định nghĩa SQLModel cho Booking, BookingItem
3. [ ] Cài đặt dependencies: `ortools`, `arq`
4. [ ] Tạo migration Alembic
5. [ ] Implement basic CRUD service
6. [ ] Implement OR-Tools solver prototype
