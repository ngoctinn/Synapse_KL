"""
Booking Exceptions - Custom exceptions cho module bookings.
"""
from fastapi import HTTPException, status


class BookingNotFoundException(HTTPException):
    """Booking không tồn tại."""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lịch hẹn."
        )


class BookingItemNotFoundException(HTTPException):
    """BookingItem không tồn tại."""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chi tiết dịch vụ trong lịch hẹn."
        )


class BookingAlreadyCancelledException(HTTPException):
    """Booking đã bị hủy trước đó."""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lịch hẹn này đã được hủy trước đó."
        )


class BookingCannotBeCancelledException(HTTPException):
    """Booking không thể hủy (đang/đã hoàn thành)."""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể hủy lịch hẹn đang thực hiện hoặc đã hoàn thành."
        )


class BookingOptimizationFailedException(HTTPException):
    """Không thể tối ưu hóa lịch hẹn."""
    def __init__(self, reason: str = "Không tìm được phương án phân bổ phù hợp."):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Tối ưu hóa thất bại: {reason}"
        )


class NoAvailableStaffException(HTTPException):
    """Không có nhân viên phù hợp."""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Không có nhân viên nào có kỹ năng phù hợp và khả dụng trong khung giờ này."
        )


class NoAvailableResourceException(HTTPException):
    """Không có tài nguyên khả dụng."""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Không có tài nguyên (giường/phòng) khả dụng trong khung giờ này."
        )


class InvalidTimeWindowException(HTTPException):
    """Khung giờ không hợp lệ."""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Khung giờ mong muốn không hợp lệ hoặc nằm ngoài giờ hoạt động."
        )


class ServiceNotFoundException(HTTPException):
    """Dịch vụ không tồn tại."""
    def __init__(self, service_id: str | None = None):
        detail = "Dịch vụ không tồn tại."
        if service_id:
            detail = f"Dịch vụ với ID {service_id} không tồn tại."
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail
        )


class CustomerNotFoundException(HTTPException):
    """Khách hàng không tồn tại."""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy thông tin khách hàng."
        )
