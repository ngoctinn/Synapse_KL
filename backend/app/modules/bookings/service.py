"""
Booking Service - Business logic CRUD cho bookings.
"""
from datetime import datetime
from typing import Sequence
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import and_, select

from app.modules.bookings.exceptions import (
    BookingAlreadyCancelledException,
    BookingCannotBeCancelledException,
    BookingNotFoundException,
    CustomerNotFoundException,
    ServiceNotFoundException,
)
from app.modules.bookings.models import Booking, BookingItem, BookingStatus
from app.modules.bookings.schemas import (
    BookingCreate,
    BookingStatusUpdate,
    BookingUpdate,
)
from app.modules.customers.models import Customer
from app.modules.services.models import Service


# === Validation Helpers ===

async def validate_customer_exists(session: AsyncSession, customer_id: UUID) -> Customer:
    """Kiểm tra customer tồn tại."""
    result = await session.execute(
        select(Customer).where(Customer.id == customer_id)
    )
    customer = result.scalars().first()
    if not customer:
        raise CustomerNotFoundException()
    return customer


async def validate_services_exist(
    session: AsyncSession, service_ids: list[UUID]
) -> list[Service]:
    """Kiểm tra tất cả services tồn tại và active."""
    result = await session.execute(
        select(Service).where(
            and_(
                Service.id.in_(service_ids),
                Service.is_active == True,
                Service.deleted_at.is_(None)
            )
        )
    )
    services = result.scalars().all()

    found_ids = {s.id for s in services}
    for sid in service_ids:
        if sid not in found_ids:
            raise ServiceNotFoundException(str(sid))

    return list(services)


# === CRUD Operations ===

async def get_booking_by_id(
    session: AsyncSession, booking_id: UUID
) -> Booking | None:
    """Lấy booking theo ID với items đầy đủ."""
    result = await session.execute(
        select(Booking)
        .options(
            selectinload(Booking.items).selectinload(BookingItem.service),
            selectinload(Booking.items).selectinload(BookingItem.assigned_staff),
            selectinload(Booking.items).selectinload(BookingItem.assigned_resource),
            selectinload(Booking.customer),
            selectinload(Booking.preferred_staff),
        )
        .where(Booking.id == booking_id)
    )
    return result.scalars().first()


async def get_bookings_by_date_range(
    session: AsyncSession,
    start_date: datetime,
    end_date: datetime,
    customer_id: UUID | None = None,
    status: BookingStatus | None = None,
) -> Sequence[Booking]:
    """Lấy danh sách bookings trong khoảng thời gian."""
    query = select(Booking).where(
        and_(
            Booking.preferred_date >= start_date,
            Booking.preferred_date <= end_date,
        )
    ).options(
        selectinload(Booking.items).selectinload(BookingItem.service),
        selectinload(Booking.customer),
    )

    if customer_id:
        query = query.where(Booking.customer_id == customer_id)

    if status:
        query = query.where(Booking.status == status)

    query = query.order_by(Booking.preferred_date, Booking.preferred_time_start)

    result = await session.execute(query)
    return result.scalars().all()


async def create_booking(
    session: AsyncSession,
    booking_in: BookingCreate,
    created_by: UUID | None = None,
) -> Booking:
    """
    Tạo booking mới với status PENDING.
    Sau khi tạo, sẽ enqueue task optimization.
    """
    # Validate customer nếu có
    if booking_in.customer_id:
        await validate_customer_exists(session, booking_in.customer_id)

    # Validate services
    service_ids = [item.service_id for item in booking_in.items]
    await validate_services_exist(session, service_ids)

    # Tạo Booking
    booking = Booking(
        customer_id=booking_in.customer_id,
        guest_name=booking_in.guest_name,
        guest_phone=booking_in.guest_phone,
        preferred_date=booking_in.preferred_date,
        preferred_time_start=booking_in.preferred_time_start,
        preferred_time_end=booking_in.preferred_time_end,
        preferred_staff_id=booking_in.preferred_staff_id,
        source=booking_in.source,
        notes=booking_in.notes,
        status=BookingStatus.PENDING,
        created_by=created_by,
    )
    session.add(booking)
    await session.flush()  # WHY: Cần ID cho items

    # Tạo BookingItems
    for idx, item_in in enumerate(booking_in.items, start=1):
        item = BookingItem(
            booking_id=booking.id,
            service_id=item_in.service_id,
            sequence_order=item_in.sequence_order or idx,
            notes=item_in.notes,
        )
        session.add(item)

    await session.commit()
    await session.refresh(booking)

    return booking


