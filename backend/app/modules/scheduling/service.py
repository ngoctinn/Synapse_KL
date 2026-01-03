"""
Scheduling Service - Business logic cho quản lý ca và lịch làm việc.
"""
from datetime import date
from typing import Sequence
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import and_, select

from app.modules.scheduling.exceptions import (
    ScheduleConflictException,
    ScheduleNotFoundException,
    ShiftInUseException,
    ShiftNotFoundException,
)
from app.modules.scheduling.models import ScheduleStatus, Shift, StaffSchedule
from app.modules.scheduling.schemas import (
    ShiftCreate,
    ShiftUpdate,
    StaffScheduleBatchCreate,
    StaffScheduleCreate,
)
from app.modules.staff.models import StaffProfile

# --- Shift Service ---

async def get_all_shifts(session: AsyncSession) -> Sequence[Shift]:
    """Lấy danh sách tất cả ca làm việc."""
    result = await session.execute(select(Shift).order_by(Shift.start_time))
    return result.scalars().all()


async def get_shift_by_id(session: AsyncSession, shift_id: UUID) -> Shift | None:
    """Lấy thông tin một ca làm việc."""
    result = await session.execute(select(Shift).where(Shift.id == shift_id))
    return result.scalars().first()


async def create_shift(session: AsyncSession, shift_in: ShiftCreate) -> Shift:
    """Tạo ca làm việc mới."""
    shift = Shift.model_validate(shift_in)
    session.add(shift)
    await session.commit()
    await session.refresh(shift)
    return shift


async def update_shift(
    session: AsyncSession, shift_id: UUID, shift_in: ShiftUpdate
) -> Shift:
    """Cập nhật ca làm việc."""
    shift = await get_shift_by_id(session, shift_id)
    if not shift:
        raise ShiftNotFoundException()

    update_data = shift_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(shift, key, value)

    session.add(shift)
    await session.commit()
    await session.refresh(shift)
    return shift


async def delete_shift(session: AsyncSession, shift_id: UUID) -> bool:
    """Xóa ca làm việc. Không cho phép nếu đang có lịch sử dụng."""
    # Kiểm tra xem có schedule nào đang dùng shift này không
    result = await session.execute(
        select(StaffSchedule).where(StaffSchedule.shift_id == shift_id).limit(1)
    )
    if result.scalars().first():
        raise ShiftInUseException()

    shift = await get_shift_by_id(session, shift_id)
    if not shift:
        raise ShiftNotFoundException()

    await session.delete(shift)
    await session.commit()
    return True


# --- StaffSchedule Service ---

async def get_schedules_by_date_range(
    session: AsyncSession,
    start_date: date,
    end_date: date,
    staff_id: UUID | None = None
) -> Sequence[StaffSchedule]:
    """Lấy lịch làm việc trong khoảng thời gian."""
    query = select(StaffSchedule).where(
        and_(
            StaffSchedule.work_date >= start_date,
            StaffSchedule.work_date <= end_date
        )
    ).options(
        selectinload(StaffSchedule.shift),
        selectinload(StaffSchedule.staff).selectinload(StaffProfile.profile)
    )

    if staff_id:
        query = query.where(StaffSchedule.staff_id == staff_id)

    result = await session.execute(query.order_by(StaffSchedule.work_date))
    return result.scalars().all()


async def create_schedule(
    session: AsyncSession, schedule_in: StaffScheduleCreate
) -> StaffSchedule:
    """Tạo một phân công lịch làm việc."""
    # Kiểm tra trùng lịch
    existing = await session.execute(
        select(StaffSchedule).where(
            and_(
                StaffSchedule.staff_id == schedule_in.staff_id,
                StaffSchedule.work_date == schedule_in.work_date,
                StaffSchedule.shift_id == schedule_in.shift_id
            )
        )
    )
    if existing.scalars().first():
        raise ScheduleConflictException()

    schedule = StaffSchedule.model_validate(schedule_in)
    session.add(schedule)
    await session.commit()
    await session.refresh(schedule)
    return schedule


async def batch_create_schedules(
    session: AsyncSession, batch_in: StaffScheduleBatchCreate
) -> list[StaffSchedule]:
    """Tạo hàng loạt phân công lịch làm việc."""
    created_schedules = []
    for work_date in batch_in.work_dates:
        schedule_in = StaffScheduleCreate(
            staff_id=batch_in.staff_id,
            shift_id=batch_in.shift_id,
            work_date=work_date,
            status=batch_in.status
        )
        try:
            schedule = await create_schedule(session, schedule_in)
            created_schedules.append(schedule)
        except ScheduleConflictException:
            # Bỏ qua lịch trùng, tiếp tục với các ngày khác
            continue

    return created_schedules


async def update_schedule_status(
    session: AsyncSession, schedule_id: UUID, new_status: ScheduleStatus
) -> StaffSchedule:
    """Cập nhật trạng thái lịch làm việc."""
    result = await session.execute(
        select(StaffSchedule).where(StaffSchedule.id == schedule_id)
    )
    schedule = result.scalars().first()
    if not schedule:
        raise ScheduleNotFoundException()

    schedule.status = new_status
    session.add(schedule)
    await session.commit()
    await session.refresh(schedule)
    return schedule


async def delete_schedule(session: AsyncSession, schedule_id: UUID) -> bool:
    """Xóa một phân công lịch làm việc."""
    result = await session.execute(
        select(StaffSchedule).where(StaffSchedule.id == schedule_id)
    )
    schedule = result.scalars().first()
    if not schedule:
        raise ScheduleNotFoundException()

    await session.delete(schedule)
    await session.commit()
    return True
