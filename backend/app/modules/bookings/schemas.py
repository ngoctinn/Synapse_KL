"""
Booking Schemas - Pydantic v2 schemas cho API request/response.
"""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.modules.bookings.models import BookingSource, BookingStatus


# === Base Schemas ===

class BookingItemBase(BaseModel):
    """Base schema cho BookingItem."""
    service_id: UUID
    sequence_order: int = 1
    notes: str | None = None


class BookingBase(BaseModel):
    """Base schema cho Booking."""
    customer_id: UUID | None = None
    guest_name: str | None = None
    guest_phone: str | None = None
    preferred_date: datetime
    preferred_time_start: datetime
    preferred_time_end: datetime
    preferred_staff_id: UUID | None = None
    source: BookingSource = BookingSource.ONLINE
    notes: str | None = None


# === Create Schemas ===

class BookingItemCreate(BookingItemBase):
    """Schema để tạo BookingItem."""
    pass


class BookingCreate(BookingBase):
    """Schema để tạo Booking mới."""
    items: list[BookingItemCreate] = Field(min_length=1)


# === Read Schemas ===

class BookingItemRead(BookingItemBase):
    """Schema đọc BookingItem."""
    id: UUID
    booking_id: UUID
    assigned_staff_id: UUID | None = None
    assigned_resource_id: UUID | None = None
    scheduled_start: datetime | None = None
    scheduled_end: datetime | None = None
    actual_start: datetime | None = None
    actual_end: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class BookingItemReadWithDetails(BookingItemRead):
    """Schema đọc BookingItem với thông tin liên quan."""
    service_name: str | None = None
    service_duration: int | None = None
    assigned_staff_name: str | None = None
    assigned_resource_name: str | None = None


class BookingRead(BookingBase):
    """Schema đọc Booking."""
    id: UUID
    status: BookingStatus
    optimization_status: str | None = None
    optimization_message: str | None = None
    optimized_at: datetime | None = None
    scheduled_start: datetime | None = None
    scheduled_end: datetime | None = None
    checked_in_at: datetime | None = None
    checked_out_at: datetime | None = None
    created_by: UUID | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BookingReadWithItems(BookingRead):
    """Schema đọc Booking với danh sách items."""
    items: list[BookingItemReadWithDetails] = []
    customer_name: str | None = None
    customer_phone: str | None = None
    preferred_staff_name: str | None = None


# === Update Schemas ===

class BookingUpdate(BaseModel):
    """Schema cập nhật Booking."""
    preferred_date: datetime | None = None
    preferred_time_start: datetime | None = None
    preferred_time_end: datetime | None = None
    preferred_staff_id: UUID | None = None
    notes: str | None = None


class BookingStatusUpdate(BaseModel):
    """Schema cập nhật trạng thái Booking."""
    status: BookingStatus
    cancellation_reason: str | None = None


# === Optimization Schemas ===

class OptimizationWeights(BaseModel):
    """Trọng số cho hàm mục tiêu optimization."""
    fairness: int = Field(default=5, ge=0, le=10)      # α - Cân bằng tải
    preference: int = Field(default=7, ge=0, le=10)    # β - Ưu tiên staff
    idle_time: int = Field(default=3, ge=0, le=10)     # γ - Giảm gap
    perturbation: int = Field(default=2, ge=0, le=10)  # δ - Ổn định


class OptimizationRequest(BaseModel):
    """Request để trigger optimization cho một booking."""
    booking_id: UUID
    weights: OptimizationWeights = OptimizationWeights()
    timeout_seconds: int = Field(default=30, ge=5, le=300)


class OptimizationResult(BaseModel):
    """Kết quả từ optimizer."""
    success: bool
    status: str  # OPTIMAL, FEASIBLE, INFEASIBLE, TIMEOUT
    message: str | None = None
    solve_time_ms: float | None = None
    assigned_items: list[dict] = []  # [{item_id, staff_id, resource_id, start, end}]


# === Suggest Slots Schemas ===

class SuggestSlotsRequest(BaseModel):
    """Request gợi ý slot trống."""
    service_ids: list[UUID] = Field(min_length=1)
    date: datetime
    preferred_staff_id: UUID | None = None


class AvailableSlot(BaseModel):
    """Một slot khả dụng."""
    start_time: datetime
    end_time: datetime
    available_staff_ids: list[UUID] = []
    available_resource_ids: list[UUID] = []


class SuggestSlotsResponse(BaseModel):
    """Response với danh sách slot gợi ý."""
    slots: list[AvailableSlot] = []
    total_duration: int  # Tổng thời gian cần (phút)
