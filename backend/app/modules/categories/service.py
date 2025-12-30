"""
Category Service - Business logic cho ServiceCategories.
"""
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.modules.categories.models import ServiceCategory
from app.modules.categories.schemas import CategoryCreate, CategoryUpdate


async def get_all_categories(session: AsyncSession) -> list[ServiceCategory]:
    """Sorted by sort_order để UI hiển thị đúng thứ tự drag-drop."""
    result = await session.exec(
        select(ServiceCategory).order_by(ServiceCategory.sort_order)
    )
    return list(result.all())


async def get_category_by_id(
    session: AsyncSession, category_id: UUID
) -> ServiceCategory | None:
    result = await session.exec(
        select(ServiceCategory).where(ServiceCategory.id == category_id)
    )
    return result.first()


async def create_category(
    session: AsyncSession, data: CategoryCreate
) -> ServiceCategory:
    # Tự động đặt sort_order cuối cùng
    result = await session.exec(select(func.max(ServiceCategory.sort_order)))
    max_order = result.one() or 0

    category = ServiceCategory(**data.model_dump(), sort_order=max_order + 1)
    session.add(category)
    await session.commit()
    await session.refresh(category)
    return category


async def update_category(
    session: AsyncSession, category_id: UUID, data: CategoryUpdate
) -> ServiceCategory:
    category = await get_category_by_id(session, category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Danh mục không tồn tại"
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(category, key, value)

    session.add(category)
    await session.commit()
    await session.refresh(category)
    return category


async def reorder_categories(
    session: AsyncSession, ids: list[UUID]
) -> list[ServiceCategory]:
    """Cập nhật sort_order theo thứ tự mới từ drag-drop UI."""
    categories = []
    for index, category_id in enumerate(ids):
        category = await get_category_by_id(session, category_id)
        if category:
            category.sort_order = index
            session.add(category)
            categories.append(category)

    await session.commit()
    for cat in categories:
        await session.refresh(cat)
    return categories


async def delete_category(session: AsyncSession, category_id: UUID) -> None:
    """Không cho xóa category đang chứa services."""
    category = await get_category_by_id(session, category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Danh mục không tồn tại"
        )

    from app.modules.services.models import Service
    result = await session.exec(
        select(func.count()).select_from(Service).where(
            Service.category_id == category_id,
            Service.deleted_at.is_(None)
        )
    )
    service_count = result.one() or 0

    if service_count > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Không thể xóa. Danh mục đang chứa {service_count} dịch vụ"
        )

    await session.delete(category)
    await session.commit()
