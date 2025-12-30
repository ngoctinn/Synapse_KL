"""
Category Schemas - DTOs cho ServiceCategories API.
"""
from uuid import UUID

from pydantic import ConfigDict
from sqlmodel import SQLModel


class CategoryCreate(SQLModel):
    """Schema tạo mới Category."""
    name: str
    description: str | None = None


class CategoryUpdate(SQLModel):
    """Schema cập nhật Category."""
    name: str | None = None
    description: str | None = None


class CategoryRead(SQLModel):
    """Schema trả về cho client."""
    id: UUID
    name: str
    description: str | None = None
    sort_order: int = 0

    model_config = ConfigDict(from_attributes=True)


class CategoryReadWithCount(CategoryRead):
    """Schema trả về kèm số lượng services."""
    service_count: int = 0


class CategoryReorderRequest(SQLModel):
    """Schema cho reorder categories."""
    ids: list[UUID]
