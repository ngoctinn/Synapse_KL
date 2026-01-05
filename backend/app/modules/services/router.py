"""
Service Router - API endpoints cho Services.
"""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.db import get_db
from app.modules.services import service
from app.modules.services.schemas import (
    ServiceCreate,
    ServiceListResponse,
    ServiceRead,
    ServiceReadWithDetails,
    ServiceUpdate,
)

router = APIRouter(prefix="/services", tags=["Services"])


@router.get("", response_model=ServiceListResponse)
async def list_services(
    category_id: UUID | None = Query(None),
    is_active: bool | None = Query(None),
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=1000),
    session: AsyncSession = Depends(get_db)
):
    services, total = await service.get_all_services(
        session, category_id, is_active, search, page, limit
    )
    return ServiceListResponse(
        data=services,
        total=total,
        page=page,
        limit=limit
    )


@router.get("/{service_id}", response_model=ServiceReadWithDetails)
async def get_service(service_id: UUID, session: AsyncSession = Depends(get_db)):
    svc = await service.get_service_by_id(session, service_id)
    if not svc:
        raise HTTPException(status_code=404, detail="Dịch vụ không tồn tại")
    return svc


@router.post("", response_model=ServiceReadWithDetails, status_code=status.HTTP_201_CREATED)
async def create_service(data: ServiceCreate, session: AsyncSession = Depends(get_db)):
    return await service.create_service(session, data)


@router.put("/{service_id}", response_model=ServiceReadWithDetails)
async def update_service(
    service_id: UUID, data: ServiceUpdate, session: AsyncSession = Depends(get_db)
):
    return await service.update_service(session, service_id, data)


@router.patch("/{service_id}/toggle-status", response_model=ServiceRead)
async def toggle_status(service_id: UUID, session: AsyncSession = Depends(get_db)):
    return await service.toggle_service_status(session, service_id)


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(service_id: UUID, session: AsyncSession = Depends(get_db)):
    await service.delete_service(session, service_id)
    return None
