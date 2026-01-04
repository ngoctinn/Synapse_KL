from datetime import date, time
from typing import Self

from pydantic import BaseModel, ConfigDict, model_validator


class OperatingHourBase(BaseModel):
    day_of_week: int
    open_time: time
    close_time: time
    is_closed: bool
    label: str | None = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="after")
    def validate_hours(self) -> Self:
        # WHY: Logic xử lý qua đêm (close < open) và 24h được xử lý tại Service/Solver logic
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

    @model_validator(mode="after")
    def validate_overlaps(self) -> Self:
        self._validate_slot_list(self.regular_operating_hours, key_extractor=lambda x: x.day_of_week)
        self._validate_slot_list(self.exception_dates, key_extractor=lambda x: x.date)
        return self

    def _validate_slot_list(self, items: list, key_extractor):
        from itertools import groupby

        # WHY: Sort để thuật toán kiểm tra chồng lấn hoạt động chính xác
        sorted_items = sorted(items, key=lambda x: (key_extractor(x), x.open_time))

        for key, group in groupby(sorted_items, key=key_extractor):
            slots = list(group)
            if len(slots) <= 1:
                continue

            for i in range(len(slots) - 1):
                current = slots[i]
                next_slot = slots[i+1]

                if current.is_closed or next_slot.is_closed:
                    continue

                # WHY: Ca đêm (bắt đầu ngày N, kết thúc ngày N+1) phải nằm cuối cùng trong ngày N
                if current.close_time < current.open_time:
                    raise ValueError(f"Overnight slot ({current.open_time} - {current.close_time}) must be the last slot of the day.")

                # WHY: Đảm bảo không có xung đột thời gian giữa các ca
                if current.close_time > next_slot.open_time:
                    raise ValueError(
                        f"Time overlap detected for {key}: "
                        f"Slot [{current.open_time}-{current.close_time}] overlaps with [{next_slot.open_time}-{next_slot.close_time}]"
                    )


class OperationalSettingsRead(OperationalSettingsUpdate):
    model_config = ConfigDict(from_attributes=True)
