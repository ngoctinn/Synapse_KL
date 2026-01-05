"""
Scheduling Schemas - DTOs cho Shifts và StaffSchedules.
"""
from datetime import date, time
from uuid import UUID

from pydantic import ConfigDict, model_validator
from sqlmodel import SQLModel
from typing_extensions import Self

from app.modules.scheduling.models import ScheduleStatus


class ShiftCreate(SQLModel):
    """Schema tạo mới ca làm việc."""
    name: str
    start_time: time
    end_time: time
    color_code: str | None = None

    @model_validator(mode="after")
    def validate_time_range(self) -> Self:
        """Giờ bắt đầu phải trước giờ kết thúc."""
        if self.start_time >= self.end_time:
            raise ValueError("Giờ bắt đầu phải trước giờ kết thúc")
        return self


class ShiftUpdate(SQLModel):
    """Schema cập nhật ca làm việc."""
    name: str | None = None
    start_time: time | None = None
    end_time: time | None = None
    color_code: str | None = None


class ShiftRead(SQLModel):
    """Schema trả về cho client."""
    id: UUID
    name: str
    start_time: time
    end_time: time
    color_code: str | None = None

    model_config = ConfigDict(from_attributes=True)


class StaffScheduleCreate(SQLModel):
    """Schema tạo phân công lịch làm việc."""
    staff_id: UUID
    shift_id: UUID
    work_date: date
    status: ScheduleStatus = ScheduleStatus.DRAFT


class StaffScheduleBatchCreate(SQLModel):
    """Schema tạo hàng loạt phân công lịch."""
    staff_id: UUID
    shift_id: UUID
    work_dates: list[date]
    status: ScheduleStatus = ScheduleStatus.DRAFT


class StaffScheduleBatchDelete(SQLModel):
    """Schema xóa hàng loạt phân công lịch."""
    schedule_ids: list[UUID]


class StaffScheduleUpdate(SQLModel):
    """Schema cập nhật lịch làm việc (chỉ đổi status hoặc shift)."""
    shift_id: UUID | None = None
    status: ScheduleStatus | None = None


class StaffScheduleRead(SQLModel):
    """Schema trả về cho client."""
    id: UUID
    staff_id: UUID
    shift_id: UUID
    work_date: date
    status: ScheduleStatus

    model_config = ConfigDict(from_attributes=True)


class StaffScheduleReadWithDetails(StaffScheduleRead):
    """Schema trả về kèm thông tin chi tiết Shift và Staff."""
    shift_name: str | None = None
    shift_color: str | None = None
    staff_name: str | None = None
