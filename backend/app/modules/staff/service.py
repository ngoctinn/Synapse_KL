"""
Staff Service - Business logic cho quản lý nhân viên.
"""
from typing import Sequence
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.core.supabase import supabase_admin
from app.modules.staff.exceptions import StaffNotFoundException
from app.modules.staff.link_models import StaffSkillLink
from app.modules.staff.models import StaffProfile
from app.modules.staff.schemas import (
    StaffInviteRequest,
    StaffProfileCreate,
    StaffProfileUpdate,
    StaffSkillsUpdate,
)


async def get_all_staff(session: AsyncSession) -> Sequence[StaffProfile]:
    """Lấy danh sách tất cả nhân viên."""
    result = await session.execute(
        select(StaffProfile).options(
            selectinload(StaffProfile.skills),
            selectinload(StaffProfile.profile)
        )
    )
    return result.scalars().all()


async def get_staff_by_id(session: AsyncSession, user_id: UUID) -> StaffProfile | None:
    """Lấy thông tin chi tiết một nhân viên."""
    result = await session.execute(
        select(StaffProfile)
        .options(
            selectinload(StaffProfile.skills),
            selectinload(StaffProfile.profile)
        )
        .where(StaffProfile.user_id == user_id)
    )
    return result.scalars().first()


async def invite_staff(session: AsyncSession, invite_in: StaffInviteRequest) -> StaffProfile:
    """
    Mời nhân viên mới:
    1. Gọi Supabase Admin Invite API -> Tạo User + Gửi Email.
    2. Trigger DB tự tạo UserProfile.
    3. Tạo StaffProfile bổ sung.
    """
    try:
        # WHY: Supabase Trigger sẽ tự tạo UserProfile từ metadata này
        invite_data = {
            "email": invite_in.email,
            "data": {
                "full_name": invite_in.full_name,
                "role": invite_in.role
            }
        }

        response = supabase_admin.auth.admin.invite_user_by_email(invite_in.email, options={"data": invite_data["data"]})
        user = response.user

        if not user or not user.id:
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Supabase Invite failed")

        user_id = UUID(user.id)

        # WHY: Tránh tạo trùng khi re-invite cùng email
        existing_staff = await get_staff_by_id(session, user_id)
        if existing_staff:
            existing_staff.title = invite_in.title
            session.add(existing_staff)
            await session.commit()
            await session.refresh(existing_staff)
            return existing_staff

        staff_profile = StaffProfile(
            user_id=user_id,
            title=invite_in.title,
            bio="",
            color_code="#6366F1"
        )

        session.add(staff_profile)
        await session.commit()
        await session.refresh(staff_profile)

        return staff_profile

    except Exception as e:
        error_str = str(e)
        # WHY: Supabase trả về message khác nhau cho duplicate email
        if "already been registered" in error_str or "already signed up" in error_str:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email này đã được đăng ký hoặc mời tham gia hệ thống trước đó."
            )
        print(f"DEBUG - Invite Error: {error_str}")
        raise e


async def create_staff_profile(
    session: AsyncSession, staff_in: StaffProfileCreate
) -> StaffProfile:
    """Tạo hồ sơ nhân viên mới sau khi được invite qua Supabase Auth."""
    staff = StaffProfile.model_validate(staff_in)
    session.add(staff)
    await session.commit()
    await session.refresh(staff)
    return staff


async def update_staff_profile(
    session: AsyncSession, user_id: UUID, staff_in: StaffProfileUpdate
) -> StaffProfile:
    """Cập nhật thông tin nhân viên."""
    staff = await get_staff_by_id(session, user_id)
    if not staff:
        raise StaffNotFoundException()

    # WHY: Tách riêng để update đúng bảng (profiles vs staff_profiles)
    update_data = staff_in.model_dump(exclude_unset=True)

    profile_fields = {"full_name", "is_active", "avatar_url"}
    profile_update = {k: v for k, v in update_data.items() if k in profile_fields}

    if profile_update and staff.profile:
        for key, value in profile_update.items():
            setattr(staff.profile, key, value)
        session.add(staff.profile)

    staff_fields = {"title", "bio", "color_code"}
    staff_update = {k: v for k, v in update_data.items() if k in staff_fields}

    for key, value in staff_update.items():
        setattr(staff, key, value)

    session.add(staff)
    await session.commit()
    await session.refresh(staff)
    await session.refresh(staff.profile)
    return staff


async def update_staff_skills(
    session: AsyncSession, user_id: UUID, skills_in: StaffSkillsUpdate
) -> StaffProfile:
    """Cập nhật danh sách kỹ năng cho nhân viên (sync toàn bộ)."""
    staff = await get_staff_by_id(session, user_id)
    if not staff:
        raise StaffNotFoundException()

    # WHY: Sync toàn bộ - xóa cũ, tạo mới để đảm bảo consistency
    existing_links = (await session.execute(
        select(StaffSkillLink).where(StaffSkillLink.staff_id == user_id)
    )).scalars().all()
    for link in existing_links:
        await session.delete(link)

    for skill_id in skills_in.skill_ids:
        new_link = StaffSkillLink(staff_id=user_id, skill_id=skill_id)
        session.add(new_link)

    await session.commit()
    await session.refresh(staff)
    return staff


async def delete_staff_profile(session: AsyncSession, user_id: UUID) -> bool:
    """Xóa hồ sơ nhân viên (soft delete bằng is_active=False trong profiles)."""
    staff = await get_staff_by_id(session, user_id)
    if not staff:
        raise StaffNotFoundException()

    # WHY: Soft delete thay vì hard delete để giữ history booking
    if staff.profile:
        staff.profile.is_active = False
        session.add(staff.profile)

    await session.commit()
    return True
