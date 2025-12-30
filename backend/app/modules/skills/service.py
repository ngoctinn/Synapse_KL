"""
Skill Service - Business logic cho Skills.
"""
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.modules.skills.models import Skill
from app.modules.skills.schemas import SkillCreate, SkillUpdate


async def get_all_skills(session: AsyncSession) -> list[Skill]:
    result = await session.exec(select(Skill).order_by(Skill.name))
    return list(result.all())


async def get_skill_by_id(session: AsyncSession, skill_id: UUID) -> Skill | None:
    result = await session.exec(select(Skill).where(Skill.id == skill_id))
    return result.first()


async def get_skill_by_code(session: AsyncSession, code: str) -> Skill | None:
    result = await session.exec(select(Skill).where(Skill.code == code))
    return result.first()


async def create_skill(session: AsyncSession, data: SkillCreate) -> Skill:
    existing = await get_skill_by_code(session, data.code)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Skill với code '{data.code}' đã tồn tại"
        )

    skill = Skill(**data.model_dump())
    session.add(skill)
    await session.commit()
    await session.refresh(skill)
    return skill


async def update_skill(
    session: AsyncSession, skill_id: UUID, data: SkillUpdate
) -> Skill:
    skill = await get_skill_by_id(session, skill_id)
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill không tồn tại"
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(skill, key, value)

    session.add(skill)
    await session.commit()
    await session.refresh(skill)
    return skill


async def delete_skill(session: AsyncSession, skill_id: UUID) -> None:
    """Không cho xóa skill đang được services hoặc staff sử dụng."""
    skill = await get_skill_by_id(session, skill_id)
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill không tồn tại"
        )

    from app.modules.services.models import ServiceRequiredSkill
    result = await session.exec(
        select(func.count()).where(ServiceRequiredSkill.skill_id == skill_id)
    )
    service_count = result.one() or 0

    if service_count > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Không thể xóa. Skill đang được sử dụng bởi {service_count} dịch vụ"
        )

    await session.delete(skill)
    await session.commit()
