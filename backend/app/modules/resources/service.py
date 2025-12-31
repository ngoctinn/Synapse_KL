from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func, case
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.modules.resources.models import (
    Resource,
    ResourceGroup,
    ResourceMaintenanceSchedule,
    ResourceStatus,
)
from app.modules.resources.schemas import (
    MaintenanceCreate,
    ResourceCreate,
    ResourceGroupCreate,
    ResourceGroupUpdate,
    ResourceUpdate,
)


# ResourceGroup CRUD
async def get_all_groups(session: AsyncSession):
    stmt = (
        select(
            ResourceGroup,
            func.count(Resource.id).label("resource_count"),
            func.count(case((Resource.status == ResourceStatus.ACTIVE, Resource.id), else_=None)).label("active_count")
        )
        .outerjoin(Resource, (Resource.group_id == ResourceGroup.id) & (Resource.deleted_at.is_(None)))
        .where(ResourceGroup.deleted_at.is_(None))
        .group_by(ResourceGroup.id)
    )
    result = await session.exec(stmt)

    # Pack into dicts for Pydantic schema
    groups_data = []
    for group, total, active in result:
        g_dict = group.model_dump()
        g_dict["resource_count"] = total
        g_dict["active_count"] = active
        groups_data.append(g_dict)

    return groups_data


async def get_group_by_id(session: AsyncSession, group_id: UUID) -> ResourceGroup | None:
    result = await session.exec(
        select(ResourceGroup).where(ResourceGroup.id == group_id, ResourceGroup.deleted_at.is_(None))
    )
    return result.first()


async def create_group(session: AsyncSession, data: ResourceGroupCreate) -> ResourceGroup:
    group = ResourceGroup(**data.model_dump())
    session.add(group)
    await session.commit()
    await session.refresh(group)
    return group


async def update_group(session: AsyncSession, group_id: UUID, data: ResourceGroupUpdate) -> ResourceGroup:
    group = await get_group_by_id(session, group_id)
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nhóm tài nguyên không tồn tại")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(group, key, value)

    session.add(group)
    await session.commit()
    await session.refresh(group)
    return group


async def delete_group(session: AsyncSession, group_id: UUID) -> None:
    """Soft delete. Không cho xóa nếu còn resources hoặc đang được dịch vụ sử dụng."""
    group = await get_group_by_id(session, group_id)
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nhóm tài nguyên không tồn tại")

    # Check resources
    result = await session.exec(
        select(func.count()).select_from(Resource).where(
            Resource.group_id == group_id,
            Resource.deleted_at.is_(None)
        )
    )
    if (result.one() or 0) > 0:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Không thể xóa. Nhóm còn chứa tài nguyên")

    # Check service requirements
    from app.modules.services.models import ServiceResourceRequirement
    result = await session.exec(
        select(func.count()).where(ServiceResourceRequirement.group_id == group_id)
    )
    if (result.one() or 0) > 0:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Không thể xóa. Nhóm đang được dịch vụ sử dụng")

    # asyncpg requires the datetime to be offset-naive if the column is TIMESTAMP WITHOUT TIME ZONE
    # We strip the timezone info from the UTC datetime to satisfy this constraint.
    group.deleted_at = datetime.now(timezone.utc).replace(tzinfo=None)
    session.add(group)
    await session.commit()


# Resource CRUD
async def get_all_resources(session: AsyncSession, group_id: UUID | None = None) -> list[Resource]:
    stmt = select(Resource).where(Resource.deleted_at.is_(None))
    if group_id:
        stmt = stmt.where(Resource.group_id == group_id)
    result = await session.exec(stmt)
    return list(result.all())


async def get_resource_by_id(session: AsyncSession, resource_id: UUID) -> Resource | None:
    result = await session.exec(
        select(Resource).where(Resource.id == resource_id, Resource.deleted_at.is_(None))
    )
    return result.first()


async def create_resource(session: AsyncSession, data: ResourceCreate) -> Resource:
    # Verify group exists
    group = await get_group_by_id(session, data.group_id)
    if not group:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nhóm tài nguyên không tồn tại")

    resource = Resource(**data.model_dump())
    session.add(resource)
    await session.commit()
    await session.refresh(resource)
    return resource


async def update_resource(session: AsyncSession, resource_id: UUID, data: ResourceUpdate) -> Resource:
    resource = await get_resource_by_id(session, resource_id)
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tài nguyên không tồn tại")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(resource, key, value)

    session.add(resource)
    await session.commit()
    await session.refresh(resource)
    return resource


async def delete_resource(session: AsyncSession, resource_id: UUID) -> None:
    """Soft delete."""
    resource = await get_resource_by_id(session, resource_id)
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tài nguyên không tồn tại")

    resource.deleted_at = datetime.now(timezone.utc).replace(tzinfo=None)
    session.add(resource)
    await session.commit()


# Maintenance CRUD
async def create_maintenance(
    session: AsyncSession, resource_id: UUID, data: MaintenanceCreate, created_by: UUID | None = None
) -> ResourceMaintenanceSchedule:
    resource = await get_resource_by_id(session, resource_id)
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tài nguyên không tồn tại")

    # Check conflict
    conflict = await session.exec(
        select(ResourceMaintenanceSchedule).where(
            ResourceMaintenanceSchedule.resource_id == resource_id,
            ResourceMaintenanceSchedule.start_time < data.end_time,
            ResourceMaintenanceSchedule.end_time > data.start_time
        )
    )
    if conflict.first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Thời gian bảo trì bị trùng với lịch trình khác"
        )

    maintenance = ResourceMaintenanceSchedule(
        resource_id=resource_id,
        created_by=created_by,
        **data.model_dump()
    )
    session.add(maintenance)

    # Tự động set status MAINTENANCE nếu thời gian bảo trì đang active
    now = datetime.now(timezone.utc)
    if data.start_time <= now <= data.end_time:
        resource.status = ResourceStatus.MAINTENANCE
        session.add(resource)

    await session.commit()
    await session.refresh(maintenance)
    return maintenance


async def delete_maintenance(session: AsyncSession, maintenance_id: UUID) -> None:
    result = await session.exec(
        select(ResourceMaintenanceSchedule).where(ResourceMaintenanceSchedule.id == maintenance_id)
    )
    maintenance = result.first()
    if not maintenance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lịch bảo trì không tồn tại")

    await session.delete(maintenance)
    await session.commit()
