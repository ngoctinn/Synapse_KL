"""
Skill Model - Kỹ năng chuyên môn của nhân viên Spa.
Dùng để match dịch vụ với nhân viên có đủ năng lực thực hiện.
"""
from uuid import UUID, uuid4
from typing import TYPE_CHECKING
from datetime import datetime, timezone
from sqlalchemy import DateTime

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.services.models import Service
from app.modules.services.link_models import ServiceRequiredSkill


class Skill(SQLModel, table=True):
    """
    Kỹ năng chuyên môn (VD: MASSAGE_THERAPY, FACIAL_TREATMENT).
    Mỗi dịch vụ yêu cầu một hoặc nhiều skills, nhân viên phải có TẤT CẢ skills đó.
    """
    __tablename__ = "skills"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(max_length=100)
    code: str = Field(max_length=50, unique=True, index=True)
    description: str | None = None
    created_at: datetime = Field(
        sa_type=DateTime(timezone=True),
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        sa_type=DateTime(timezone=True),
        default_factory=lambda: datetime.now(timezone.utc)
    )

    # Relationship: Skill được nhiều Services yêu cầu (M-N qua link table)
    services: list["Service"] = Relationship(
        back_populates="skills",
        link_model=ServiceRequiredSkill
    )

