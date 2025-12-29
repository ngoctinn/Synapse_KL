from datetime import date, time
from uuid import UUID
from typing import Optional, List
from sqlmodel import Field, Relationship
from app.modules.base_models import BaseUUIDModel

class RegularOperatingHour(BaseUUIDModel, table=True):
    """
    Model quản lý giờ làm việc định kỳ hàng tuần.
    """
    __tablename__ = "regular_operating_hours"

    day_of_week: int = Field(..., description="Thứ trong tuần (0=Chủ Nhật, 6=Thứ Bảy)")
    period_number: int = Field(default=1, description="Số thứ tự khung giờ trong ngày")
    open_time: time = Field(..., description="Giờ mở cửa")
    close_time: time = Field(..., description="Giờ đóng cửa")
    is_closed: bool = Field(default=False, description="Đánh dấu ngày nghỉ định kỳ")

class ExceptionDate(BaseUUIDModel, table=True):
    """
    Model quản lý các ngày ngoại lệ (nghỉ lễ, sửa chữa, thay đổi giờ đột xuất).
    """
    __tablename__ = "exception_dates"

    exception_date: date = Field(..., description="Ngày ngoại lệ", index=True)
    is_closed: bool = Field(default=True, description="Đóng cửa cả ngày")
    open_time: Optional[time] = Field(default=None, description="Giờ mở cửa (nếu không đóng cả ngày)")
    close_time: Optional[time] = Field(default=None, description="Giờ đóng cửa (nếu không đóng cả ngày)")
    reason: Optional[str] = Field(default=None, description="Lý do ngoại lệ")
