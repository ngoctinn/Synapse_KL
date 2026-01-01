"""
Staff Exceptions - Custom exceptions cho module Staff.
"""
from fastapi import HTTPException, status


class StaffNotFoundException(HTTPException):
    """Ngoại lệ khi không tìm thấy nhân viên."""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy nhân viên."
        )


class StaffAlreadyExistsException(HTTPException):
    """Ngoại lệ khi nhân viên đã tồn tại."""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nhân viên đã tồn tại."
        )
