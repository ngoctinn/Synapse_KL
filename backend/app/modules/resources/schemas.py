"""
Resource Schemas - DTOs cho ResourceGroups và Resources API.
"""
from datetime import datetime
from uuid import UUID

from pydantic import ConfigDict
from sqlmodel import SQLModel

from app.modules.resources.models import ResourceStatus, ResourceType


# ResourceGroup Schemas
class ResourceGroupCreate(SQLModel):
    name: str
    type: ResourceType
    description: str | None = None


class ResourceGroupUpdate(SQLModel):
    name: str | None = None
    description: str | None = None


class ResourceGroupRead(SQLModel):
    id: UUID
    name: str
    type: ResourceType
    description: str | None = None

    model_config = ConfigDict(from_attributes=True)


class ResourceGroupReadWithCount(ResourceGroupRead):
    resource_count: int = 0


# Resource Schemas
class ResourceCreate(SQLModel):
    group_id: UUID
    name: str
    code: str | None = None
    status: ResourceStatus = ResourceStatus.ACTIVE
    setup_time_minutes: int = 0
    description: str | None = None
    image_url: str | None = None


class ResourceUpdate(SQLModel):
    name: str | None = None
    code: str | None = None
    status: ResourceStatus | None = None
    setup_time_minutes: int | None = None
    description: str | None = None
    image_url: str | None = None


class ResourceRead(SQLModel):
    id: UUID
    group_id: UUID | None
    name: str
    code: str | None
    status: ResourceStatus
    setup_time_minutes: int
    description: str | None = None
    image_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class ResourceReadWithGroup(ResourceRead):
    group: ResourceGroupRead | None = None


# Maintenance Schemas
class MaintenanceCreate(SQLModel):
    start_time: datetime
    end_time: datetime
    reason: str | None = None


class MaintenanceRead(SQLModel):
    id: UUID
    resource_id: UUID
    start_time: datetime
    end_time: datetime
    reason: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