async def update_booking(
    session: AsyncSession,
    booking_id: UUID,
    booking_in: BookingUpdate,
) -> Booking:
    """Cập nhật thông tin booking (chưa được confirm)."""
    booking = await get_booking_by_id(session, booking_id)
    if not booking:
        raise BookingNotFoundException()

    # WHY: Chỉ cho phép update khi chưa confirm
    if booking.status not in [BookingStatus.PENDING, BookingStatus.CONFIRMED]:
        raise BookingCannotBeCancelledException()

    update_data = booking_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(booking, key, value)

    booking.updated_at = datetime.now()
    session.add(booking)
    await session.commit()
    await session.refresh(booking)

    return booking


async def update_booking_status(
    session: AsyncSession,
    booking_id: UUID,
    status_update: BookingStatusUpdate,
    updated_by: UUID | None = None,
) -> Booking:
    """Cập nhật trạng thái booking."""
    booking = await get_booking_by_id(session, booking_id)
    if not booking:
        raise BookingNotFoundException()

    # Validation theo trạng thái
    if status_update.status == BookingStatus.CANCELLED:
        if booking.status == BookingStatus.CANCELLED:
            raise BookingAlreadyCancelledException()
        if booking.status in [BookingStatus.IN_PROGRESS, BookingStatus.COMPLETED]:
            raise BookingCannotBeCancelledException()
        booking.cancelled_by = updated_by
        booking.cancellation_reason = status_update.cancellation_reason

    # Check-in/out timestamps
    if status_update.status == BookingStatus.IN_PROGRESS:
        booking.checked_in_at = datetime.now()
    elif status_update.status == BookingStatus.COMPLETED:
        booking.checked_out_at = datetime.now()

    booking.status = status_update.status
    booking.updated_at = datetime.now()

    session.add(booking)
    await session.commit()
    await session.refresh(booking)

    return booking


async def delete_booking(session: AsyncSession, booking_id: UUID) -> bool:
    """Xóa booking (soft delete thông qua cancel status)."""
    booking = await get_booking_by_id(session, booking_id)
    if not booking:
        raise BookingNotFoundException()

    if booking.status in [BookingStatus.IN_PROGRESS, BookingStatus.COMPLETED]:
        raise BookingCannotBeCancelledException()

    booking.status = BookingStatus.CANCELLED
    booking.updated_at = datetime.now()

    session.add(booking)
    await session.commit()

    return True


# === Optimization Helpers ===

async def update_booking_optimization_result(
    session: AsyncSession,
    booking_id: UUID,
    status: str,
    message: str | None,
    items_assignment: list[dict],
) -> Booking:
    """
    Cập nhật kết quả optimization cho booking.
    Được gọi từ background worker sau khi OR-Tools solver hoàn thành.
    """
    booking = await get_booking_by_id(session, booking_id)
    if not booking:
        raise BookingNotFoundException()

    booking.optimization_status = status
    booking.optimization_message = message
    booking.optimized_at = datetime.now()

    # WHY: Nếu optimization thành công, update status sang CONFIRMED
    if status == "OPTIMAL" or status == "FEASIBLE":
        booking.status = BookingStatus.CONFIRMED

        # Update scheduled times từ items
        if items_assignment:
            starts = [a["scheduled_start"] for a in items_assignment if a.get("scheduled_start")]
            ends = [a["scheduled_end"] for a in items_assignment if a.get("scheduled_end")]
            if starts:
                booking.scheduled_start = min(starts)
            if ends:
                booking.scheduled_end = max(ends)

    # Update từng item
    for assignment in items_assignment:
        item_id = assignment.get("item_id")
        if not item_id:
            continue

        # Tìm item trong booking
        for item in booking.items:
            if str(item.id) == str(item_id):
                item.assigned_staff_id = assignment.get("staff_id")
                item.assigned_resource_id = assignment.get("resource_id")
                item.scheduled_start = assignment.get("scheduled_start")
                item.scheduled_end = assignment.get("scheduled_end")
                session.add(item)
                break

    session.add(booking)
    await session.commit()
    await session.refresh(booking)

    return booking
