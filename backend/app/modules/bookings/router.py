"""
Booking Router - API Endpoints cho module bookings.
"""
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.modules.bookings import service
from app.modules.bookings.exceptions import BookingNotFoundException
from app.modules.bookings.models import BookingStatus
from app.modules.bookings.schemas import (
    BookingCreate,
    BookingRead,
    BookingReadWithItems,
    BookingStatusUpdate,
    BookingUpdate,
    OptimizationRequest,
    OptimizationResult,
    SuggestSlotsRequest,
    SuggestSlotsResponse,
)

router = APIRouter(prefix="/bookings", tags=["Bookings"])


# === Booking CRUD Endpoints ===

@router.get("", response_model=list[BookingRead])
async def list_bookings(
    start_date: datetime = Query(..., description="Ngày bắt đầu"),
    end_date: datetime = Query(..., description="Ngày kết thúc"),
    customer_id: UUID | None = Query(None, description="Lọc theo khách hàng"),
    status: BookingStatus | None = Query(None, description="Lọc theo trạng thái"),
    session: AsyncSession = Depends(get_db),
):
    """Lấy danh sách bookings trong khoảng thời gian."""
    return await service.get_bookings_by_date_range(
        session, start_date, end_date, customer_id, status
    )


@router.get("/{booking_id}", response_model=BookingReadWithItems)
async def get_booking(
    booking_id: UUID,
    session: AsyncSession = Depends(get_db),
):
    """Lấy chi tiết booking với danh sách items."""
    booking = await service.get_booking_by_id(session, booking_id)
    if not booking:
        raise BookingNotFoundException()

    # WHY: Build response với thông tin bổ sung
    response = BookingReadWithItems.model_validate(booking)

    # Thông tin khách hàng
    if booking.customer:
        response.customer_name = booking.customer.full_name
        response.customer_phone = booking.customer.phone_number
    elif booking.guest_name:
        response.customer_name = booking.guest_name
        response.customer_phone = booking.guest_phone

    # Thông tin staff ưu tiên
    if booking.preferred_staff and booking.preferred_staff.profile:
        response.preferred_staff_name = booking.preferred_staff.profile.full_name

    # Thông tin chi tiết items
    for i, item in enumerate(booking.items):
        if i < len(response.items):
            if item.service:
                response.items[i].service_name = item.service.name
                response.items[i].service_duration = item.service.duration
            if item.assigned_staff and item.assigned_staff.profile:
                response.items[i].assigned_staff_name = item.assigned_staff.profile.full_name
            if item.assigned_resource:
                response.items[i].assigned_resource_name = item.assigned_resource.name

    return response


@router.post("", response_model=BookingRead, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_in: BookingCreate,
    session: AsyncSession = Depends(get_db),
):
    """
    Tạo booking mới.
    Booking sẽ có status PENDING và tự động được enqueue cho optimization.
    """
    booking = await service.create_booking(session, booking_in)

    # WHY: Enqueue optimization job vào ARQ background worker
    try:
        from app.worker import enqueue_optimization_job
        await enqueue_optimization_job(booking.id)
    except Exception as e:
        # WHY: Không block response nếu Redis không available
        # Job có thể được retry thủ công qua /optimize endpoint
        print(f"Warning: Failed to enqueue optimization job: {e}")

    return booking


@router.patch("/{booking_id}", response_model=BookingRead)
async def update_booking(
    booking_id: UUID,
    booking_in: BookingUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Cập nhật thông tin booking."""
    return await service.update_booking(session, booking_id, booking_in)


@router.patch("/{booking_id}/status", response_model=BookingRead)
async def update_booking_status(
    booking_id: UUID,
    status_update: BookingStatusUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Cập nhật trạng thái booking (check-in, complete, cancel...)."""
    return await service.update_booking_status(session, booking_id, status_update)


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_booking(
    booking_id: UUID,
    session: AsyncSession = Depends(get_db),
):
    """Hủy booking."""
    await service.delete_booking(session, booking_id)
    return None


# === Optimization Endpoints ===

@router.post("/optimize", response_model=OptimizationResult)
async def trigger_optimization(
    request: OptimizationRequest,
    session: AsyncSession = Depends(get_db),
):
    """
    Trigger optimization cho một booking.
    Thường được gọi tự động sau khi tạo booking, hoặc manual retry.
    """
    booking = await service.get_booking_by_id(session, request.booking_id)
    if not booking:
        raise BookingNotFoundException()

    # WHY: Enqueue job vào ARQ worker
    try:
        from app.worker import enqueue_optimization_job
        job = await enqueue_optimization_job(booking.id)

        return OptimizationResult(
            success=True,
            status="ENQUEUED",
            message=f"Job đã được enqueue. Job ID: {job.job_id if job else 'N/A'}",
        )
    except Exception as e:
        return OptimizationResult(
            success=False,
            status="ENQUEUE_FAILED",
            message=f"Không thể enqueue job: {str(e)}",
        )


@router.post("/suggest-slots", response_model=SuggestSlotsResponse)
async def suggest_available_slots(
    request: SuggestSlotsRequest,
    session: AsyncSession = Depends(get_db),
):
    """
    Gợi ý các slot thời gian khả dụng cho một nhóm dịch vụ.
    Đây là pre-optimization để hiển thị cho khách chọn trước khi đặt.
    """
    # TODO: Implement slot suggestion logic
    # 1. Query staff availability từ StaffSchedule
    # 2. Query resource availability từ existing bookings
    # 3. Filter theo skill matching

    return SuggestSlotsResponse(
        slots=[],
        total_duration=0,
    )
