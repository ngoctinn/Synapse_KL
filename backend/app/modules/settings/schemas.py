from pydantic import BaseModel, ConfigDict, model_validator
from datetime import time, date
from typing import List, Self

class OperatingHourBase(BaseModel):
    day_of_week: int
    open_time: time
    close_time: time
    is_closed: bool

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="after")
    def validate_hours(self) -> Self:
        """
        Logic nghiệp vụ:
        1. Nếu is_closed=False và open_time == close_time (ví dụ: 00:00 - 00:00) -> 24h.
        2. Nếu close_time < open_time -> Ca làm việc qua đêm (overnight).
        """
        return self

class ExceptionDateBase(BaseModel):
    date: date
    reason: str | None = None
    is_closed: bool = False
    open_time: time | None = None
    close_time: time | None = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="after")
    def validate_exception_times(self) -> Self:
        if not self.is_closed:
            if self.open_time is None or self.close_time is None:
                raise ValueError("Nếu không đóng cửa, phải cung cấp giờ mở và đóng cửa.")
        return self

class OperationalSettingsUpdate(BaseModel):
    regular_operating_hours: list[OperatingHourBase]
    exception_dates: list[ExceptionDateBase]

class OperationalSettingsRead(OperationalSettingsUpdate):
    model_config = ConfigDict(from_attributes=True)
