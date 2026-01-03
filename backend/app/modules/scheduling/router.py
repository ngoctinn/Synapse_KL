"""
Scheduling Router - API Endpoints cho quản lý ca và lịch làm việc.
"""
from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.modules.scheduling import service
from app.modules.scheduling.models import ScheduleStatus
from app.modules.scheduling.schemas import (
    ShiftCreate,
    ShiftRead,
    ShiftUpdate,
    StaffScheduleBatchCreate,
    StaffScheduleCreate,
    StaffScheduleRead,
    StaffScheduleReadWithDetails,
)

router = APIRouter(prefix="/scheduling", tags=["Scheduling"])


# --- Shift Endpoints ---

@router.get("/shifts", response_model=list[ShiftRead])
async def list_shifts(
    session: AsyncSession = Depends(get_db),
):
    """Lấy danh sách tất cả ca làm việc."""
    return await service.get_all_shifts(session)


@router.get("/shifts/{shift_id}", response_model=ShiftRead)
async def get_shift(
    shift_id: UUID,
    session: AsyncSession = Depends(get_db),
):
    """Lấy thông tin một ca làm việc."""
    shift = await service.get_shift_by_id(session, shift_id)
    if not shift:
        from app.modules.scheduling.exceptions import ShiftNotFoundException
        raise ShiftNotFoundException()
    return shift


@router.post("/shifts", response_model=ShiftRead, status_code=status.HTTP_201_CREATED)
async def create_shift(
    shift_in: ShiftCreate,
    session: AsyncSession = Depends(get_db),
):
    """Tạo ca làm việc mới."""
    return await service.create_shift(session, shift_in)


@router.put("/shifts/{shift_id}", response_model=ShiftRead)
async def update_shift(
    shift_id: UUID,
    shift_in: ShiftUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Cập nhật ca làm việc."""
    shift = await service.update_shift(session, shift_id, shift_in)
    return shift


@router.delete("/shifts/{shift_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_shift(
    shift_id: UUID,
    session: AsyncSession = Depends(get_db),
):
    """Xóa ca làm việc."""
    await service.delete_shift(session, shift_id)
    return None


# --- Schedule Endpoints ---

@router.get("/schedules", response_model=list[StaffScheduleReadWithDetails])
async def list_schedules(
    start_date: date = Query(..., description="Ngày bắt đầu"),
    end_date: date = Query(..., description="Ngày kết thúc"),
    staff_id: UUID | None = Query(None, description="Lọc theo nhân viên"),
    session: AsyncSession = Depends(get_db),
):
    """Lấy lịch làm việc trong khoảng thời gian."""
    schedules = await service.get_schedules_by_date_range(
        session, start_date, end_date, staff_id
    )
    result = []
    for sch in schedules:
        item = StaffScheduleReadWithDetails.model_validate(sch)
        item.shift_name = sch.shift.name if sch.shift else None
        item.shift_color = sch.shift.color_code if sch.shift else None
        item.staff_name = (
            sch.staff.profile.full_name
            if sch.staff and sch.staff.profile
            else None
        )
        result.append(item)
    return result


@router.post("/schedules", response_model=StaffScheduleRead, status_code=status.HTTP_201_CREATED)
async def create_schedule(
    schedule_in: StaffScheduleCreate,
    session: AsyncSession = Depends(get_db),
):
    """Tạo một phân công lịch làm việc."""
    return await service.create_schedule(session, schedule_in)


@router.post("/schedules/batch", response_model=list[StaffScheduleRead], status_code=status.HTTP_201_CREATED)
async def batch_create_schedules(
    batch_in: StaffScheduleBatchCreate,
    session: AsyncSession = Depends(get_db),
):
    """Tạo hàng loạt phân công lịch làm việc."""
    return await service.batch_create_schedules(session, batch_in)


@router.patch("/schedules/{schedule_id}/status", response_model=StaffScheduleRead)
async def update_schedule_status(
    schedule_id: UUID,
    new_status: ScheduleStatus = Query(..., description="Trạng thái mới"),
    session: AsyncSession = Depends(get_db),
):
    """Cập nhật trạng thái lịch làm việc."""
    schedule = await service.update_schedule_status(session, schedule_id, new_status)
    return schedule


@router.delete("/schedules/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_schedule(
    schedule_id: UUID,
    session: AsyncSession = Depends(get_db),
):
    """Xóa một phân công lịch làm việc."""
    await service.delete_schedule(session, schedule_id)
    return None
