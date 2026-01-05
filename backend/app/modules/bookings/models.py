"""
Booking Models - Entities cho hệ thống đặt lịch.
Bao gồm: Booking (phiếu đặt), BookingItem (chi tiết từng dịch vụ), BookingStatus.
"""
from datetime import datetime, timezone
from enum import Enum as PyEnum
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import DateTime, Text
from sqlmodel import Column, Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.customers.models import Customer
    from app.modules.resources.models import Resource
    from app.modules.services.models import Service
    from app.modules.staff.models import StaffProfile


class BookingStatus(str, PyEnum):
    """Trạng thái của booking."""
    PENDING = "PENDING"           # Chờ hệ thống tối ưu hóa
    CONFIRMED = "CONFIRMED"       # Đã xác nhận lịch hẹn
    IN_PROGRESS = "IN_PROGRESS"   # Đang phục vụ
    COMPLETED = "COMPLETED"       # Hoàn thành
    CANCELLED = "CANCELLED"       # Đã hủy
    NO_SHOW = "NO_SHOW"           # Khách không đến


class BookingSource(str, PyEnum):
    """Nguồn đặt lịch."""
    ONLINE = "ONLINE"             # Khách đặt qua app/web
    WALK_IN = "WALK_IN"           # Khách vãng lai
    PHONE = "PHONE"               # Đặt qua điện thoại
    RECEPTIONIST = "RECEPTIONIST" # Lễ tân đặt hộ


class Booking(SQLModel, table=True):
    """
    Phiếu đặt lịch của khách hàng.
    Một Booking có thể chứa nhiều BookingItem (combo dịch vụ).
    """
    __tablename__ = "bookings"

    id: UUID = Field(default_factory=uuid4, primary_key=True)

    # WHY: Cho phép null để hỗ trợ khách vãng lai chưa có tài khoản
    customer_id: UUID | None = Field(default=None, foreign_key="customers.id")

    # Thông tin khách vãng lai (khi customer_id is None)
    guest_name: str | None = Field(default=None, max_length=255)
    guest_phone: str | None = Field(default=None, max_length=50)

    status: BookingStatus = Field(default=BookingStatus.PENDING)
    source: BookingSource = Field(default=BookingSource.ONLINE)

    # Khung thời gian mong muốn (input cho optimizer)
    preferred_date: datetime = Field(sa_type=DateTime(timezone=True))
    preferred_time_start: datetime = Field(sa_type=DateTime(timezone=True))
    preferred_time_end: datetime = Field(sa_type=DateTime(timezone=True))

    # WHY: Soft constraint cho optimizer - ưu tiên nhân viên khách yêu cầu
    preferred_staff_id: UUID | None = Field(default=None, foreign_key="staff_profiles.user_id")

    # Ghi chú từ khách
    notes: str | None = Field(default=None, sa_column=Column(Text, nullable=True))

    # Kết quả optimization
    optimization_status: str | None = Field(default=None, max_length=50)
    optimization_message: str | None = Field(default=None, sa_column=Column(Text, nullable=True))
    optimized_at: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))

    # Thời gian thực tế sau optimization
    scheduled_start: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))
    scheduled_end: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))

    # Check-in/out timestamps
    checked_in_at: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))
    checked_out_at: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))

    # Audit fields
    created_by: UUID | None = Field(default=None)
    cancelled_by: UUID | None = Field(default=None)
    cancellation_reason: str | None = Field(default=None, sa_column=Column(Text, nullable=True))

    created_at: datetime = Field(
        sa_type=DateTime(timezone=True),
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        sa_type=DateTime(timezone=True),
        default_factory=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    customer: "Customer | None" = Relationship()
    preferred_staff: "StaffProfile | None" = Relationship()
    items: list["BookingItem"] = Relationship(
        back_populates="booking",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class BookingItem(SQLModel, table=True):
    """
    Chi tiết từng dịch vụ trong một Booking.
    Mỗi item được assign riêng Staff và Resource sau khi optimize.
    """
    __tablename__ = "booking_items"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    booking_id: UUID = Field(foreign_key="bookings.id")
    service_id: UUID = Field(foreign_key="services.id")

    # Kết quả từ optimizer
    assigned_staff_id: UUID | None = Field(default=None, foreign_key="staff_profiles.user_id")
    assigned_resource_id: UUID | None = Field(default=None, foreign_key="resources.id")

    # Thời gian dự kiến (từ optimizer)
    scheduled_start: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))
    scheduled_end: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))

    # Thời gian thực tế (cập nhật bởi technician)
    actual_start: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))
    actual_end: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))

    # Thứ tự thực hiện trong combo (1, 2, 3...)
    sequence_order: int = Field(default=1)

    # Ghi chú riêng cho item này
    notes: str | None = Field(default=None, sa_column=Column(Text, nullable=True))

    created_at: datetime = Field(
        sa_type=DateTime(timezone=True),
        default_factory=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    booking: Booking = Relationship(back_populates="items")
    service: "Service" = Relationship()
    assigned_staff: "StaffProfile | None" = Relationship()
    assigned_resource: "Resource | None" = Relationship()
