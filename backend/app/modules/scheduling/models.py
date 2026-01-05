"""
Scheduling Models - Ca làm việc và Phân công lịch làm việc.
"""
from datetime import date, datetime, time, timezone
from enum import Enum as PyEnum
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import Column, Date, DateTime, Time, Enum as SaEnum
from sqlmodel import Field, Relationship, SQLModel

from app.modules.staff.models import StaffProfile

class ScheduleStatus(str, PyEnum):
    """Trạng thái lịch làm việc."""
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    CANCELLED = "CANCELLED"


class Shift(SQLModel, table=True):
    """
    Định nghĩa ca làm việc (VD: Ca Sáng 08:00-12:00, Ca Chiều 13:00-17:00).
    """
    __tablename__ = "shifts"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(max_length=100)
    start_time: time = Field(sa_column=Column(Time, nullable=False))
    end_time: time = Field(sa_column=Column(Time, nullable=False))
    color_code: str | None = Field(max_length=7, default=None)
    created_at: datetime = Field(
        sa_type=DateTime(timezone=True),
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        sa_type=DateTime(timezone=True),
        default_factory=lambda: datetime.now(timezone.utc)
    )

    # Relationship 1-N với StaffSchedule - Dùng string vì StaffSchedule định nghĩa bên dưới
    schedules: list["StaffSchedule"] = Relationship(back_populates="shift")


class StaffSchedule(SQLModel, table=True):
    """
    Phân công lịch làm việc cụ thể cho nhân viên theo ngày.
    """
    __tablename__ = "staff_schedules"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    staff_id: UUID = Field(foreign_key="staff_profiles.user_id")
    shift_id: UUID = Field(foreign_key="shifts.id")
    work_date: date = Field(sa_column=Column(Date, nullable=False))
    status: ScheduleStatus = Field(
        sa_column=Column(SaEnum(ScheduleStatus, name="schedule_status"), nullable=False, server_default="DRAFT")
    )
    created_at: datetime = Field(
        sa_type=DateTime(timezone=True),
        default_factory=lambda: datetime.now(timezone.utc)
    )

    # Relationships - Direct refs vì StaffProfile và Shift đã defined/imported
    staff: StaffProfile | None = Relationship(back_populates="schedules")
    shift: Shift | None = Relationship(back_populates="schedules")
