"""
Staff Profile Model - Thông tin chi tiết nhân viên Spa.
Quan hệ 1-1 với bảng users của Supabase Auth.
"""
from datetime import datetime, timezone
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

from app.modules.skills.models import Skill
from app.modules.staff.link_models import StaffSkillLink

if TYPE_CHECKING:
    from app.modules.scheduling.models import StaffSchedule


class StaffProfile(SQLModel, table=True):
    """
    Hồ sơ nhân viên. Primary Key là user_id từ Supabase Auth.
    Liên kết 1-1 với bảng users (không tạo bảng users riêng, dùng Auth của Supabase).
    """
    __tablename__ = "staff_profiles"

    user_id: UUID = Field(primary_key=True)
    full_name: str = Field(max_length=100)
    title: str = Field(max_length=100, default="Kỹ thuật viên")
    bio: str | None = None
    color_code: str = Field(max_length=7, default="#6366F1")
    is_active: bool = Field(default=True)
    created_at: datetime = Field(
        sa_type=DateTime(timezone=True),
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        sa_type=DateTime(timezone=True),
        default_factory=lambda: datetime.now(timezone.utc)
    )

    # Relationship M-N với Skills
    skills: list[Skill] = Relationship(
        back_populates="staff_members",
        link_model=StaffSkillLink
    )

    # Relationship 1-N với StaffSchedule - Dùng string cho quan hệ liên module hoặc forward ref cùng file
    schedules: list["StaffSchedule"] = Relationship(back_populates="staff")
