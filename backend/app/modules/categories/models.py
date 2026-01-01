"""
ServiceCategory Model - Danh mục phân loại dịch vụ Spa.
VD: Massage, Chăm sóc da, Nail, Tóc...
"""
from datetime import datetime, timezone
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.services.models import Service


class ServiceCategory(SQLModel, table=True):
    """
    Danh mục dịch vụ. Mỗi dịch vụ thuộc về 1 category (hoặc không có).
    sort_order dùng để sắp xếp thứ tự hiển thị trên UI.
    """
    __tablename__ = "service_categories"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(max_length=100)
    description: str | None = None
    sort_order: int = Field(default=0)
    created_at: datetime = Field(
        sa_type=DateTime(timezone=True),
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        sa_type=DateTime(timezone=True),
        default_factory=lambda: datetime.now(timezone.utc)
    )

    # Relationship: Category chứa nhiều Services (1-N)
    services: list["Service"] = Relationship(back_populates="category")

