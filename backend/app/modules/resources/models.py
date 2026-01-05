"""
Resource Models - Quản lý tài nguyên vật lý của Spa.
Bao gồm: ResourceGroup (nhóm), Resource (giường/thiết bị), MaintenanceSchedule (lịch bảo trì).
"""
from datetime import datetime, timezone
from enum import Enum as PyEnum
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.services.models import ServiceResourceRequirement


class ResourceType(str, PyEnum):
    """Loại tài nguyên: Giường, Thiết bị hoặc Phòng."""
    BED = "BED"
    EQUIPMENT = "EQUIPMENT"
    ROOM = "ROOM"


class ResourceStatus(str, PyEnum):
    """Trạng thái tài nguyên."""
    ACTIVE = "ACTIVE"
    MAINTENANCE = "MAINTENANCE"
    INACTIVE = "INACTIVE"


class ResourceGroup(SQLModel, table=True):
    """
    Nhóm tài nguyên (VD: Giường Massage, Giường Facial, Máy HydraFacial).
    Dịch vụ yêu cầu nhóm, không yêu cầu resource cụ thể.
    Scheduling Engine sẽ tự tìm resource trống trong nhóm.
    """
    __tablename__ = "resource_groups"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(max_length=100)
    type: ResourceType
    description: str | None = None
    deleted_at: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))
    created_at: datetime = Field(
        sa_type=DateTime(timezone=True),
        default_factory=lambda: datetime.now(timezone.utc)
    )

    # Relationship: Group chứa nhiều Resources (1-N)
    resources: list["Resource"] = Relationship(back_populates="group")
    service_requirements: list["ServiceResourceRequirement"] = Relationship(back_populates="group")


class Resource(SQLModel, table=True):
    """
    Tài nguyên cụ thể (VD: Giường 1, Giường 2, Máy RF #1).
    Mỗi resource thuộc về 1 group.
    """
    __tablename__ = "resources"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    group_id: UUID | None = Field(default=None, foreign_key="resource_groups.id")
    name: str = Field(max_length=100)
    code: str | None = Field(default=None, max_length=50, unique=True)
    status: ResourceStatus = Field(default=ResourceStatus.ACTIVE)

    description: str | None = None
    image_url: str | None = None
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
    group: ResourceGroup | None = Relationship(back_populates="resources")
    maintenance_schedules: list["ResourceMaintenanceSchedule"] = Relationship(
        back_populates="resource"
    )


class ResourceMaintenanceSchedule(SQLModel, table=True):
    """
    Lịch bảo trì cho resource.
    Resource trong thời gian bảo trì sẽ không available cho booking.
    """
    __tablename__ = "resource_maintenance_schedules"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    resource_id: UUID = Field(foreign_key="resources.id")
    start_time: datetime = Field(sa_type=DateTime(timezone=True))
    end_time: datetime = Field(sa_type=DateTime(timezone=True))
    reason: str | None = None
    created_by: UUID | None = None
    created_at: datetime = Field(
        sa_type=DateTime(timezone=True),
        default_factory=lambda: datetime.now(timezone.utc)
    )

    # Relationship
    resource: Resource = Relationship(back_populates="maintenance_schedules")
