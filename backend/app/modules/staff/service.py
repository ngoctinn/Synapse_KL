"""
Staff Service - Business logic cho quản lý nhân viên.
"""
from typing import Sequence
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.modules.staff.exceptions import StaffNotFoundException
from app.modules.staff.link_models import StaffSkillLink
from app.modules.staff.models import StaffProfile
from app.modules.staff.schemas import (
    StaffProfileCreate,
    StaffProfileUpdate,
    StaffSkillsUpdate,
)


async def get_all_staff(session: AsyncSession) -> Sequence[StaffProfile]:
    """Lấy danh sách tất cả nhân viên."""
    result = await session.execute(
        select(StaffProfile).options(selectinload(StaffProfile.skills))
    )
    return result.scalars().all()


async def get_staff_by_id(session: AsyncSession, user_id: UUID) -> StaffProfile | None:
    """Lấy thông tin chi tiết một nhân viên."""
    result = await session.execute(
        select(StaffProfile)
        .options(selectinload(StaffProfile.skills))
        .where(StaffProfile.user_id == user_id)
    )
    return result.scalars().first()


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

    update_data = staff_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(staff, key, value)

    session.add(staff)
    await session.commit()
    await session.refresh(staff)
    return staff


async def update_staff_skills(
    session: AsyncSession, user_id: UUID, skills_in: StaffSkillsUpdate
) -> StaffProfile:
    """Cập nhật danh sách kỹ năng cho nhân viên (sync toàn bộ)."""
    staff = await get_staff_by_id(session, user_id)
    if not staff:
        raise StaffNotFoundException()

    # Xóa tất cả links cũ
    existing_links = (await session.execute(
        select(StaffSkillLink).where(StaffSkillLink.staff_id == user_id)
    )).scalars().all()
    for link in existing_links:
        await session.delete(link)

    # Tạo links mới
    for skill_id in skills_in.skill_ids:
        new_link = StaffSkillLink(staff_id=user_id, skill_id=skill_id)
        session.add(new_link)

    await session.commit()
    await session.refresh(staff)
    return staff


async def delete_staff_profile(session: AsyncSession, user_id: UUID) -> bool:
    """Xóa hồ sơ nhân viên (soft delete bằng is_active=False)."""
    staff = await get_staff_by_id(session, user_id)
    if not staff:
        raise StaffNotFoundException()

    staff.is_active = False
    session.add(staff)
    await session.commit()
    return True
