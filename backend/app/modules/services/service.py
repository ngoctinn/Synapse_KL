"""
Service Service - Business logic cho Services.
"""
from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import selectinload
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.modules.categories.models import ServiceCategory
from app.modules.services.models import (
    Service,
    ServiceRequiredSkill,
    ServiceResourceRequirement,
)
from app.modules.skills.models import Skill
from app.modules.services.schemas import ServiceCreate, ServiceUpdate
async def get_all_services(
    session: AsyncSession,
    category_id: UUID | None = None,
    is_active: bool | None = None
) -> list[Service]:
    stmt = select(Service).where(Service.deleted_at.is_(None))
    if category_id:
        stmt = stmt.where(Service.category_id == category_id)
    if is_active is not None:
        stmt = stmt.where(Service.is_active == is_active)
    stmt = stmt.order_by(Service.name)

    result = await session.exec(stmt)
    return list(result.all())


async def get_service_by_id(session: AsyncSession, service_id: UUID) -> Service | None:
    """Eager load relationships để tránh N+1."""
    stmt = (
        select(Service)
        .options(
            selectinload(Service.category),
            selectinload(Service.skills),
            selectinload(Service.resource_requirements),
        )
        .where(Service.id == service_id, Service.deleted_at.is_(None))
    )
    result = await session.exec(stmt)
    return result.first()


async def create_service(session: AsyncSession, data: ServiceCreate) -> Service:
    # Verify category exists
    if data.category_id:
        result = await session.exec(
            select(ServiceCategory).where(ServiceCategory.id == data.category_id)
        )
        if not result.first():
            raise HTTPException(status_code=400, detail="Danh mục không tồn tại")

    # Verify skills exist
    skills = []
    if data.skill_ids:
        result = await session.exec(select(Skill).where(Skill.id.in_(data.skill_ids)))
        skills = list(result.all())
        if len(skills) != len(data.skill_ids):
            raise HTTPException(status_code=400, detail="Một hoặc nhiều kỹ năng không tồn tại")

    # Create service
    service_data = data.model_dump(exclude={"skill_ids", "resource_requirements"})
    service = Service(**service_data)

    # Assign relationships directly
    service.skills = skills

    # Map and validate resource requirements
    reqs = []
    for req in data.resource_requirements:
        usage = req.usage_duration if req.usage_duration is not None else (service.duration - req.start_delay)

        if req.start_delay < 0:
             raise HTTPException(status_code=400, detail="Start delay không được âm")
        if usage <= 0:
             raise HTTPException(status_code=400, detail="Thời gian sử dụng tài nguyên phải lớn hơn 0")
        if req.start_delay + usage > service.duration:
             raise HTTPException(
                 status_code=400,
                 detail=f"Tài nguyên vượt quá thời gian dịch vụ ({service.duration}p)"
             )

        req_obj = ServiceResourceRequirement(**req.model_dump())
        reqs.append(req_obj)
    service.resource_requirements = reqs

    session.add(service)
    await session.commit()

    # Force refresh or return known state.
    # With direct assignment, 'service' object in memory is up to date.
    # But to get eager loaded fields (like category) behaving consistently, fetch again.
    return await get_service_by_id(session, service.id)


async def update_service(session: AsyncSession, service_id: UUID, data: ServiceUpdate) -> Service:
    service = await get_service_by_id(session, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Dịch vụ không tồn tại")

    update_data = data.model_dump(exclude_unset=True, exclude={"skill_ids", "resource_requirements"})
    for key, value in update_data.items():
        setattr(service, key, value)

    service.updated_at = datetime.now(timezone.utc)

    # Update skills if provided
    if data.skill_ids is not None:
        if not data.skill_ids:
             service.skills = []
        else:
             skill_result = await session.exec(select(Skill).where(Skill.id.in_(data.skill_ids)))
             new_skills = list(skill_result.all())
             if len(new_skills) != len(data.skill_ids):
                 raise HTTPException(status_code=400, detail="Một hoặc nhiều kỹ năng không tồn tại")
             service.skills = new_skills

    # Update resource requirements if provided
    if data.resource_requirements is not None:
        new_reqs = []
        current_duration = service.duration # Dùng duration mới hoặc cũ
        for req in data.resource_requirements:
            usage = req.usage_duration if req.usage_duration is not None else (current_duration - req.start_delay)

            if req.start_delay < 0:
                 raise HTTPException(status_code=400, detail="Start delay không được âm")
            if usage <= 0:
                 raise HTTPException(status_code=400, detail="Thời gian sử dụng tài nguyên phải lớn hơn 0")
            if req.start_delay + usage > current_duration:
                 raise HTTPException(
                     status_code=400,
                     detail=f"Tài nguyên vượt quá thời gian dịch vụ ({current_duration}p)"
                 )

            req_obj = ServiceResourceRequirement(**req.model_dump(), service_id=service_id)
            new_reqs.append(req_obj)
        service.resource_requirements = new_reqs

    session.add(service)
    await session.commit()
    # Direct assignment updates the session object, so it shouldn't be stale.
    # However, to ensure consistency with other sessions/db triggers (if any), fetching is safe.
    return await get_service_by_id(session, service_id)


async def toggle_service_status(session: AsyncSession, service_id: UUID) -> Service:
    service = await get_service_by_id(session, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Dịch vụ không tồn tại")

    service.is_active = not service.is_active
    service.updated_at = datetime.now(timezone.utc)
    session.add(service)
    await session.commit()
    return await get_service_by_id(session, service.id)


async def delete_service(session: AsyncSession, service_id: UUID) -> None:
    """Soft delete."""
    service = await get_service_by_id(session, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Dịch vụ không tồn tại")

    service.deleted_at = datetime.now(timezone.utc)
    session.add(service)
    await session.commit()
