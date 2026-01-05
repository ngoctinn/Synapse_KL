"""
Staff Router - API Endpoints cho quản lý nhân viên.
"""
from uuid import UUID

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from supabase import create_client, Client as SupabaseClient

from app.core.config import settings
from app.core.db import get_db
from app.modules.staff import service
from app.modules.staff.schemas import (
    StaffProfileCreate,
    StaffProfileRead,
    StaffProfileReadWithSkills,
    StaffProfileUpdate,
    StaffSkillsUpdate,
    StaffInviteRequest,
)

router = APIRouter(prefix="/staff", tags=["Staff"])


@router.post("/invite", response_model=StaffProfileRead, status_code=status.HTTP_201_CREATED)
async def invite_staff(
    data: StaffInviteRequest,
    session: AsyncSession = Depends(get_db)
):
    """
    Mời nhân viên mới qua email.
    1. Gửi Invite Link qua Supabase Auth.
    2. Tạo Staff Profile + User Profile (via Trigger).
    """
    try:
        staff = await service.invite_staff(session, data)

        # Manual Mapping for Response
        # Note: staff.profile might not be loaded immediately if not eager loaded in 'invite_staff'
        # But service.invite_staff refreshes it.
        # If profile is None (due to race condition or load issue), fallback to request data.

        full_name = data.full_name
        is_active = True # Default for invite

        if staff.profile:
             full_name = staff.profile.full_name
             is_active = staff.profile.is_active

        return StaffProfileRead(
            user_id=staff.user_id,
            full_name=full_name,
            title=staff.title,
            bio=staff.bio,
            color_code=staff.color_code,
            avatar_url=staff.profile.avatar_url if staff.profile else None,
            is_active=is_active,
            role=staff.profile.role if staff.profile else data.role,
            email=staff.profile.email if staff.profile else data.email
        )

    except Exception as e:
        # Re-raise standard HTTP Exceptions
        if isinstance(e, HTTPException):
            raise e

        print(f"ERROR inviting staff: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi hệ thống khi mời nhân viên. Vui lòng thử lại sau."
        )


@router.get("/", response_model=list[StaffProfileReadWithSkills])
async def list_staff(
    session: AsyncSession = Depends(get_db),
):
    """Lấy danh sách tất cả nhân viên."""
    staff_list = await service.get_all_staff(session)
    result = []
    for staff in staff_list:
        # Manual mapping for flattened response
        staff_data = StaffProfileReadWithSkills(
            user_id=staff.user_id,
            full_name=staff.profile.full_name if staff.profile else "Không xác định",
            title=staff.title,

            bio=staff.bio,
            color_code=staff.color_code,
            avatar_url=staff.profile.avatar_url if staff.profile else None,
            is_active=staff.profile.is_active if staff.profile else False,
            role=staff.profile.role if staff.profile else None,
            email=staff.profile.email if staff.profile else None,
            skill_ids=[skill.id for skill in staff.skills]
        )
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

    # Manual mapping
    result = StaffProfileReadWithSkills(
        user_id=staff.user_id,
        full_name=staff.profile.full_name if staff.profile else "Không xác định",
        title=staff.title,
        bio=staff.bio,
        color_code=staff.color_code,
        is_active=staff.profile.is_active if staff.profile else False,
        role=staff.profile.role if staff.profile else None,
        email=staff.profile.email if staff.profile else None,
        skill_ids=[skill.id for skill in staff.skills]
    )
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

    return StaffProfileRead(
        user_id=staff.user_id,
        full_name=staff.profile.full_name if staff.profile else "Không xác định",
        title=staff.title,
        bio=staff.bio,
        color_code=staff.color_code,
        avatar_url=staff.profile.avatar_url if staff.profile else None,
        is_active=staff.profile.is_active if staff.profile else False,
        role=staff.profile.role if staff.profile else None,
        email=staff.profile.email if staff.profile else None,
    )


@router.put("/{user_id}/skills", response_model=StaffProfileReadWithSkills)
async def update_staff_skills(
    user_id: UUID,
    skills_in: StaffSkillsUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Cập nhật danh sách kỹ năng cho nhân viên."""
    staff = await service.update_staff_skills(session, user_id, skills_in)

    return StaffProfileReadWithSkills(
        user_id=staff.user_id,
        full_name=staff.profile.full_name if staff.profile else "Không xác định",
        title=staff.title,
        bio=staff.bio,
        color_code=staff.color_code,
        is_active=staff.profile.is_active if staff.profile else False,
        role=staff.profile.role if staff.profile else None,
        email=staff.profile.email if staff.profile else None,
        skill_ids=[skill.id for skill in staff.skills]
    )


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_staff(
    user_id: UUID,
    session: AsyncSession = Depends(get_db),
):
    """Xóa (vô hiệu hóa) nhân viên."""
    await service.delete_staff_profile(session, user_id)
    return None
