"""
ServiceCategory Model - Danh mục phân loại dịch vụ Spa.
VD: Massage, Chăm sóc da, Nail, Tóc...
"""
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


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

    # Relationship: Category chứa nhiều Services (1-N)
    # Sẽ define sau khi có Service model để tránh circular import
