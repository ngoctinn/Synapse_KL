"""
Service Models - Dịch vụ Spa và các bảng liên kết.
Bao gồm: Service, ServiceRequiredSkill (M-N), ServiceResourceRequirement (M-N với extra columns).
"""
from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

from app.modules.categories.models import ServiceCategory
from app.modules.resources.models import ResourceGroup
from app.modules.services.link_models import ServiceRequiredSkill
from app.modules.skills.models import Skill


class ServiceResourceRequirement(SQLModel, table=True):
    """
    Bảng liên kết M-N giữa Service và ResourceGroup với extra columns.
    Mô tả: Dịch vụ cần bao nhiêu resource từ group nào, dùng từ lúc nào, trong bao lâu.
    """
    __tablename__ = "service_resource_requirements"

    service_id: UUID = Field(foreign_key="services.id", primary_key=True)
    group_id: UUID = Field(foreign_key="resource_groups.id", primary_key=True)
    quantity: int = Field(default=1)
    start_delay: int = Field(default=0)  # Phút từ đầu dịch vụ
    usage_duration: int | None = None  # NULL = dùng đến hết dịch vụ

    # Relationships cho truy vấn 2 chiều
    service: "Service" = Relationship(back_populates="resource_requirements")
    group: ResourceGroup = Relationship(back_populates="service_requirements")


class Service(SQLModel, table=True):
    """
    Dịch vụ Spa (VD: Massage Thái 90 phút, HydraFacial Pro).
    Là entity trung tâm của module, liên kết với Category, Skills, và Resources.
    """
    __tablename__ = "services"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    category_id: UUID | None = Field(default=None, foreign_key="service_categories.id")
    name: str = Field(max_length=255)
    duration: int  # Phút - thời gian thực hiện
    buffer_time: int = Field(default=10)  # Phút - thời gian nghỉ sau dịch vụ
    price: Decimal = Field(max_digits=12, decimal_places=2)
    description: str | None = None
    image_url: str | None = None
    is_active: bool = Field(default=True)
    deleted_at: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))
    created_at: datetime = Field(
        sa_type=DateTime(timezone=True),
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        sa_type=DateTime(timezone=True),
        default_factory=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    category: ServiceCategory | None = Relationship(back_populates="services")
    skills: list[Skill] = Relationship(back_populates="services", link_model=ServiceRequiredSkill)
    resource_requirements: list[ServiceResourceRequirement] = Relationship(
        back_populates="service",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
