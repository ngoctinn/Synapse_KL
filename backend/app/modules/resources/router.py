"""
Resource Router - API endpoints cho ResourceGroups và Resources.
"""
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.db import get_db
from app.modules.resources import service
from app.modules.resources.schemas import (
    MaintenanceCreate,
    MaintenanceRead,
    ResourceCreate,
    ResourceGroupCreate,
    ResourceGroupRead,
    ResourceGroupUpdate,
    ResourceRead,
    ResourceUpdate,
)

router = APIRouter(prefix="/resources", tags=["Resources"])


# ResourceGroup endpoints
@router.get("/groups", response_model=list[ResourceGroupRead])
async def list_groups(session: AsyncSession = Depends(get_db)):
    return await service.get_all_groups(session)


@router.get("/groups/{group_id}", response_model=ResourceGroupRead)
async def get_group(group_id: UUID, session: AsyncSession = Depends(get_db)):
    group = await service.get_group_by_id(session, group_id)
    if not group:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Nhóm tài nguyên không tồn tại")
    return group


@router.post("/groups", response_model=ResourceGroupRead, status_code=status.HTTP_201_CREATED)
async def create_group(data: ResourceGroupCreate, session: AsyncSession = Depends(get_db)):
    return await service.create_group(session, data)


@router.put("/groups/{group_id}", response_model=ResourceGroupRead)
async def update_group(group_id: UUID, data: ResourceGroupUpdate, session: AsyncSession = Depends(get_db)):
    return await service.update_group(session, group_id, data)


@router.delete("/groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_group(group_id: UUID, session: AsyncSession = Depends(get_db)):
    await service.delete_group(session, group_id)
    return None


# Resource endpoints
@router.get("", response_model=list[ResourceRead])
async def list_resources(
    group_id: UUID | None = Query(None),
    session: AsyncSession = Depends(get_db)
):
    return await service.get_all_resources(session, group_id)


@router.get("/{resource_id}", response_model=ResourceRead)
async def get_resource(resource_id: UUID, session: AsyncSession = Depends(get_db)):
    resource = await service.get_resource_by_id(session, resource_id)
    if not resource:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Tài nguyên không tồn tại")
    return resource


@router.post("", response_model=ResourceRead, status_code=status.HTTP_201_CREATED)
async def create_resource(data: ResourceCreate, session: AsyncSession = Depends(get_db)):
    return await service.create_resource(session, data)


@router.put("/{resource_id}", response_model=ResourceRead)
async def update_resource(resource_id: UUID, data: ResourceUpdate, session: AsyncSession = Depends(get_db)):
    return await service.update_resource(session, resource_id, data)


@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(resource_id: UUID, session: AsyncSession = Depends(get_db)):
    await service.delete_resource(session, resource_id)
    return None


# Maintenance endpoints
@router.post("/{resource_id}/maintenance", response_model=MaintenanceRead, status_code=status.HTTP_201_CREATED)
async def create_maintenance(
    resource_id: UUID,
    data: MaintenanceCreate,
    session: AsyncSession = Depends(get_db)
):
    return await service.create_maintenance(session, resource_id, data)


@router.delete("/maintenance/{maintenance_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_maintenance(maintenance_id: UUID, session: AsyncSession = Depends(get_db)):
    await service.delete_maintenance(session, maintenance_id)
    return None
