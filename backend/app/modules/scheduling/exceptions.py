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
    """Ngoại lệ khi trùng lịch làm việc."""
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
