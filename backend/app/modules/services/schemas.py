"""
Service Schemas - DTOs cho Services API.
"""
from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import ConfigDict, model_validator
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
    skill_ids: list[UUID] = []
    resource_requirements: list[ServiceResourceRequirementCreate] = []

    @model_validator(mode="after")
    def validate_durations(self) -> Self:
        if self.duration <= 0:
            raise ValueError("Thời gian dịch vụ phải lớn hơn 0")
        if self.buffer_time < 0:
            raise ValueError("Thời gian nghỉ không được âm")

        # Validate resource requirements
        for req in self.resource_requirements:
            usage = req.usage_duration if req.usage_duration is not None else (self.duration - req.start_delay)
            if req.start_delay < 0:
                raise ValueError("Start delay không được âm")
            if usage <= 0:
                raise ValueError("Thời gian sử dụng tài nguyên phải lớn hơn 0")
            if req.start_delay + usage > self.duration:
                raise ValueError(
                    f"Tài nguyên với group_id {req.group_id} có tổng thời gian sử dụng "
                    f"({req.start_delay} + {usage}) vượt quá thời gian dịch vụ ({self.duration})"
                )
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

    @model_validator(mode="after")
    def validate_update_durations(self) -> Self:
        if self.duration is not None and self.duration <= 0:
            raise ValueError("Thời gian dịch vụ phải lớn hơn 0")
        if self.buffer_time is not None and self.buffer_time < 0:
            raise ValueError("Thời gian nghỉ không được âm")

        # Lưu ý: Việc validate resource_requirements so với duration trong Update
        # phức tạp hơn vì duration có thể không được truyền lên (giữ nguyên cũ).
        # Tạm thời validate logic nội bộ của resource_requirements.
        if self.resource_requirements:
            for req in self.resource_requirements:
                if req.start_delay < 0:
                    raise ValueError("Start delay không được âm")
                if req.usage_duration is not None and req.usage_duration <= 0:
                    raise ValueError("Thời gian sử dụng tài nguyên phải lớn hơn 0")
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
