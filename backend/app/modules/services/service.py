"""
Service Service - Business logic cho Services.
"""
from datetime import datetime
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
from app.modules.services.schemas import ServiceCreate, ServiceUpdate
from app.modules.skills.models import Skill


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
    if data.skill_ids:
        result = await session.exec(select(Skill).where(Skill.id.in_(data.skill_ids)))
        skills = list(result.all())
        if len(skills) != len(data.skill_ids):
            raise HTTPException(status_code=400, detail="Một hoặc nhiều kỹ năng không tồn tại")
    else:
        skills = []

    # Create service
    service_data = data.model_dump(exclude={"skill_ids", "resource_requirements"})
    service = Service(**service_data)
    session.add(service)
    await session.flush()  # Để có service.id

    # Link skills
    for skill in skills:
        link = ServiceRequiredSkill(service_id=service.id, skill_id=skill.id)
        session.add(link)

    # Link resource requirements
    for req in data.resource_requirements:
        requirement = ServiceResourceRequirement(
            service_id=service.id,
            **req.model_dump()
        )
        session.add(requirement)

    await session.commit()
    return await get_service_by_id(session, service.id)


async def update_service(session: AsyncSession, service_id: UUID, data: ServiceUpdate) -> Service:
    service = await get_service_by_id(session, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Dịch vụ không tồn tại")

    update_data = data.model_dump(exclude_unset=True, exclude={"skill_ids", "resource_requirements"})
    for key, value in update_data.items():
        setattr(service, key, value)

    service.updated_at = datetime.utcnow()

    # Update skills if provided
    if data.skill_ids is not None:
        # Delete existing links
        result = await session.exec(
            select(ServiceRequiredSkill).where(ServiceRequiredSkill.service_id == service_id)
        )
        for link in result.all():
            await session.delete(link)

        # Create new links
        for skill_id in data.skill_ids:
            link = ServiceRequiredSkill(service_id=service_id, skill_id=skill_id)
            session.add(link)

    # Update resource requirements if provided
    if data.resource_requirements is not None:
        # Delete existing
        result = await session.exec(
            select(ServiceResourceRequirement).where(ServiceResourceRequirement.service_id == service_id)
        )
        for req in result.all():
            await session.delete(req)

        # Create new
        for req in data.resource_requirements:
            requirement = ServiceResourceRequirement(
                service_id=service_id,
                **req.model_dump()
            )
            session.add(requirement)

    session.add(service)
    await session.commit()
    return await get_service_by_id(session, service_id)


async def toggle_service_status(session: AsyncSession, service_id: UUID) -> Service:
    service = await get_service_by_id(session, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Dịch vụ không tồn tại")

    service.is_active = not service.is_active
    service.updated_at = datetime.utcnow()
    session.add(service)
    await session.commit()
    await session.refresh(service)
    return service


async def delete_service(session: AsyncSession, service_id: UUID) -> None:
    """Soft delete."""
    service = await get_service_by_id(session, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Dịch vụ không tồn tại")

    service.deleted_at = datetime.utcnow()
    session.add(service)
    await session.commit()
