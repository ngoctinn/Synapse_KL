"""
Scheduling Service - Business logic cho quản lý ca và lịch làm việc.
"""
from datetime import date, time
from typing import Sequence
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import and_, select

from app.modules.scheduling.exceptions import (
    ScheduleConflictException,
    ScheduleNotFoundException,
    ScheduleOverlapException,
    ShiftInUseException,
    ShiftNotFoundException,
    StaffInvalidException,
    StaffNotActiveException,
)
from app.modules.scheduling.models import ScheduleStatus, Shift, StaffSchedule
from app.modules.scheduling.schemas import (
    ShiftCreate,
    ShiftUpdate,
    StaffScheduleBatchCreate,
    StaffScheduleCreate,
)
from app.modules.staff.models import StaffProfile


def shifts_overlap(shift1_start: time, shift1_end: time, shift2_start: time, shift2_end: time) -> bool:
    """
    Kiểm tra 2 khoảng thời gian có chồng chéo không.
    Best practice: start1 < end2 AND start2 < end1
    """
    return shift1_start < shift2_end and shift2_start < shift1_end


# --- Validation Helpers ---

async def validate_staff_for_scheduling(session: AsyncSession, staff_id: UUID) -> StaffProfile:
    """
    Validate nhân viên tồn tại và đang active.
    WHY: Tránh assign lịch cho nhân viên không hợp lệ hoặc đã nghỉ việc.
    """
    result = await session.execute(
        select(StaffProfile)
        .options(selectinload(StaffProfile.profile))
        .where(StaffProfile.user_id == staff_id)
    )
    staff = result.scalars().first()

    if not staff:
        raise StaffInvalidException()

    if staff.profile and not staff.profile.is_active:
        raise StaffNotActiveException()

    return staff


async def validate_shift_exists(session: AsyncSession, shift_id: UUID) -> Shift:
    """Validate shift tồn tại."""
    shift = await get_shift_by_id(session, shift_id)
    if not shift:
        raise ShiftNotFoundException()
    return shift


async def check_schedule_overlap(
    session: AsyncSession,
    staff_id: UUID,
    work_date: date,
    new_shift: Shift,
    exclude_schedule_id: UUID | None = None
) -> None:
    """
    Kiểm tra ca mới có chồng chéo với các ca đã assign trong ngày không.
    WHY: Đảm bảo nhân viên không bị assign 2 ca chồng thời gian.
    """
    query = select(StaffSchedule).where(
        and_(
            StaffSchedule.staff_id == staff_id,
            StaffSchedule.work_date == work_date,
            StaffSchedule.status != ScheduleStatus.CANCELLED
        )
    ).options(selectinload(StaffSchedule.shift))

    if exclude_schedule_id:
        query = query.where(StaffSchedule.id != exclude_schedule_id)

    result = await session.execute(query)
    existing_schedules = result.scalars().all()

    for existing in existing_schedules:
        if existing.shift and shifts_overlap(
            new_shift.start_time, new_shift.end_time,
            existing.shift.start_time, existing.shift.end_time
        ):
            raise ScheduleOverlapException(existing.shift.name)


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
    """
    Tạo một phân công lịch làm việc.
    Validation: Staff tồn tại + active, Shift tồn tại, Không trùng ca, Không overlap thời gian.
    """
    # 1. Validate staff
    await validate_staff_for_scheduling(session, schedule_in.staff_id)

    # 2. Validate shift
    new_shift = await validate_shift_exists(session, schedule_in.shift_id)

    # 3. Check trùng lịch (cùng staff, cùng ngày, cùng shift)
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

    # 4. Check overlap thời gian với các ca khác trong ngày
    await check_schedule_overlap(
        session, schedule_in.staff_id, schedule_in.work_date, new_shift
    )

    schedule = StaffSchedule.model_validate(schedule_in)
    session.add(schedule)
    await session.commit()
    await session.refresh(schedule)
    return schedule


async def batch_create_schedules(
    session: AsyncSession, batch_in: StaffScheduleBatchCreate
) -> list[StaffSchedule]:
    """Tạo hàng loạt phân công lịch làm việc."""
    # WHY: Validate 1 lần cho toàn batch thay vì mỗi iteration
    await validate_staff_for_scheduling(session, batch_in.staff_id)
    new_shift = await validate_shift_exists(session, batch_in.shift_id)

    created_schedules = []
    for work_date in batch_in.work_dates:
        schedule_in = StaffScheduleCreate(
            staff_id=batch_in.staff_id,
            shift_id=batch_in.shift_id,
            work_date=work_date,
            status=batch_in.status
        )
        try:
            # WHY: Chỉ check conflict và overlap, không validate lại staff/shift
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
                continue

            await check_schedule_overlap(
                session, schedule_in.staff_id, work_date, new_shift
            )

            schedule = StaffSchedule.model_validate(schedule_in)
            session.add(schedule)
            await session.commit()
            await session.refresh(schedule)
            created_schedules.append(schedule)
        except (ScheduleConflictException, ScheduleOverlapException):
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
