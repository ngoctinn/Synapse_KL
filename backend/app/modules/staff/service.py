"""
Staff Service - Business logic cho quản lý nhân viên.
"""
from typing import Sequence
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.core.config import settings
from app.core.supabase import supabase_admin
from app.modules.staff.exceptions import StaffNotFoundException
import logging

logger = logging.getLogger(__name__)
import asyncio
from app.modules.staff.link_models import StaffSkillLink
from app.modules.staff.models import StaffProfile, UserProfile
from app.modules.staff.schemas import (
    StaffSyncRequest,
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


async def sync_staff_profile(session: AsyncSession, sync_in: StaffSyncRequest) -> StaffProfile:
    """
    Đồng bộ thông tin nhân viên từ Frontend (Supabase Auth) vào Local DB.
    Hàm này thay thế cho invite_staff cũ, đảm bảo không call API ra ngoài.
    """
    logger.info(f"🔄 Syncing Staff Profile: {sync_in.email} ({sync_in.user_id})")

    # 1. Check & Update UserProfile
    user_profile = await session.get(UserProfile, sync_in.user_id)

    if not user_profile:
        # Nếu chưa có -> Tạo mới (Manual Insert thay vì chờ Trigger)
        logger.info(f"✨ Creating NEW UserProfile locally: {sync_in.user_id}")
        user_profile = UserProfile(
            id=sync_in.user_id,
            email=sync_in.email,
            full_name=sync_in.full_name,
            role=sync_in.role,
            is_active=True
        )
        session.add(user_profile)
    else:
        # Nếu đã có -> Cập nhật thông tin mới nhất
        logger.info(f"♻️ Updating existing UserProfile: {sync_in.user_id}")
        user_profile.email = str(sync_in.email)
        user_profile.full_name = sync_in.full_name
        user_profile.role = sync_in.role
        user_profile.is_active = True
        session.add(user_profile)

    # 2. Check & Update StaffProfile
    staff_profile = await session.get(StaffProfile, sync_in.user_id)

    if not staff_profile:
        logger.info(f"✨ Creating NEW StaffProfile: {sync_in.user_id}")
        staff_profile = StaffProfile(
            user_id=sync_in.user_id,
            title=sync_in.title,
            bio="",
            color_code="#6366F1"
        )
        session.add(staff_profile)
    else:
        logger.info(f"♻️ Updating existing StaffProfile: {sync_in.user_id}")
        staff_profile.title = sync_in.title
        session.add(staff_profile)

    try:
        await session.commit()
        # WHY: Thay vì refresh đơn lẻ, ta dùng lại hàm getter có đầy đủ selectinload
        # để đảm bảo trả về object hoàn chỉnh cho Validator của Pydantic.
        return await get_staff_by_id(session, sync_in.user_id)
    except Exception as e:
        logger.error(f"❌ Error syncing staff profile: {str(e)}")
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi đồng bộ dữ liệu: {str(e)}"
        )





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
