from datetime import time

import pytest
from pydantic import ValidationError

from app.modules.settings.schemas import ExceptionDateBase, OperatingHourBase


def test_operating_hour_validation():
    """
    Kịch bản:
    - 00:00 to 00:00 (is_closed=False) được hiểu là 24h.
    - close_time < open_time được hiểu là làm việc qua đêm.
    """
    # Test 24-hour representation
    data_24h = {
        "day_of_week": 0,
        "open_time": "00:00:00",
        "close_time": "00:00:00",
        "is_closed": False
    }
    obj = OperatingHourBase(**data_24h)
    assert obj.open_time == time(0, 0)
    assert obj.close_time == time(0, 0)

    # Test Overnight shift
    data_overnight = {
        "day_of_week": 1,
        "open_time": "22:00:00",
        "close_time": "02:00:00",
        "is_closed": False
    }
    obj = OperatingHourBase(**data_overnight)
    assert obj.close_time < obj.open_time

def test_exception_date_validation():
    """
    Kịch bản:
    - Nếu không đóng cửa, bắt buộc phải có giờ mở/đóng.
    - Nếu đóng cửa, không cần giờ mở/đóng.
    """
    # Valid: open with times
    valid_data = {
        "date": "2025-01-01",
        "reason": "New Year Special",
        "is_closed": False,
        "open_time": "10:00:00",
        "close_time": "16:00:00"
    }
    obj = ExceptionDateBase(**valid_data)
    assert obj.is_closed is False

    # Invalid: open but missing times
    invalid_data = {
        "date": "2025-01-01",
        "is_closed": False
    }
    with pytest.raises(ValidationError) as exc:
        ExceptionDateBase(**invalid_data)
    assert "Nếu không đóng cửa, phải cung cấp giờ mở và đóng cửa." in str(exc.value)

    # Valid: closed without times
    closed_data = {
        "date": "2025-12-25",
        "reason": "Christmas",
        "is_closed": True
    }
    obj = ExceptionDateBase(**closed_data)
    assert obj.is_closed is True
    assert obj.open_time is None
