"""
Scheduling Exceptions - Custom exceptions cho module Scheduling.
"""
from fastapi import HTTPException, status


class ShiftNotFoundException(HTTPException):
    """Ngoại lệ khi không tìm thấy ca làm việc."""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy ca làm việc."
        )


class ShiftInUseException(HTTPException):
    """Ngoại lệ khi ca làm việc đang được sử dụng."""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể xóa ca đang được sử dụng trong lịch làm việc."
        )


class ScheduleConflictException(HTTPException):
    """Ngoại lệ khi trùng lịch làm việc (cùng shift, cùng ngày)."""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nhân viên đã được phân công ca này vào ngày này."
        )


class ScheduleNotFoundException(HTTPException):
    """Ngoại lệ khi không tìm thấy lịch làm việc."""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lịch làm việc."
        )


class ScheduleOverlapException(HTTPException):
    """Ngoại lệ khi ca làm việc mới chồng chéo thời gian với ca đã có."""
    def __init__(self, existing_shift_name: str = None):
        detail = "Ca làm việc bị chồng chéo thời gian với ca đã được phân công."
        if existing_shift_name:
            detail = f"Ca làm việc bị chồng chéo với ca '{existing_shift_name}' đã được phân công."
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )


class StaffNotActiveException(HTTPException):
    """Ngoại lệ khi nhân viên đã bị vô hiệu hóa."""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nhân viên đã bị vô hiệu hóa, không thể phân công lịch."
        )


class StaffInvalidException(HTTPException):
    """Ngoại lệ khi nhân viên không tồn tại."""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nhân viên không tồn tại trong hệ thống."
        )
