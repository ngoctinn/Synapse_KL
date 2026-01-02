"""
Service Schemas - DTOs cho Services API.
"""
from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import ConfigDict, field_validator, model_validator
from sqlmodel import SQLModel
from typing_extensions import Self

from app.modules.categories.schemas import CategoryRead
from app.modules.skills.schemas import SkillRead


# Resource Requirement (nested in Service)
class ServiceResourceRequirementCreate(SQLModel):
    group_id: UUID
    quantity: int = 1
    start_delay: int = 0
    usage_duration: int | None = None


class ServiceResourceRequirementRead(SQLModel):
    group_id: UUID
    quantity: int
    start_delay: int
    usage_duration: int | None

    model_config = ConfigDict(from_attributes=True)


# Service Schemas
class ServiceCreate(SQLModel):
    category_id: UUID | None = None
    name: str
    duration: int
    buffer_time: int = 10
    price: Decimal
    description: str | None = None
    image_url: str | None = None
    is_active: bool = True
    skill_ids: list[UUID]

    @field_validator("skill_ids")
    @classmethod
    def validate_skills_not_empty(cls, v: list[UUID]) -> list[UUID]:
        if not v:
            raise ValueError("Phải chọn ít nhất 1 kỹ năng thực hiện")
        return v

    resource_requirements: list[ServiceResourceRequirementCreate] = []

    @model_validator(mode="after")
    def validate_durations(self) -> Self:
        if self.duration <= 0:
            raise ValueError("Thời gian dịch vụ phải lớn hơn 0")
        if self.buffer_time < 0:
            raise ValueError("Thời gian nghỉ không được âm")
        return self


class ServiceUpdate(SQLModel):
    category_id: UUID | None = None
    name: str | None = None
    duration: int | None = None
    buffer_time: int | None = None
    price: Decimal | None = None
    description: str | None = None
    image_url: str | None = None
    is_active: bool | None = None
    skill_ids: list[UUID] | None = None
    resource_requirements: list[ServiceResourceRequirementCreate] | None = None

    @field_validator("skill_ids")
    @classmethod
    def validate_skills_not_empty_update(cls, v: list[UUID] | None) -> list[UUID] | None:
        if v is not None and len(v) == 0:
            raise ValueError("Không thể xóa hết kỹ năng của dịch vụ")
        return v

    @model_validator(mode="after")
    def validate_update_durations(self) -> Self:
        if self.duration is not None and self.duration <= 0:
            raise ValueError("Thời gian dịch vụ phải lớn hơn 0")
        if self.buffer_time is not None and self.buffer_time < 0:
            raise ValueError("Thời gian nghỉ không được âm")
        return self



class ServiceRead(SQLModel):
    id: UUID
    category_id: UUID | None
    name: str
    duration: int
    buffer_time: int
    price: Decimal
    description: str | None = None
    image_url: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ServiceReadWithDetails(ServiceRead):
    """Response đầy đủ kèm category, skills, resource requirements."""
    category: CategoryRead | None = None
    skills: list[SkillRead] = []
    resource_requirements: list[ServiceResourceRequirementRead] = []


class ServiceListResponse(SQLModel):
    data: list[ServiceRead]
    total: int
    page: int
    limit: int
