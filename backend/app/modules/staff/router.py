"""
Staff Router - API Endpoints cho quản lý nhân viên.
"""
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.modules.staff import service
from app.modules.staff.schemas import (
    StaffProfileCreate,
    StaffProfileRead,
    StaffProfileReadWithSkills,
    StaffProfileUpdate,
    StaffSkillsUpdate,
)

router = APIRouter(prefix="/staff", tags=["Staff"])


@router.get("/", response_model=list[StaffProfileReadWithSkills])
async def list_staff(
    session: AsyncSession = Depends(get_db),
):
    """Lấy danh sách tất cả nhân viên."""
    staff_list = await service.get_all_staff(session)
    result = []
    for staff in staff_list:
        staff_data = StaffProfileReadWithSkills.model_validate(staff)
        staff_data.skill_ids = [skill.id for skill in staff.skills]
        result.append(staff_data)
    return result


@router.get("/{user_id}", response_model=StaffProfileReadWithSkills)
async def get_staff(
    user_id: UUID,
    session: AsyncSession = Depends(get_db),
):
    """Lấy thông tin chi tiết một nhân viên."""
    staff = await service.get_staff_by_id(session, user_id)
    if not staff:
        from app.modules.staff.exceptions import StaffNotFoundException
        raise StaffNotFoundException()
    result = StaffProfileReadWithSkills.model_validate(staff)
    result.skill_ids = [skill.id for skill in staff.skills]
    return result


@router.post("/", response_model=StaffProfileRead, status_code=status.HTTP_201_CREATED)
async def create_staff(
    staff_in: StaffProfileCreate,
    session: AsyncSession = Depends(get_db),
):
    """Tạo hồ sơ nhân viên mới."""
    staff = await service.create_staff_profile(session, staff_in)
    return staff


@router.put("/{user_id}", response_model=StaffProfileRead)
async def update_staff(
    user_id: UUID,
    staff_in: StaffProfileUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Cập nhật thông tin nhân viên."""
    staff = await service.update_staff_profile(session, user_id, staff_in)
    return staff


@router.put("/{user_id}/skills", response_model=StaffProfileReadWithSkills)
async def update_staff_skills(
    user_id: UUID,
    skills_in: StaffSkillsUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Cập nhật danh sách kỹ năng cho nhân viên."""
    staff = await service.update_staff_skills(session, user_id, skills_in)
    result = StaffProfileReadWithSkills.model_validate(staff)
    result.skill_ids = [skill.id for skill in staff.skills]
    return result


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_staff(
    user_id: UUID,
    session: AsyncSession = Depends(get_db),
):
    """Xóa (vô hiệu hóa) nhân viên."""
    await service.delete_staff_profile(session, user_id)
    return None
