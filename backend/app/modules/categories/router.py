"""
Category Router - API endpoints cho ServiceCategories.
"""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.db import get_db
from app.modules.categories import service
from app.modules.categories.schemas import (
    CategoryCreate,
    CategoryRead,
    CategoryReorderRequest,
    CategoryUpdate,
)

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=list[CategoryRead])
async def list_categories(session: AsyncSession = Depends(get_db)):
    return await service.get_all_categories(session)


@router.get("/{category_id}", response_model=CategoryRead)
async def get_category(category_id: UUID, session: AsyncSession = Depends(get_db)):
    category = await service.get_category_by_id(session, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Danh mục không tồn tại")
    return category


@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(
    data: CategoryCreate, session: AsyncSession = Depends(get_db)
):
    return await service.create_category(session, data)



@router.put("/reorder", response_model=list[CategoryRead])
async def reorder_categories(
    data: CategoryReorderRequest, session: AsyncSession = Depends(get_db)
):
    return await service.reorder_categories(session, data.ids)


@router.put("/{category_id}", response_model=CategoryRead)
async def update_category(
    category_id: UUID, data: CategoryUpdate, session: AsyncSession = Depends(get_db)
):
    return await service.update_category(session, category_id, data)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: UUID, session: AsyncSession = Depends(get_db)):
    await service.delete_category(session, category_id)
    return None
