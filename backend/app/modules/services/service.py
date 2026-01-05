"""
Service Service - Business logic cho Services.
"""
from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import selectinload
from sqlmodel import func, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.modules.categories.models import ServiceCategory
from app.modules.services.models import (
    Service,
    ServiceResourceRequirement,
)
from app.modules.services.schemas import ServiceCreate, ServiceUpdate
from app.modules.skills.models import Skill

async def get_all_services(
    session: AsyncSession,
    category_id: UUID | None = None,
    is_active: bool | None = None,
    search: str | None = None,
    page: int = 1,
    limit: int = 100
) -> tuple[list[Service], int]:
    stmt = select(Service).where(Service.deleted_at.is_(None))
    if category_id:
        stmt = stmt.where(Service.category_id == category_id)
    if is_active is not None:
        stmt = stmt.where(Service.is_active == is_active)
    if search:
        stmt = stmt.where(Service.name.ilike(f"%{search}%"))

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await session.exec(count_stmt)).one()

    stmt = stmt.order_by(Service.created_at.desc()).offset((page - 1) * limit).limit(limit)

    result = await session.exec(stmt)
    return list(result.all()), total


async def get_service_by_id(session: AsyncSession, service_id: UUID) -> Service | None:
    """Eager load relationships để tránh N+1."""
    stmt = (
        select(Service)
        .options(
            selectinload(Service.category),
            selectinload(Service.skills),
            selectinload(Service.resource_requirements).selectinload(
                ServiceResourceRequirement.group
            ),
        )
        .where(Service.id == service_id, Service.deleted_at.is_(None))
    )
    result = await session.exec(stmt)
    return result.first()


def validate_and_create_requirements(
    requirements_data: list,
    service_duration: int,
    buffer_time: int,
    service_id: UUID | None = None
) -> list[ServiceResourceRequirement]:
    """Helper để validate và tạo list ServiceResourceRequirement."""
    total_time = service_duration + buffer_time
    reqs = []
    for req in requirements_data:
        usage = req.usage_duration if req.usage_duration is not None else (service_duration - req.start_delay)

        if req.start_delay < 0:
             raise HTTPException(status_code=400, detail="Start delay không được âm")
        if usage <= 0:
             raise HTTPException(status_code=400, detail="Thời gian sử dụng tài nguyên phải lớn hơn 0")
        if req.start_delay + usage > total_time:
             raise HTTPException(
                 status_code=400,
                 detail=f"Tài nguyên vượt quá tổng thời gian dịch vụ ({total_time}p = {service_duration}p + {buffer_time}p buffer)"
             )

        req_dict = req.model_dump()
        if service_id:
            req_dict["service_id"] = service_id

        req_obj = ServiceResourceRequirement(**req_dict)
        reqs.append(req_obj)
    return reqs


async def create_service(session: AsyncSession, data: ServiceCreate) -> Service:
    try:
        if data.category_id:
            result = await session.exec(
                select(ServiceCategory).where(ServiceCategory.id == data.category_id)
            )
            if not result.first():
                raise HTTPException(status_code=400, detail="Danh mục không tồn tại")

        skills = []
        if data.skill_ids:
            result = await session.exec(select(Skill).where(Skill.id.in_(data.skill_ids)))
            skills = list(result.all())
            if len(skills) != len(data.skill_ids):
                raise HTTPException(status_code=400, detail="Một hoặc nhiều kỹ năng không tồn tại")

        service_data = data.model_dump(exclude={"skill_ids", "resource_requirements"})
        service = Service(**service_data)
        service.skills = skills

        if data.resource_requirements:
            service.resource_requirements = validate_and_create_requirements(
                data.resource_requirements,
                service.duration,
                service.buffer_time
            )

        session.add(service)
        await session.commit()

        # WHY: Fetch lại để eager load relationships (category, skills, etc.)
        return await get_service_by_id(session, service.id)
    except HTTPException:
        await session.rollback()
        raise
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi tạo dịch vụ: {str(e)}")


async def update_service(session: AsyncSession, service_id: UUID, data: ServiceUpdate) -> Service:
    try:
        service = await get_service_by_id(session, service_id)
        if not service:
            raise HTTPException(status_code=404, detail="Dịch vụ không tồn tại")

        update_data = data.model_dump(exclude_unset=True, exclude={"skill_ids", "resource_requirements"})
        for key, value in update_data.items():
            setattr(service, key, value)

        service.updated_at = datetime.now(timezone.utc)

        if data.skill_ids is not None:
            if not data.skill_ids:
                service.skills = []
            else:
                skill_result = await session.exec(select(Skill).where(Skill.id.in_(data.skill_ids)))
                new_skills = list(skill_result.all())
                if len(new_skills) != len(data.skill_ids):
                    raise HTTPException(status_code=400, detail="Một hoặc nhiều kỹ năng không tồn tại")
                service.skills = new_skills

        if data.resource_requirements is not None:
            service.resource_requirements = validate_and_create_requirements(
                data.resource_requirements,
                service.duration,
                service.buffer_time,
                service_id
            )

        session.add(service)
        await session.commit()
        return await get_service_by_id(session, service_id)
    except HTTPException:
        await session.rollback()
        raise
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi cập nhật dịch vụ: {str(e)}")


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
    """Soft delete service và cascade soft delete resource requirements."""
    service = await get_service_by_id(session, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Dịch vụ không tồn tại")

    now = datetime.now(timezone.utc)
    service.deleted_at = now

    # WHY: Cascade soft delete để giữ tính toàn vẹn tham chiếu
    for req in service.resource_requirements:
        req.deleted_at = now
        session.add(req)

    session.add(service)
    await session.commit()
